# Privacy data inventory

Reviewed 24 November 2026. This inventory describes the current repository, not unverified production provider settings. Client and legal approval is still required.

## Collection points

| Collection point | Data | Purpose | Destination | Public exposure | Notes |
| --- | --- | --- | --- | --- | --- |
| Contact form | Topic, name, email, message, submission identifier, honeypot field | Deliver and answer an enquiry; limit spam | Resend and approved destination inbox | None intended | Server validation, same-origin check, size limit, rate limit, and privacy-safe logs are implemented |
| Contact rate limit | One-way HMAC of network address | Limit automated abuse | Upstash Redis | None | Key expires after the configured ten-minute window; raw address is not intentionally stored by application code |
| Loyalty registration | First name, email, optional marketing choice | Create and recover a loyalty card; record optional consent | Supabase | Public card responses exclude email and consent | Choice, timestamp, wording version, and source are added by the Stage 3 migration |
| Loyalty card | Private public-code URL, first name, member code, bean and reward balances, created date | Show a customer their card | Supabase and browser local storage | Available to anyone who possesses the long private URL | Page is excluded from search indexing; customer should treat the URL like a private card |
| Staff loyalty desk | Individual username, display name, role, password hash, session-token hash, action history, and secure session cookie | Authorise and attribute in-store loyalty actions | Supabase and HTTP-only cookie | None | Authenticated staff can view the minimum customer details needed for card operations; access should be limited and reviewed |
| Google Wallet, optional | First name, member code, QR code, balances | Create and update a requested digital pass | Google Wallet | Controlled by the customer’s Google account and pass sharing | No data is sent if Wallet is not configured or the customer does not choose the feature |
| Intro experience | Seen flag | Avoid replaying the intro in the same browser session | Browser session storage | None | No customer identity is attached |

## Supabase records

### `loyalty_members`

- Internal UUID, private public code, visible member code
- First name and email
- Bean and reward balances
- Marketing consent state
- Privacy notice version and time shown
- Marketing grant and withdrawal timestamps, wording version, and source
- Created and updated timestamps

### `loyalty_activity`

- Member identifier
- Action type and balance changes
- Action timestamp
- This records operational staff actions and does not duplicate name or email

### `loyalty_consent_events`

- Member identifier
- Consent type and action
- Wording version, source, and event timestamp
- This table is designed as consent evidence. Its approved retention period still needs legal review

### Staff and operational records

- `loyalty_staff` stores username, display name, role, scrypt password hash, active state, and account timestamps.
- `loyalty_staff_sessions` stores only a hash of the random browser session token, expiry, revocation, and timestamps.
- `loyalty_activity` attributes new stamp, redemption, and undo records to an individual staff account and idempotency key. Legacy actions remain visibly unattributed.
- `loyalty_wallet_sync_queue` contains member identifiers and privacy-safe error codes needed to retry Wallet balance synchronization.

Row-level security is enabled. Anonymous and authenticated browser roles are revoked; server-side service-role access is used. Loyalty balance functions use row locks for concurrent updates. Production policies and grants must be verified after every migration.

## Providers and configuration requiring confirmation

| Provider | Data role | Confirmation required |
| --- | --- | --- |
| Production host | Website and API infrastructure | Provider, region, request and function logs, retention, data processing terms, international transfers |
| Supabase | Loyalty database | Project region, backups, log settings, retention, processor terms, access list |
| Resend | Contact email delivery | Account owner, sending and receiving addresses, message retention, processor terms, access list |
| Upstash | Rate limiting | Database region, key retention, processor terms |
| Google Wallet | Optional loyalty pass | Issuer ownership, Google account access, object deletion process, applicable terms and transfers |

## Logging and analytics review

- Contact failures use event codes and technical status only. Enquiry contents, names, emails, and raw network addresses are not intentionally logged.
- Loyalty and Wallet failures use action, status, and provider-neutral codes rather than raw error objects.
- No advertising pixels or general-purpose analytics libraries were found in the current repository.
- Hosting, email, database, rate-limit, and Google services may create their own operational logs. Their live settings cannot be verified from the repository.

## Retention status

No final retention schedule is approved. The application enforces only the short rate-limit expiry and browser storage behaviour. Contact messages, loyalty accounts, consent evidence, provider logs, and backups need approved periods and an assigned deletion owner before launch. See `docs/privacy-operations.md` for the proposed workflow.
