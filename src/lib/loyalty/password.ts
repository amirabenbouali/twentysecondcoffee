import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;

export function hashStaffPassword(password: string) {
  if (password.length < 12 || password.length > 200) {
    throw new Error("Staff passwords must contain between 12 and 200 characters.");
  }

  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: 64 * 1024 * 1024,
  });

  return [
    "scrypt",
    COST,
    BLOCK_SIZE,
    PARALLELISM,
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join("$");
}

export function verifyStaffPassword(password: string, encoded: string) {
  const [algorithm, cost, blockSize, parallelism, saltValue, hashValue] =
    encoded.split("$");
  if (
    algorithm !== "scrypt" ||
    Number(cost) !== COST ||
    Number(blockSize) !== BLOCK_SIZE ||
    Number(parallelism) !== PARALLELISM ||
    !saltValue ||
    !hashValue ||
    password.length > 200
  ) {
    return false;
  }

  try {
    const expected = Buffer.from(hashValue, "base64url");
    const actual = scryptSync(password, Buffer.from(saltValue, "base64url"), expected.length, {
      N: COST,
      r: BLOCK_SIZE,
      p: PARALLELISM,
      maxmem: 64 * 1024 * 1024,
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
