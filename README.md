# twenty second coffee

The website for **twenty second coffee**, a community coffee shop in Royal Wharf, London. It includes the menu, events, the shop's story, and a way for customers to get in touch, leave feedback, or reach the team about opportunities.

**Live repo:** [github.com/amirabenbouali/twentysecondcoffee](https://github.com/amirabenbouali/twentysecondcoffee)

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- No external UI, animation, or CMS libraries. The motion system and visual identity are hand-built to keep the project lean

## Features

- **Home, Menu, Loyalty, Events, About, Contact** pages
- A website-managed loyalty scheme with customer QR cards, nine-bean rewards, and a protected staff desk
- A contact form (feedback / event ideas / business opportunities) posting to an API route
- A visual identity sourced directly from the shop's logo, with extracted brand colors, a hand-drawn coffee-ring motif, and a script accent font
- An entrance/scroll animation system (staggered reveals, a coffee-ring "draw-in" effect, a scroll-aware header) that fully respects `prefers-reduced-motion`
- Editorial, non-templated layouts: a scrolling brand ticker, an asymmetric bento grid, ticket-stub event cards, torn-paper section dividers

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
npm run test    # automated tests
```

## Editing content

Most day-to-day content lives in plain data files, not scattered across components:

| What                          | File                     |
| ------------------------------ | ------------------------ |
| Shop name, address, hours, contact info | `src/data/site.ts` |
| Menu items and prices          | `src/data/menu.ts`       |
| Upcoming events                | `src/data/events.ts`     |

## Loyalty cards

The loyalty feature is independent of Square. Customers join at `/loyalty`, keep a private QR card on their phone, and staff manage beans and rewards from `/staff/loyalty` after confirming payment at the till.

The rules currently award a free standard coffee after nine qualifying purchases. Alternative milks, syrups, and other extras remain chargeable.

### Database setup

1. Create a Supabase project for staging. Do not begin with the live customer database.
2. Open its SQL editor and run the migrations in filename order. Review and test each migration in a non-production project first.
3. Copy `.env.example` to `.env.local`.
4. Add the project URL and service role key from the Supabase project settings.
5. Configure Upstash and generate a separate `LOYALTY_RATE_LIMIT_SECRET` with `openssl rand -base64 32`.
6. Run `npm run loyalty:hash-password` in an interactive terminal for each staff member.
7. Insert the resulting hash, a lower-case username, display name, and approved role into `loyalty_staff`. Never store the plaintext password.
8. Run the staging integration suite and real-device workflow before preparing any production migration.

The service role key is server-only and must never use a `NEXT_PUBLIC_` prefix. Row level security is enabled, and only server-side routes can read or change loyalty records.

The Stage 3 migration, `supabase/migrations/20261124000000_add_loyalty_consent_audit.sql`, adds versioned privacy and marketing choices plus an append-only consent event history. The Stage 4 migration, `supabase/migrations/20261124010000_harden_loyalty_operations.sql`, adds individual staff accounts, revocable sessions, roles, action attribution, idempotency, paginated search, exact scan lookup, and a durable Wallet queue. Apply approved migrations before deploying matching application code. They have not been applied automatically.

Example staging staff insert after generating a password hash:

```sql
insert into public.loyalty_staff (username, display_name, role, password_hash)
values ('approved.username', 'Approved Display Name', 'barista', 'paste-scrypt-hash-here');
```

Managers can undo actions and inspect the attributed action history. Baristas can search, scan, stamp, and redeem. The client must approve each person and role before an account is created.

### Staging integration tests

The integration test creates only synthetic `example.invalid` records and removes them when it finishes. It refuses to run without dedicated staging variables and an explicit mutation confirmation:

```bash
npm run test:staging:loyalty
```

Local staging setup is documented in `docs/staging-configuration.md`. The dedicated `check:staging:loyalty`, `dev:staging`, `test:staging:loyalty`, and `migrate:staging:loyalty` commands explicitly load their ignored local environment files. Values from those files override same-named variables inherited from the shell, and placeholders are rejected before a child command starts. Before running integration tests, add the approved non-secret staging project reference to `config/loyalty-staging-projects.json`. Configure `LOYALTY_PRODUCTION_SUPABASE_PROJECT_REF`, the dedicated `LOYALTY_STAGING_*` variables, and `ALLOW_STAGING_LOYALTY_MUTATIONS=STAGING_ONLY` in `.env.staging.integration.local`. The validator rejects missing references, production targets, non-allowlisted targets, and URLs that do not exactly match the approved staging reference. It never includes credentials in error output.

Migration application has a separate interactive guard. Configure `ALLOW_STAGING_MIGRATIONS=STAGING_ONLY`, then run `npm run migrate:staging:loyalty`. The wrapper validates the same target, performs a Supabase dry run, and requires the exact project-specific confirmation phrase before invoking the real push. Do not bypass this wrapper for Stage 4. Never supply production credentials to either command. The Stage 4 rollout and release gates are in `docs/stage-4-loyalty-production-plan.md`.

### Google Wallet

Google Wallet is optional. The button remains hidden until all four Google Wallet variables in `.env.example` are configured.

1. Create a Google Wallet API Issuer account in the Google Pay and Wallet Console.
2. Create a Loyalty Class in the Business Console using the shop name, logo, programme name, and the background colour `#a51f1b`.
3. Note the numeric issuer ID and the class suffix.
4. Create a Google Cloud service account, enable the Google Wallet API, and authorise that service account in the Wallet Console.
5. Add the issuer ID, class suffix, service account email, and private key to the local and production environment variables.
6. Add a test customer in demo mode, save a test pass, and then request Google publishing access.

Each pass contains the customer name, card code, bean balance, reward balance, and an opaque QR payload. The site uses Google’s official Great Britain English button asset without altering its proportions or styling. Staff actions queue Wallet synchronization in the same database transaction. Inline synchronization is attempted immediately, and a protected scheduler retries temporary failures without blocking an in-shop loyalty action.

Configure the hosting scheduler to request `/api/internal/loyalty/wallet-sync` with `Authorization: Bearer <CRON_SECRET>`. Use a separate secret of at least 32 random characters. Google Wallet must be tested in demo mode with test Google accounts before publishing access is requested.

### Add to Home Screen

Every customer card serves its own web app manifest. On iPhone, the **Save to home screen** button shows the Safari steps and the installed icon reopens that customer’s private card directly. Compatible browsers with a native install prompt use that prompt automatically. This option does not require an Apple Developer account.

Editing one of these files and redeploying is enough to update the menu, hours, or events. No component changes are required.

## Contact form

The form at `/contact` validates submissions on the server and sends accepted messages through Resend. It uses an invisible honeypot, same-origin checks, request-size limits, and a distributed Upstash Redis rate limit of five attempts per ten minutes. Submitted personal data is never written to application logs.

### Contact form setup

1. Create a Resend account and verify a sending domain owned by the cafe.
2. Create a server-side Resend API key.
3. Ask the cafe owner to approve the destination inbox and public fallback email.
4. Create an Upstash Redis database for distributed rate limiting.
5. Copy the contact variables from `.env.example` into `.env.local` and the hosting provider's encrypted environment settings.
6. Generate `CONTACT_RATE_LIMIT_SECRET` with `openssl rand -base64 32`.
7. Send a test message only after the owner has approved the destination address.

`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `UPSTASH_REDIS_REST_TOKEN`, and `CONTACT_RATE_LIMIT_SECRET` are server-only. Never give them a `NEXT_PUBLIC_` prefix. The API returns success only after Resend returns an accepted email ID. If delivery or rate limiting is not configured, it fails safely and does not claim that the message was received.

## Privacy and data requests

The draft privacy notice is available at `/privacy`. It deliberately marks legal and client decisions that still need confirmation and must not be treated as a final legal notice. Contact and loyalty forms link to it, and privacy requests can be started at `/contact?topic=privacy`.

Loyalty membership and marketing are separate choices. Marketing starts unchecked, and the database migration records the choice, timestamp, wording version, and source. The internal access, correction, withdrawal, and deletion procedure is documented in `docs/privacy-operations.md`.

The repository-level collection points, database fields, processors, public exposure, and outstanding provider checks are recorded in `docs/privacy-data-inventory.md`.

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── menu/page.tsx
│   ├── events/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── api/contact/route.ts  # contact form submission handler
│   ├── layout.tsx            # fonts, metadata, header/footer shell
│   └── globals.css           # theme tokens + motion system
├── components/                # Header, Footer, ContactForm, EventCard,
│                               # CoffeeRing, Marquee, TornEdge, Reveal
└── data/                      # site.ts, menu.ts, events.ts
```

## Deployment

Any Next.js host works. [Vercel](https://vercel.com/new) is the path of least resistance for this project. Connect the GitHub repo and it deploys on every push to `main`.
