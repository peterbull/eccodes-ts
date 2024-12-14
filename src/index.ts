import { promisify } from "util";
import { exec as execCallback, ExecOptions } from "child_process";

const exec = promisify(execCallback);

const DEFAULT_EXEC_OPTIONS: ExecOptions = {
  maxBuffer: 1024 * 1024 * 100,
  timeout: 30000,
};

export interface StdOutMsg {
  messages: GribMessage[];
}

export interface GribMessage {
  [key: string]: any;
}

export class EccodesWrapper {
  constructor(
    private gribFilePath: string,
    private execOptions: ExecOptions = DEFAULT_EXEC_OPTIONS
  ) {
    if (!gribFilePath) {
      throw new Error("GRIB file path is required");
    }
  }

  async readToJson(): Promise<StdOutMsg> {
    try {
      const { stdout } = await exec(
        `grib_dump -j ${this.gribFilePath}`,
        this.execOptions
      );
      return JSON.parse(stdout);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("maxBuffer")) {
          throw new Error(
            "GRIB file too large. Consider processing in smaller chunks or increasing buffer size."
          );
        }
        if (error.message.includes("ENOENT")) {
          throw new Error("GRIB file not found");
        }
      }
      throw new Error(`Failed to read GRIB file: ${error}`);
    }
  }

  async getKeys(keys: string[]): Promise<string> {
    if (!keys.length) {
      throw new Error("At least one key must be specified");
    }

    try {
      const { stdout } = await exec(
        `grib_get -p ${keys.join(",")} ${this.gribFilePath}`,
        this.execOptions
      );
      return stdout.trim();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("ENOENT")) {
          throw new Error("GRIB file not found");
        }
      }
      throw new Error(`Failed to get keys: ${error}`);
    }
  }
}
