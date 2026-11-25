import { randomBytes, scryptSync } from "node:crypto";

function readHidden(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Run this command in an interactive terminal.");
  }
  return new Promise((resolve, reject) => {
    let value = "";
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    function finish(error) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.off("data", onData);
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    }
    function onData(character) {
      if (character === "\u0003") return finish(new Error("Cancelled."));
      if (character === "\r" || character === "\n") return finish();
      if (character === "\u007f") value = value.slice(0, -1);
      else value += character;
    }
    process.stdin.on("data", onData);
  });
}

try {
  const password = await readHidden("Staff password: ");
  const confirmation = await readHidden("Confirm password: ");
  if (password !== confirmation) throw new Error("The passwords do not match.");
  if (password.length < 12 || password.length > 200) {
    throw new Error("Use between 12 and 200 characters.");
  }
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, {
    N: 16_384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  process.stdout.write(
    `scrypt$16384$8$1$${salt.toString("base64url")}$${hash.toString("base64url")}\n`,
  );
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Unable to hash password."}\n`);
  process.exitCode = 1;
}
