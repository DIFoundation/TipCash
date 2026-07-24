import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

export async function runZingo(...args: string[]) {
  const { stdout, stderr } = await exec("zingo-cli", args);

  if (stderr && stderr.trim()) {
    console.warn(stderr);
  }

  return stdout.trim();
}