# Loyalty staging configuration

This procedure prepares local staging validation without storing credentials in
Git. Do not paste completed environment files into chat, tickets, or commits.

## 1. Approve the non-secret target

1. Open `config/loyalty-staging-projects.json`.
2. Add the dedicated staging Supabase project reference to
   `permittedProjectRefs`.
3. Do not add the production project reference.
4. Keep the known production reference available for the deny check below.

The project reference is the value before `.supabase.co` in the project URL.

## 2. Configure the local Next.js preview

Open `.env.staging.local` and replace:

- `SUPABASE_URL`: the dedicated staging project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: the staging service-role key from Supabase.
- `UPSTASH_REDIS_REST_URL`: the REST URL for the separate staging Redis database.
- `UPSTASH_REDIS_REST_TOKEN`: the REST token for that staging database.
- `LOYALTY_RATE_LIMIT_SECRET`: a new random secret of at least 32 characters.
- `CONTACT_RATE_LIMIT_SECRET`: a different random secret of at least 32 characters.
- `CRON_SECRET`: another different random secret of at least 32 characters.

Generate each local secret separately. For example:

```bash
openssl rand -base64 32
```

Do not add a `NEXT_PUBLIC_` prefix to any of these variables.

When configuration is complete, start the preview with:

```bash
npm run dev:staging
```

This command explicitly loads `.env.staging.local`, makes its staging values
override any same-named variables left in the parent shell, and rejects
placeholders before Next.js starts. The normal `npm run dev` command does not
load this dedicated file.

## 3. Configure integration and migration safety

Open `.env.staging.integration.local` and replace:

- `LOYALTY_PRODUCTION_SUPABASE_PROJECT_REF`: the known production project
  reference. It is used only as a deny target.
- `LOYALTY_STAGING_SUPABASE_PROJECT_REF`: the approved staging reference.
- `LOYALTY_STAGING_SUPABASE_URL`: exactly
  `https://<approved-staging-reference>.supabase.co`.
- `LOYALTY_STAGING_SUPABASE_SERVICE_ROLE_KEY`: the staging service-role key.

Leave both approval values as `NOT_APPROVED` until the corresponding operation
has been reviewed and approved:

```text
ALLOW_STAGING_LOYALTY_MUTATIONS=NOT_APPROVED
ALLOW_STAGING_MIGRATIONS=NOT_APPROVED
```

The integration command requires
`ALLOW_STAGING_LOYALTY_MUTATIONS=STAGING_ONLY`. The migration wrapper requires
`ALLOW_STAGING_MIGRATIONS=STAGING_ONLY`, performs a dry run, and then requires
the exact target-specific phrase in an interactive terminal.

## 4. Verify local file protection

These commands must report both files as ignored by `.gitignore`:

```bash
git check-ignore -v .env.staging.local .env.staging.integration.local
git status --short
```

Neither file should appear in `git status`.

## 5. Verify the target without making a remote request

Before any remote command:

1. Confirm the staging URL contains the staging project reference exactly.
2. Confirm the production and staging references differ.
3. Confirm only the staging reference is in the allowlist.
4. Confirm every Supabase key came from the staging project dashboard.
5. Confirm the Upstash values came from the separate staging database.
6. Confirm no completed environment file is staged by Git.

Then run the local-only validator:

```bash
npm run check:staging:loyalty
```

It checks the production deny reference, staging reference, allowlist, exact URL,
and staging key presence. It prints only the non-secret approved staging
reference and does not make a network request.

Do not run the integration or migration commands until their specific approval
values have been deliberately changed and the operation has been approved.
