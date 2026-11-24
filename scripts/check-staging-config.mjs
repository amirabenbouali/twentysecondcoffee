import { readFile } from "node:fs/promises";
import { stdout } from "node:process";
import { validateStagingTarget } from "./staging-target-safety.mjs";

const allowlistPath = new URL("../config/loyalty-staging-projects.json", import.meta.url);
const allowlist = JSON.parse(await readFile(allowlistPath, "utf8"));
const target = validateStagingTarget({
  productionProjectRef: process.env.LOYALTY_PRODUCTION_SUPABASE_PROJECT_REF,
  stagingProjectRef: process.env.LOYALTY_STAGING_SUPABASE_PROJECT_REF,
  stagingUrl: process.env.LOYALTY_STAGING_SUPABASE_URL,
  permittedProjectRefs: allowlist.permittedProjectRefs,
  requireServiceRoleKey: true,
  hasServiceRoleKey: Boolean(process.env.LOYALTY_STAGING_SUPABASE_SERVICE_ROLE_KEY),
});

stdout.write(
  `Local staging safety checks passed for allowlisted project ${target.stagingProjectRef}. No remote request was made.\n`,
);
