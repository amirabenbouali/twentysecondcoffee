import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { fileURLToPath } from "node:url";
import {
  isMigrationConfirmationExact,
  migrationConfirmationPhrase,
  validateStagingTarget,
} from "./staging-target-safety.mjs";

const supabaseExecutable = fileURLToPath(
  new URL("../node_modules/.bin/supabase", import.meta.url),
);

function runSupabase(arguments_) {
  const result = spawnSync(supabaseExecutable, arguments_, {
    stdio: "inherit",
    env: process.env,
  });
  if (result.error || result.status !== 0) {
    throw new Error("The Supabase command did not complete successfully.");
  }
}

if (!stdin.isTTY || !stdout.isTTY) {
  throw new Error("Staging migrations require an interactive terminal.");
}

const allowlistPath = new URL("../config/loyalty-staging-projects.json", import.meta.url);
const allowlist = JSON.parse(await readFile(allowlistPath, "utf8"));
const target = validateStagingTarget({
  productionProjectRef: process.env.LOYALTY_PRODUCTION_SUPABASE_PROJECT_REF,
  stagingProjectRef: process.env.LOYALTY_STAGING_SUPABASE_PROJECT_REF,
  stagingUrl: process.env.LOYALTY_STAGING_SUPABASE_URL,
  permittedProjectRefs: allowlist.permittedProjectRefs,
  requiredApproval: "STAGING_ONLY",
  approval: process.env.ALLOW_STAGING_MIGRATIONS,
});

stdout.write(`Validated allowlisted staging project: ${target.stagingProjectRef}\n`);
stdout.write("Running a migration dry run. No migration will be applied in this step.\n");
runSupabase(["db", "push", "--dry-run", `--remote=${target.stagingProjectRef}`]);

const phrase = migrationConfirmationPhrase(target.stagingProjectRef);
const prompt = createInterface({ input: stdin, output: stdout });
const confirmation = await prompt.question(
  `Review the dry run above. To continue, type exactly:\n${phrase}\n> `,
);
prompt.close();

if (!isMigrationConfirmationExact(confirmation, target.stagingProjectRef)) {
  throw new Error("Confirmation did not match. No migration was applied.");
}

stdout.write(`Applying migrations to approved staging project ${target.stagingProjectRef}.\n`);
runSupabase(["db", "push", `--remote=${target.stagingProjectRef}`]);
