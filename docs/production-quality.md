# Production quality and launch validation

## Website configuration

Set `SITE_URL` to the café's approved bare HTTPS origin in the production deployment environment before building. Leave it unset on development and staging. The application omits canonical URLs and sitemap entries and sends non-indexing metadata when this setting is absent or invalid. Vercel preview deployments are kept out of search even if a production origin is inherited. On other hosts, scope the variable to the production environment.

After an approved deployment, verify each canonical, the sitemap, robots.txt and the social card on the actual custom domain. Check that the root structured data matches the public address and map listing. Confirm the owner-approved hours, phone, public email and social links before expanding structured data. Keep the privacy draft out of search until its legal review is complete.

## Security and operations

- Staging credentials previously present in the example file need provider-side rotation. Update ignored local staging configuration with replacement credentials, and keep the example file limited to placeholders.
- Private loyalty cards use bearer links by design. The website sets private no-store, no-referrer and noindex headers for sensitive routes. Configure platform/CDN access logs to redact card path parameters, query strings and request bodies where possible. Restrict log access and retention. Keep third-party analytics off private pages.
- The enforced CSP preserves static rendering and Next.js hydration by allowing same-origin scripts and inline bootstrap scripts. It blocks arbitrary remote scripts, plugin objects, external forms and framing. Nonce or hash-based script enforcement remains a separate decision because it affects rendering and cache behaviour. Scanner camera access is limited to the staff desk.
- Enable `APP_OPERATIONAL_LOGS=1` if the production host log drain can alert on structured error events. The app hook records route templates and categories and skips request URLs, headers and error text. Provider or platform diagnostics may have their own data collection settings. Alert on elevated contact delivery/rate-limit failures, loyalty operations returning 503, and Wallet queue failures. Restrict access and agree retention before enabling any external monitoring or log forwarding.
- Use the [recovery runbook](database-recovery.md) to confirm backup ownership, recovery targets and a synthetic restore drill.

## Local checks

Run `npm ci`, `npm audit`, `npm run lint`, `npm run typecheck` and `npm test` on Node 24. Run `npx playwright install chromium`, then `npm run test:e2e`. Playwright builds the production site with an example origin and disables external service credentials. It starts a fresh local server, uses synthetic values and intercepts form delivery in browser tests. Rebuild with the intended environment before using `npm start` outside the test suite. The GitHub workflow runs the same checks on the hosted runner, without staging credentials or database writes.

## Manual release gates

- Approve the privacy notice and the production origin. Confirm the café's public phone/hours and approved enquiry inbox.
- Finish the separately approved Stage 4 staging database and loyalty validation. Test scanning over HTTPS on iPhone and Android, camera denial, manual lookup, Google Wallet demo account and retry behaviour.
- Verify Resend acceptance and receipt at the approved café inbox, including a provider-side failure case. Verify Upstash isolation and verified sender settings.
- Review mobile and desktop with a keyboard and screen reader. Check text over photography and the intro on a slower phone in both reduced-motion and normal modes. Collect real-user Core Web Vitals after launch with an approved privacy setup.

## Local validation on 26 November 2026

- The initial and final npm registry audits reported zero advisories. Next.js remains on 16.4.6 and React on 19.2.8. No framework upgrade was required by the audit.
- TypeScript, ESLint and 62 unit tests passed. Twenty-eight local Chromium checks passed on desktop and emulated mobile, including 12 axe scans on the six public pages. Turbopack hit a local worker port restriction, so the project build and browser suite use the verified webpack build path.
- The localhost homepage measurements used Chromium with reduced motion and no network throttling. Largest Contentful Paint was 168 ms on desktop and 60 ms on emulated mobile. Cumulative Layout Shift was 0 in both samples. The optimised hero transferred about 42 KiB and the page loaded three WOFF2 fonts. Interaction to Next Paint and real-user percentiles were unavailable.
- The browser suite verified contact failure and confirmed acceptance using mocked responses, loyalty failure with blocked storage, demo QR rendering, unauthorised staff access, cache and scanner policy headers, and production metadata using a synthetic origin. Hosted CI, real provider delivery, Stage 4 integration evidence and device checks remain pending.

## Files changed

| Area | Files |
| --- | --- |
| Search and sharing | `src/lib/seo.ts`, `src/data/site.ts`, `src/app/layout.tsx`, six public `page.tsx` files, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/opengraph-image/route.tsx` |
| Security and reliability | `next.config.ts`, `.env.example`, `src/instrumentation.ts`, `src/lib/contact/handler.ts`, `ContactForm.tsx`, `JoinForm.tsx`, `StaffLogin.tsx` |
| Performance | `src/components/CoffeeBeanIntro.tsx` |
| Verification | `package.json`, `package-lock.json`, `.gitignore`, `vitest.config.mts`, `playwright.config.ts`, `tests/seo.test.ts`, `tests/contact-handler.test.ts`, `tests/browser/`, `.github/workflows/quality.yml` |
| Operations | `docs/production-quality.md`, `docs/database-recovery.md` |
