# Stage 4 loyalty production-readiness plan

Prepared 24 November 2026. This plan is for a non-production rollout first. It must not be pointed at the live Supabase project or real customer records.

## Current-state findings

- Registration is server validated and the database email constraint prevents exact duplicates, but the duplicate response reveals that an email exists and case-insensitive legacy duplicates are not explicitly guarded.
- Customer QR codes contain a private card URL. The staff desk has no camera workflow and loads up to 250 full customer records into the page before filtering in the browser.
- Staff share one environment-variable password. The signed cookie identifies no individual, cannot be revoked independently, and cannot attribute actions to a person.
- Stamp, redeem, and undo functions use row locks and transactions, but activity records do not identify staff and retries have no idempotency key.
- Join and login limits use process memory, so limits reset across serverless instances and deployments.
- Google Wallet updates are attempted inline. Failures do not block loyalty actions, but there is no durable retry queue and the current button is a custom recreation rather than Google’s approved asset.
- Database and provider network calls have no explicit timeout in the loyalty data layer.

## Staged implementation

### Stage 4A: staging infrastructure and migration review

1. Create or nominate a Supabase project used only for staging.
2. Configure a separate Upstash Redis database or isolated staging prefix.
3. Use a Google Wallet demo issuer and test accounts only.
4. Add the Stage 4 migration, review every grant and security-definer function, then apply migrations in order to staging.
5. Create synthetic staff and customer records for testing. Never copy production records.

Deliverables:

- Individual staff, session, action attribution, idempotency, search, and Wallet queue schema.
- A password-hash helper for provisioning staff without storing plaintext passwords.
- A staging-only integration test requiring an explicit mutation opt-in.

### Stage 4B: authentication and authorization

1. Replace the shared password cookie with username and password login backed by individual staff rows.
2. Store only scrypt password hashes and SHA-256 session-token hashes.
3. Use random, revocable, expiring database sessions in a secure, HTTP-only, strict same-site cookie.
4. Enforce active staff and role permissions on every server route and inside database mutation functions.
5. Allow baristas to scan, search, stamp, and redeem. Reserve undo and audit access for managers.

### Stage 4C: reliable staff operations

1. Add authenticated exact lookup for opaque QR payloads and visible member codes.
2. Add authenticated cursor-based server search and pagination with a conservative page size.
3. Add a camera scanner with a manual-code fallback.
4. Attach a cryptographically random idempotency key to each action.
5. Keep stamp, redemption, undo, action audit, and Wallet queue insertion in one database transaction.
6. Return clear authentication, permission, duplicate, validation, database, timeout, and network responses without exposing provider details.

### Stage 4D: distributed abuse controls

1. Replace process-memory buckets with Upstash rate limits for join, login, lookup, search, and staff mutations.
2. Pseudonymise network addresses with a dedicated staging or production secret.
3. Fail closed when required rate limiting is unavailable for sensitive routes.

### Stage 4E: Google Wallet resilience

1. Validate the complete Wallet configuration, service-account email, RSA private key, issuer ID, and class suffix.
2. Use Google’s official Great Britain English button asset at its required proportions and minimum size.
3. Put an opaque loyalty scan payload in the Wallet barcode rather than the short visible member code.
4. Record Wallet sync work transactionally and retry through a protected scheduled endpoint.
5. Keep loyalty mutations successful when Google is unavailable and surface only privacy-safe operational codes.

### Stage 4F: verification and release gate

Automated local checks:

- Registration validation and duplicate response behaviour
- Password hashing, authentication, authorization, and session expiry
- Search and scan input validation
- Idempotency propagation and provider failure mapping
- Wallet configuration, save URL, sync success, not-saved, timeout, and retry behaviour

Staging integration checks:

- Case-insensitive duplicate registration
- Staff role enforcement in both API and database functions
- Atomic stamp, redemption, and undo
- Same-key idempotent retries
- Concurrent distinct actions and non-negative reward balances
- Audit attribution and cursor pagination
- Session revocation and expiry
- Wallet queue claim, completion, and retry

Release requires client approval of staff roles, session duration, operational access, and the scanning workflow. It also requires a successful staging migration, synthetic-data integration run, real-device camera test over HTTPS, and Google Wallet demo-mode test.

## External services and configuration

- Separate staging Supabase project and server-only service-role key
- Staging Upstash Redis endpoint and token
- `LOYALTY_RATE_LIMIT_SECRET` of at least 32 random characters
- Google Wallet demo issuer, approved loyalty class, service account, and test Google accounts
- Protected scheduler such as Vercel Cron using `CRON_SECRET`, or an equivalent authenticated scheduler
- HTTPS staging URL for mobile camera and Wallet testing

## Deployment order

1. Complete local tests and review the migration.
2. Apply all migrations to staging only.
3. Provision synthetic staging staff with the password-hash helper.
4. Run staging integration tests with explicit mutation permission.
5. Complete real-device and Wallet demo testing.
6. Review results and obtain approval.
7. Schedule a production migration and application release together. Do not deploy the application before its matching migration.
