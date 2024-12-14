import { promisify } from "util";
import { exec as execCallback, ExecOptions } from "child_process";
import { Grib2Message } from "@/types/types";

const exec = promisify(execCallback);

const DEFAULT_EXEC_OPTIONS: ExecOptions = {
  maxBuffer: 1024 * 1024 * 100,
  timeout: 30000,
};

export interface StdOutMsg {
  messages: Array<GribMessage[]>;
}

export interface GribMessage {
  key: string;
  value: number;
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

  async readToJson(): Promise<Grib2Message[]> {
    try {
      const { stdout } = await exec(
        `grib_dump -j ${this.gribFilePath}`,
        this.execOptions
      );
      const data: StdOutMsg = JSON.parse(stdout);
      const msgObjs = [];
      for (let i = 0; i < data.messages.length; i++) {
        const msgArrs = data.messages[i].map(({ key, value }) => [key, value]);
        msgObjs.push(Object.fromEntries(msgArrs));
      }
      return msgObjs;
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
