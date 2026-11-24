import { describe, expect, it } from "vitest";
import {
  isIncompleteStagingValue,
  isMigrationConfirmationExact,
  migrationConfirmationPhrase,
  StagingTargetSafetyError,
  validateStagingTarget,
} from "../scripts/staging-target-safety.mjs";

const productionRef = "productionref12345678";
const stagingRef = "stagingref12345678901";

function validInput() {
  return {
    productionProjectRef: productionRef,
    stagingProjectRef: stagingRef,
    stagingUrl: `https://${stagingRef}.supabase.co`,
    permittedProjectRefs: [stagingRef],
    requireServiceRoleKey: true,
    hasServiceRoleKey: true,
    requiredApproval: "STAGING_ONLY",
    approval: "STAGING_ONLY",
  };
}

function expectSafetyCode(input: ReturnType<typeof validInput>, code: string) {
  try {
    validateStagingTarget(input);
    throw new Error("Expected the staging target check to fail.");
  } catch (error) {
    expect(error).toBeInstanceOf(StagingTargetSafetyError);
    expect((error as StagingTargetSafetyError & { code: string }).code).toBe(code);
  }
}

describe("loyalty staging target safety", () => {
  it("detects placeholders even when they are embedded in a URL", () => {
    expect(isIncompleteStagingValue("REPLACE_WITH_VALUE")).toBe(true);
    expect(
      isIncompleteStagingValue(
        "https://REPLACE_WITH_STAGING_PROJECT_REF.supabase.co",
      ),
    ).toBe(true);
    expect(isIncompleteStagingValue("NOT_APPROVED")).toBe(true);
    expect(isIncompleteStagingValue("https://stagingref12345678901.supabase.co")).toBe(false);
  });

  it("accepts only a fully configured allowlisted staging target", () => {
    expect(validateStagingTarget(validInput())).toEqual({
      productionProjectRef: productionRef,
      stagingProjectRef: stagingRef,
      url: `https://${stagingRef}.supabase.co`,
    });
  });

  it("rejects a missing production project reference", () => {
    expectSafetyCode(
      { ...validInput(), productionProjectRef: "" },
      "MISSING_OR_INVALID_PRODUCTION_REF",
    );
  });

  it("rejects a missing staging project reference", () => {
    expectSafetyCode(
      { ...validInput(), stagingProjectRef: "" },
      "MISSING_OR_INVALID_STAGING_REF",
    );
  });

  it("rejects using the production project as staging", () => {
    expectSafetyCode(
      {
        ...validInput(),
        stagingProjectRef: productionRef,
        stagingUrl: `https://${productionRef}.supabase.co`,
        permittedProjectRefs: [productionRef],
      },
      "STAGING_REF_IS_PRODUCTION",
    );
  });

  it("rejects a staging project that is not allowlisted", () => {
    expectSafetyCode(
      { ...validInput(), permittedProjectRefs: ["anotherstagingref1234"] },
      "STAGING_REF_NOT_ALLOWLISTED",
    );
  });

  it("rejects an empty or malformed allowlist", () => {
    expectSafetyCode(
      { ...validInput(), permittedProjectRefs: [] },
      "INVALID_OR_EMPTY_STAGING_ALLOWLIST",
    );
  });

  it("rejects an allowlist containing the production reference", () => {
    expectSafetyCode(
      { ...validInput(), permittedProjectRefs: [stagingRef, productionRef] },
      "PRODUCTION_REF_IN_STAGING_ALLOWLIST",
    );
  });

  it("rejects a URL that does not exactly match the staging reference", () => {
    expectSafetyCode(
      { ...validInput(), stagingUrl: "https://differentref12345678.supabase.co" },
      "STAGING_URL_REF_MISMATCH",
    );
  });

  it("rejects missing mutation approval or service-role configuration", () => {
    expectSafetyCode(
      { ...validInput(), approval: "" },
      "MISSING_EXPLICIT_STAGING_APPROVAL",
    );
    expectSafetyCode(
      { ...validInput(), hasServiceRoleKey: false },
      "MISSING_STAGING_SERVICE_ROLE_KEY",
    );
  });

  it("requires the exact project-specific migration confirmation phrase", () => {
    const phrase = migrationConfirmationPhrase(stagingRef);
    expect(phrase).toBe(`APPLY STAGING MIGRATIONS TO ${stagingRef}`);
    expect(isMigrationConfirmationExact(phrase, stagingRef)).toBe(true);
    expect(isMigrationConfirmationExact(phrase.toLowerCase(), stagingRef)).toBe(false);
    expect(isMigrationConfirmationExact(`${phrase} `, stagingRef)).toBe(false);
  });
});
