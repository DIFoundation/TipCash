import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

const ZINGO_BIN = process.env.ZINGO_BIN || "zingo-cli";
const CHAIN = process.env.CHAIN || "testnet"

function walletDir(userId: string) {
  return path.join(process.cwd(), "wallets", userId);
}

export async function runZingo(userId: string, args: string[]) {
  const { stdout, stderr } = await exec(ZINGO_BIN, [
    "--chain",
    CHAIN,
    "--data-dir",
    walletDir(userId),
    ...args,
  ]);

  if (stderr && stderr.trim()) {
    console.warn(stderr);
  }

  return stdout.trim();
}
