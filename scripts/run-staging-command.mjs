import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";
import { isIncompleteStagingValue } from "./staging-target-safety.mjs";

const commands = {
  check: {
    file: ".env.staging.integration.local",
    required: [
      "LOYALTY_PRODUCTION_SUPABASE_PROJECT_REF",
      "LOYALTY_STAGING_SUPABASE_PROJECT_REF",
      "LOYALTY_STAGING_SUPABASE_URL",
      "LOYALTY_STAGING_SUPABASE_SERVICE_ROLE_KEY",
    ],
    arguments: ["scripts/check-staging-config.mjs"],
  },
  preview: {
    file: ".env.staging.local",
    required: [
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
      "LOYALTY_RATE_LIMIT_SECRET",
      "CONTACT_RATE_LIMIT_SECRET",
      "CRON_SECRET",
    ],
    arguments: ["./node_modules/next/dist/bin/next", "dev"],
  },
  integration: {
    file: ".env.staging.integration.local",
    required: [
      "LOYALTY_PRODUCTION_SUPABASE_PROJECT_REF",
      "LOYALTY_STAGING_SUPABASE_PROJECT_REF",
      "LOYALTY_STAGING_SUPABASE_URL",
      "LOYALTY_STAGING_SUPABASE_SERVICE_ROLE_KEY",
      "ALLOW_STAGING_LOYALTY_MUTATIONS",
    ],
    arguments: [
      "./node_modules/vitest/vitest.mjs",
      "run",
      "tests/staging/loyalty.integration.ts",
      "--testTimeout=60000",
      "--hookTimeout=60000",
    ],
  },
  migration: {
    file: ".env.staging.integration.local",
    required: [
      "LOYALTY_PRODUCTION_SUPABASE_PROJECT_REF",
      "LOYALTY_STAGING_SUPABASE_PROJECT_REF",
      "LOYALTY_STAGING_SUPABASE_URL",
      "ALLOW_STAGING_MIGRATIONS",
    ],
    arguments: ["scripts/apply-staging-migrations.mjs"],
  },
};

const mode = process.argv[2];
const command = commands[mode];
if (!command) throw new Error("Unknown staging command.");

let fileValues;
try {
  fileValues = parseEnv(await readFile(command.file, "utf8"));
} catch {
  throw new Error(`Unable to load the required ignored file: ${command.file}`);
}

for (const name of command.required) {
  if (isIncompleteStagingValue(fileValues[name])) {
    throw new Error(`Staging configuration is incomplete: ${name}.`);
  }
}

const result = spawnSync(process.execPath, command.arguments, {
  stdio: "inherit",
  env: { ...process.env, ...fileValues },
});

if (result.error || result.status !== 0) {
  process.exitCode = result.status || 1;
}
