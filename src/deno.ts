import { promisify } from "node:util";
import { exec as execCallback, ExecOptions } from "node:child_process";

export { promisify, execCallback, type ExecOptions };
