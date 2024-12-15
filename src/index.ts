import { spawn } from "child_process";
import * as readline from "readline";
import {
  BaseGrib2Message,
  WaveParameter,
  WindParameter,
  GribParameter,
  ParameterCategory,
  WaveParameterNumber,
  WindParameterNumber,
} from "@/types/types";

const ESSENTIAL_KEYS = [
  "parameterCategory",
  "parameterNumber",
  "parameterName",
  "parameterUnits",
  "shortName",
  "dataDate",
  "dataTime",
  "forecastTime",
  "maximum",
  "minimum",
  "average",
  "values",
].join(",");

const METADATA_KEYS = [
  "gridType",
  "Ni",
  "Nj",
  "latitudeOfFirstGridPointInDegrees",
  "longitudeOfFirstGridPointInDegrees",
  "latitudeOfLastGridPointInDegrees",
  "longitudeOfLastGridPointInDegrees",
  "iDirectionIncrementInDegrees",
  "jDirectionIncrementInDegrees",
  "centre",
  "editionNumber",
  "typeOfGeneratingProcess",
  "generatingProcessIdentifier",
  "numberOfValues",
  "numberOfMissing",
  "getNumberOfValues",
].join(",");

export class EccodesWrapper {
  constructor(private gribFilePath: string) {
    if (!gribFilePath) {
      throw new Error("GRIB file path is required");
    }
  }

  /**
   * Executes grib_dump command to extract data from GRIB files
   * @param whereClause - Optional filter condition for GRIB messages
   * @param specificKeys - Keys to extract from GRIB messages
   * @returns Promise with array of parsed GRIB messages
   */
  private async execGribCommandStream<T extends BaseGrib2Message>(
    whereClause?: string,
    specificKeys: string = ESSENTIAL_KEYS
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const messages: T[] = [];
      let currentMessage: Partial<T> = {};
      let errorOutput = "";
      let currentJsonString = "";

      const whereParam = whereClause ? `-w ${whereClause}` : "";
      const args = ["-j"];
      if (whereParam) args.push(...whereParam.split(" "));
      args.push("-p", specificKeys, this.gribFilePath);

      const process = spawn("grib_dump", args);

      const rl = readline.createInterface({
        input: process.stdout,
        crlfDelay: Infinity,
      });

      rl.on("line", (line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        currentJsonString += trimmedLine;

        if (trimmedLine.endsWith("},") || trimmedLine.endsWith("}")) {
          try {
            const item = JSON.parse(currentJsonString.replace(/,$/, ""));
            if (item.key && item.value !== undefined) {
              currentMessage[item.key] = item.value;
            }
            currentJsonString = "";
          } catch {
            if (Object.keys(currentMessage).length > 0) {
              messages.push({ ...currentMessage } as T);
              currentMessage = {};
            }
          }
        }
      });

      process.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      process.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`grib_dump failed: ${errorOutput}`));
          return;
        }
        if (Object.keys(currentMessage).length > 0) {
          messages.push({ ...currentMessage } as T);
        }

        resolve(messages);
      });

      process.on("error", (error) => {
        reject(new Error(`Failed to spawn grib_dump: ${error.message}`));
      });
    });
  }

  async getSignificantWaveHeight(): Promise<WaveParameter[]> {
    return this.execGribCommandStream<WaveParameter>(
      "parameterCategory=0,parameterNumber=3"
    );
  }

  async getPrimaryWavePeriod(): Promise<WaveParameter[]> {
    return this.execGribCommandStream<WaveParameter>(
      "parameterCategory=0,parameterNumber=11"
    );
  }

  async getPrimaryWaveDirection(): Promise<WaveParameter[]> {
    return this.execGribCommandStream<WaveParameter>(
      "parameterCategory=0,parameterNumber=10"
    );
  }

  async getWindSpeed(): Promise<WindParameter[]> {
    return this.execGribCommandStream<WindParameter>(
      "parameterCategory=2,parameterNumber=1"
    );
  }

  async getWindDirection(): Promise<WindParameter[]> {
    return this.execGribCommandStream<WindParameter>(
      "parameterCategory=2,parameterNumber=0"
    );
  }

  async getWaveParameters(): Promise<WaveParameter[]> {
    return this.execGribCommandStream<WaveParameter>("parameterCategory=0");
  }

  async getWindParameters(): Promise<WindParameter[]> {
    return this.execGribCommandStream<WindParameter>("parameterCategory=2");
  }

  async getParametersByType<T extends GribParameter>(
    category: ParameterCategory,
    paramNumber: WaveParameterNumber | WindParameterNumber,
    keys?: string[]
  ): Promise<T[]> {
    const specificKeys = keys ? keys.join(",") : ESSENTIAL_KEYS;
    return this.execGribCommandStream<T>(
      `parameterCategory=${category},parameterNumber=${paramNumber}`,
      specificKeys
    );
  }

  async getMetadata(): Promise<BaseGrib2Message[]> {
    return this.execGribCommandStream(undefined, METADATA_KEYS);
  }

  async readToJson(): Promise<BaseGrib2Message[]> {
    return this.execGribCommandStream(undefined, ESSENTIAL_KEYS);
  }
}

export type { BaseGrib2Message, WaveParameter, WindParameter, GribParameter };

export { ParameterCategory, WaveParameterNumber, WindParameterNumber };
