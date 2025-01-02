import { spawn } from "child_process";
import * as readline from "readline";
import { Readable } from "stream";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ReadableStream } from "stream/web";
import {
  BaseGrib2Message,
  WaveParameter,
  WindParameter,
  GribParameter,
  Discipline,
} from "@/types/types";
import { ParameterCategory, ParameterNumber } from "@/types/types";
import { OceanographicParameterCategory } from "@/types/discipline/oceanographicProducts/categories";
import { OceanographicWaveParameterNumber } from "@/types/discipline/oceanographicProducts/waves";
import { MeteorologicalMomentumParameterNumber } from "@/types/discipline/meteorologicalProducts/momentum";
import { MeteorologicalParameterCategory } from "@/types/discipline/meteorologicalProducts/categories";
import { LocationForecast } from "@/types/types";

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
  category: ParameterCategory;
  number?: ParameterNumber;
};

type GribParsingOptions = {
  addLatLon?: boolean;
};

type GribParametersByType = CommandStreamParams & {
  keys?: string[];
  addLatLon?: boolean;
};

export class EccodesWrapper {
  private tempFilePath: string | null = null;
  private readonly gribFilePath: string;

  constructor(input: string | Readable | ReadableStream<Uint8Array> | null) {
    if (input === null) {
      throw new Error("Input stream cannot be null");
    }

    if (typeof input === "string") {
      this.gribFilePath = input;
    } else if (input instanceof Readable) {
      this.gribFilePath = this.createTempFile();
      this.handleInputStream(input);
    } else if (input instanceof ReadableStream) {
      this.gribFilePath = this.createTempFile();
      const nodeStream = Readable.fromWeb(input);
      this.handleInputStream(nodeStream);
    } else {
      throw new Error("Invalid input type");
    }
  }

  private createTempFile(): string {
    const tempPath = path.join(os.tmpdir(), `grib-${Date.now()}.grib2`);
    this.tempFilePath = tempPath;
    return tempPath;
  }

  private async handleInputStream(stream: Readable): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(this.gribFilePath);

      stream.pipe(writeStream);

      writeStream.on("finish", resolve);
      writeStream.on("error", (err) => {
        this.cleanup().finally(() => reject(err));
      });
      stream.on("error", (err) => {
        this.cleanup().finally(() => reject(err));
      });
    });
  }

  public async cleanup(): Promise<void> {
    if (this.tempFilePath) {
      try {
        await fs.promises.unlink(this.tempFilePath);
        this.tempFilePath = null;
      } catch (error) {
        console.error("Error cleaning up temporary file:", error);
      }
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
    try {
      return await new Promise((resolve, reject) => {
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
    } finally {
      if (this.tempFilePath) {
        await this.cleanup();
      }
    }
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

  private mapValuesToLatLon(values: number[]): LocationForecast[] {
    const spotForecast: LocationForecast[] = new Array(values.length);
    let index = 0;

    for (let j = 0; j < 721; j++) {
      const lat = 90 - j * 0.25;
      for (let i = 0; i < 1440; i++) {
        const rawLon = i * 0.25;
        const lon = rawLon > 180 ? rawLon - 360 : rawLon;
        spotForecast[index] = {
          lat,
          lon,
          value: values[index],
        };
        index++;
      }
    }
    return spotForecast;
  }

  private addLatLonToGribValues<T extends BaseGrib2Message>(res: T[]) {
    return res.map((val) => ({
      ...val,
      values: Array.isArray(val.values)
        ? this.mapValuesToLatLon(val.values as number[])
        : [],
    }));
  }

  async getSignificantWaveHeight(
    options?: GribParsingOptions
  ): Promise<WaveParameter[]> {
    const res = await this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.SignificantHeightCombined,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getPrimaryWavePeriod(
    options?: GribParsingOptions
  ): Promise<WaveParameter[]> {
    const res = await this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.PrimaryWavePeriod,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getPrimaryWaveDirection(
    options?: GribParsingOptions
  ): Promise<WaveParameter[]> {
    const res = await this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.PrimaryWaveDirection,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getWindSpeed(options?: GribParsingOptions): Promise<WindParameter[]> {
    const res = await this.execGribCommandStream<WindParameter>(
      this.getCommandStreamParams({
        category: MeteorologicalParameterCategory.Momentum,
        number: MeteorologicalMomentumParameterNumber.WindSpeed,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getWindDirection(
    options?: GribParsingOptions
  ): Promise<WindParameter[]> {
    const res = await this.execGribCommandStream<WindParameter>(
      this.getCommandStreamParams({
        category: MeteorologicalParameterCategory.Momentum,
        number: MeteorologicalMomentumParameterNumber.WindDirection,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getWaveParameters(
    options?: GribParsingOptions
  ): Promise<WaveParameter[]> {
    const res = await this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getWindParameters(
    options?: GribParsingOptions
  ): Promise<WindParameter[]> {
    const res = await this.execGribCommandStream<WindParameter>(
      this.getCommandStreamParams({
        category: MeteorologicalParameterCategory.Momentum,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getParametersByType<T extends GribParameter>(
    options: GribParametersByType
  ): Promise<T[]> {
    const specificKeys = options.keys ? options.keys.join(",") : ESSENTIAL_KEYS;
    const res = await this.execGribCommandStream<T>(
      this.getCommandStreamParams(options),
      specificKeys
    );
    return options.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getMetadata(): Promise<BaseGrib2Message[]> {
    return this.execGribCommandStream(undefined, METADATA_KEYS);
  }

  async readToJson(options?: GribParsingOptions): Promise<BaseGrib2Message[]> {
    const res = await this.execFullGribDump();
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  public async dispose(): Promise<void> {
    await this.cleanup();
  }
}
