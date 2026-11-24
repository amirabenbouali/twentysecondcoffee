const PROJECT_REF_PATTERN = /^[a-z0-9]{8,40}$/;

export function isIncompleteStagingValue(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return (
    !normalized ||
    normalized.includes("REPLACE_") ||
    normalized === "NOT_APPROVED"
  );
}

export class StagingTargetSafetyError extends Error {
  constructor(code) {
    super(`Staging target safety check failed: ${code}.`);
    this.name = "StagingTargetSafetyError";
    this.code = code;
  }
}

function requiredProjectRef(value, code) {
  const reference = typeof value === "string" ? value.trim() : "";
  if (!PROJECT_REF_PATTERN.test(reference)) {
    throw new StagingTargetSafetyError(code);
  }
  return reference;
}

function stagingUrl(value, projectRef) {
  let parsed;
  try {
    parsed = new URL(typeof value === "string" ? value.trim() : "");
  } catch {
    throw new StagingTargetSafetyError("INVALID_STAGING_URL");
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== `${projectRef}.supabase.co` ||
    parsed.port ||
    parsed.username ||
    parsed.password ||
    (parsed.pathname !== "/" && parsed.pathname !== "") ||
    parsed.search ||
    parsed.hash
  ) {
    throw new StagingTargetSafetyError("STAGING_URL_REF_MISMATCH");
  }

  return parsed.origin;
}

export function validateStagingTarget(input) {
  const productionProjectRef = requiredProjectRef(
    input.productionProjectRef,
    "MISSING_OR_INVALID_PRODUCTION_REF",
  );
  const stagingProjectRef = requiredProjectRef(
    input.stagingProjectRef,
    "MISSING_OR_INVALID_STAGING_REF",
  );

  if (productionProjectRef === stagingProjectRef) {
    throw new StagingTargetSafetyError("STAGING_REF_IS_PRODUCTION");
  }

  const permittedProjectRefs = Array.isArray(input.permittedProjectRefs)
    ? input.permittedProjectRefs
    : [];
  if (
    permittedProjectRefs.length === 0 ||
    permittedProjectRefs.some((reference) => !PROJECT_REF_PATTERN.test(reference))
  ) {
    throw new StagingTargetSafetyError("INVALID_OR_EMPTY_STAGING_ALLOWLIST");
  }
  if (permittedProjectRefs.includes(productionProjectRef)) {
    throw new StagingTargetSafetyError("PRODUCTION_REF_IN_STAGING_ALLOWLIST");
  }
  if (!permittedProjectRefs.includes(stagingProjectRef)) {
    throw new StagingTargetSafetyError("STAGING_REF_NOT_ALLOWLISTED");
  }

  const url = stagingUrl(input.stagingUrl, stagingProjectRef);

  if (input.requireServiceRoleKey && !input.hasServiceRoleKey) {
    throw new StagingTargetSafetyError("MISSING_STAGING_SERVICE_ROLE_KEY");
  }
  if (input.requiredApproval && input.approval !== input.requiredApproval) {
    throw new StagingTargetSafetyError("MISSING_EXPLICIT_STAGING_APPROVAL");
  }

  return { productionProjectRef, stagingProjectRef, url };
}

export function migrationConfirmationPhrase(stagingProjectRef) {
  return `APPLY STAGING MIGRATIONS TO ${stagingProjectRef}`;
}

export function isMigrationConfirmationExact(value, stagingProjectRef) {
  return value === migrationConfirmationPhrase(stagingProjectRef);
}
