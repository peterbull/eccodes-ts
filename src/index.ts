import { spawn } from "child_process";
import * as readline from "readline";
import {
  BaseGrib2Message,
  WaveParameter,
  WindParameter,
  GribParameter,
  Discipline,
} from "@/types/types";
import { OceanographicParameterCategory } from "@/types/discipline/oceanographicProducts/categories";
import { OceanographicWaveParameterNumber } from "@/types/discipline/oceanographicProducts/waves";
import { MeteorologicalMomentumParameterNumber } from "@/types/discipline/meteorologicalProducts/momentum";
import { MeteorologicalParameterCategory } from "@/types/discipline/meteorologicalProducts/categories";

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

type CommandStreamParams = {
  discipline?: Discipline;
  category: OceanographicParameterCategory | MeteorologicalParameterCategory;
  number?:
    | OceanographicWaveParameterNumber
    | MeteorologicalMomentumParameterNumber;
};

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

      process.on("error", (error) => {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          reject(
            new Error(
              "grib_dump command not found. Please ensure eccodes is installed:\n" +
                "- On MacOS: brew install eccodes\n" +
                "- On Ubuntu: apt-get install libeccodes-dev\n" +
                "- On Windows: Install WSL and use Ubuntu package\n\n" +
                "If already installed, check if grib_dump is in your PATH"
            )
          );
        } else {
          reject(error);
        }
      });

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
            const item: { key: keyof T; value: T[keyof T] } = JSON.parse(
              currentJsonString.replace(/,$/, "")
            );
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

  private async execFullGribDump<T extends BaseGrib2Message>(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      let fullOutput = "";
      let errorOutput = "";

      const process = spawn("grib_dump", ["-j", this.gribFilePath]);

      process.stdout.on("data", (data) => {
        fullOutput += data.toString();
      });

      process.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      process.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`grib_dump failed: ${errorOutput}`));
          return;
        }

        try {
          const data = JSON.parse(fullOutput);
          const messages = data.messages.map(
            (msgArr: Array<{ key: string; value: unknown }>) => {
              const msgEntries = msgArr.map(({ key, value }) => [key, value]);
              return Object.fromEntries(msgEntries);
            }
          );
          resolve(messages as T[]);
        } catch (error) {
          reject(new Error(`Failed to parse GRIB data: ${error}`));
        }
      });

      process.on("error", (error) => {
        reject(new Error(`Failed to spawn grib_dump: ${error.message}`));
      });
    });
  }

  getCommandStreamParams({
    discipline,
    category,
    number,
  }: CommandStreamParams): string {
    const params: string[] = [];

    if (discipline !== undefined) {
      params.push(`discipline=${discipline}`);
    }

    if (category !== undefined) {
      params.push(`parameterCategory=${category}`);
    }

    if (number !== undefined) {
      params.push(`parameterNumber=${number}`);
    }

    return params.join(",");
  }

  async getSignificantWaveHeight(): Promise<WaveParameter[]> {
    return this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.SignificantHeightCombined,
      })
    );
  }

  async getPrimaryWavePeriod(): Promise<WaveParameter[]> {
    return this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.PrimaryWavePeriod,
      })
    );
  }

  async getPrimaryWaveDirection(): Promise<WaveParameter[]> {
    return this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.PrimaryWaveDirection,
      })
    );
  }

  async getWindSpeed(): Promise<WindParameter[]> {
    return this.execGribCommandStream<WindParameter>(
      this.getCommandStreamParams({
        category: MeteorologicalParameterCategory.Momentum,
        number: MeteorologicalMomentumParameterNumber.WindSpeed,
      })
    );
  }

  async getWindDirection(): Promise<WindParameter[]> {
    return this.execGribCommandStream<WindParameter>(
      this.getCommandStreamParams({
        category: MeteorologicalParameterCategory.Momentum,
        number: MeteorologicalMomentumParameterNumber.WindDirection,
      })
    );
  }

  async getWaveParameters(): Promise<WaveParameter[]> {
    return this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
      })
    );
  }

  async getWindParameters(): Promise<WindParameter[]> {
    return this.execGribCommandStream<WindParameter>(
      this.getCommandStreamParams({
        category: MeteorologicalParameterCategory.Momentum,
      })
    );
  }

  async getParametersByType<T extends GribParameter>(
    category: OceanographicParameterCategory,
    paramNumber:
      | OceanographicWaveParameterNumber
      | MeteorologicalMomentumParameterNumber,
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
    return this.execFullGribDump();
  }
}

export type { BaseGrib2Message, WaveParameter, WindParameter, GribParameter };

export {
  OceanographicParameterCategory as ParameterCategory,
  OceanographicWaveParameterNumber as WaveParameterNumber,
  MeteorologicalMomentumParameterNumber as MomentumParameterNumber,
};
