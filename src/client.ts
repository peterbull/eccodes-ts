import { spawn } from "child_process";
import * as readline from "readline";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  BaseGrib2Message,
  CommandStreamParams,
  GribParameter,
  GribParametersByType,
  GribParsingOptions,
  GribResponse,
  InputSource,
  WaveParameter,
  WindParameter,
  WithLatLon,
} from "@/types/types";
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

interface FetchOptions {
  timeout?: number;
  retries?: number;
}

export class EccodesWrapper {
  private tempFilePath: string | null = null;
  private readonly gribFilePath: string;
  private initPromise: Promise<void> | null = null;
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly DEFAULT_RETRIES = 3;

  constructor(input: InputSource) {
    if (!input?.trim()) {
      throw new Error("Input source cannot be empty");
    }

    if (this.isValidUrl(input)) {
      this.gribFilePath = this.createTempFile();
      this.initPromise = this.fetchAndSaveFile(input);
    } else {
      const resolvedPath = this.resolveFilePath(input);
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File not found: ${resolvedPath}`);
      }
      this.gribFilePath = resolvedPath;
    }
  }

  private resolveFilePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }

    const absolutePath = path.resolve(process.cwd(), filePath);

    try {
      const stats = fs.statSync(absolutePath);
      if (!stats.isFile()) {
        throw new Error(`Path exists but is not a file: ${absolutePath}`);
      }
      return absolutePath;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // Try resolving relative to project root if exists
        const projectRoot = this.findProjectRoot(process.cwd());
        if (projectRoot) {
          const projectPath = path.resolve(projectRoot, filePath);
          if (fs.existsSync(projectPath)) {
            return projectPath;
          }
        }
      }
      throw error;
    }
  }

  private findProjectRoot(startPath: string): string | null {
    let currentPath = startPath;
    while (currentPath !== path.parse(currentPath).root) {
      if (fs.existsSync(path.join(currentPath, "package.json"))) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }
    return null;
  }

  private isValidUrl(input: string): boolean {
    try {
      const url = new URL(input);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  public async fetchAndSaveFile(
    url: string,
    options: FetchOptions = {}
  ): Promise<void> {
    const {
      timeout = EccodesWrapper.DEFAULT_TIMEOUT,
      retries = EccodesWrapper.DEFAULT_RETRIES,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        await fs.promises.writeFile(
          this.gribFilePath,
          Buffer.from(arrayBuffer)
        );

        // Ensure file is fully written
        const fd = await fs.promises.open(this.gribFilePath, "r");
        await fd.sync();
        await fd.close();

        return;
      } catch (error) {
        lastError = error as Error;
        if (attempt === retries) {
          await this.cleanup();
          throw new Error(
            `Failed to fetch GRIB file after ${retries} attempts: ${lastError.message}`
          );
        }
        // Wait before retry with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  private createTempFile(): string {
    const tempPath = path.join(
      os.tmpdir(),
      `grib-${Date.now()}-${Math.random().toString(36).slice(2)}.grib2`
    );
    this.tempFilePath = tempPath;
    return tempPath;
  }

  private async execGribCommandStream<T extends BaseGrib2Message>(
    whereClause?: string,
    specificKeys: string = ESSENTIAL_KEYS
  ): Promise<T[]> {
    if (this.initPromise) {
      await this.initPromise;
    }

    // Verify file exists and is readable
    try {
      await fs.promises.access(this.gribFilePath, fs.constants.R_OK);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`GRIB file not accessible: ${error.message}`);
      } else {
        throw new Error("GRIB file not accessible");
      }
    }

    // Continue with command execution
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
        } as LocationForecast;
        index++;
      }
    }
    return spotForecast;
  }

  private addLatLonToGribValues<T extends BaseGrib2Message>(
    res: T[]
  ): WithLatLon<T>[] {
    return res.map((val) => {
      const transformed: WithLatLon<T> = {
        ...val,
        values: Array.isArray(val.values)
          ? this.mapValuesToLatLon(val.values as number[])
          : [],
      } as WithLatLon<T>;
      return transformed;
    });
  }

  async getSignificantWaveHeight(options: {
    addLatLon: true;
  }): Promise<WithLatLon<WaveParameter>[]>;
  async getSignificantWaveHeight(options?: {
    addLatLon?: false;
  }): Promise<WaveParameter[]>;
  async getSignificantWaveHeight(options?: {
    addLatLon?: boolean;
  }): Promise<WaveParameter[] | WithLatLon<WaveParameter>[]> {
    const res = await this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.SignificantHeightCombined,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getPrimaryWavePeriod(options: {
    addLatLon: true;
  }): Promise<WithLatLon<WaveParameter>[]>;
  async getPrimaryWavePeriod(options?: {
    addLatLon?: false;
  }): Promise<WaveParameter[]>;
  async getPrimaryWavePeriod(options?: {
    addLatLon?: boolean;
  }): Promise<WaveParameter[] | WithLatLon<WaveParameter>[]> {
    const res = await this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.PrimaryWavePeriod,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getPrimaryWaveDirection(options: {
    addLatLon: true;
  }): Promise<WithLatLon<WaveParameter>[]>;
  async getPrimaryWaveDirection(options?: {
    addLatLon?: false;
  }): Promise<WaveParameter[]>;
  async getPrimaryWaveDirection(options?: {
    addLatLon?: boolean;
  }): Promise<WaveParameter[] | WithLatLon<WaveParameter>[]> {
    const res = await this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
        number: OceanographicWaveParameterNumber.PrimaryWaveDirection,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getWindSpeed(options: {
    addLatLon: true;
  }): Promise<WithLatLon<WindParameter>[]>;
  async getWindSpeed(options?: { addLatLon?: false }): Promise<WindParameter[]>;
  async getWindSpeed(options?: {
    addLatLon?: boolean;
  }): Promise<WindParameter[] | WithLatLon<WindParameter>[]> {
    const res = await this.execGribCommandStream<WindParameter>(
      this.getCommandStreamParams({
        category: MeteorologicalParameterCategory.Momentum,
        number: MeteorologicalMomentumParameterNumber.WindSpeed,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }
  async getWindDirection(options: {
    addLatLon: true;
  }): Promise<WithLatLon<WindParameter>[]>;
  async getWindDirection(options?: {
    addLatLon?: false;
  }): Promise<WindParameter[]>;
  async getWindDirection(options?: {
    addLatLon?: boolean;
  }): Promise<WindParameter[] | WithLatLon<WindParameter>[]> {
    const res = await this.execGribCommandStream<WindParameter>(
      this.getCommandStreamParams({
        category: MeteorologicalParameterCategory.Momentum,
        number: MeteorologicalMomentumParameterNumber.WindDirection,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getWaveParameters(options: {
    addLatLon: true;
  }): Promise<WithLatLon<WaveParameter>[]>;
  async getWaveParameters(options?: {
    addLatLon?: false;
  }): Promise<WaveParameter[]>;
  async getWaveParameters(
    options?: GribParsingOptions
  ): Promise<GribResponse<WaveParameter, GribParsingOptions>> {
    const res = await this.execGribCommandStream<WaveParameter>(
      this.getCommandStreamParams({
        category: OceanographicParameterCategory.Waves,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getWindParameters(options: {
    addLatLon: true;
  }): Promise<WithLatLon<WindParameter>[]>;
  async getWindParameters(options?: {
    addLatLon?: false;
  }): Promise<WindParameter[]>;
  async getWindParameters(
    options?: GribParsingOptions
  ): Promise<GribResponse<WindParameter, GribParsingOptions>> {
    const res = await this.execGribCommandStream<WindParameter>(
      this.getCommandStreamParams({
        category: MeteorologicalParameterCategory.Momentum,
      })
    );
    return options?.addLatLon ? this.addLatLonToGribValues(res) : res;
  }

  async getParametersByType<T extends GribParameter>(
    options: GribParametersByType & { addLatLon: true }
  ): Promise<WithLatLon<T>[]>;
  async getParametersByType<T extends GribParameter>(
    options: Omit<GribParametersByType, "addLatLon"> & { addLatLon?: false }
  ): Promise<T[]>;
  async getParametersByType<T extends GribParameter>(
    options: GribParametersByType
  ): Promise<GribResponse<T, GribParametersByType>> {
    const specificKeys = options.keys ? options.keys.join(",") : ESSENTIAL_KEYS;
    const res = await this.execGribCommandStream<T>(
      this.getCommandStreamParams(options),
      specificKeys
    );
    return (
      options.addLatLon ? this.addLatLonToGribValues(res) : res
    ) as GribResponse<T, GribParametersByType>;
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
}
