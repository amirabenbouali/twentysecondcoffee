# Privacy operations draft

This is an internal operating draft for Twenty Second Coffee. It is not legal advice and must be reviewed with the client and an appropriate legal adviser before launch.

## Decisions required before launch

- Confirm the legal entity or sole trader responsible for the website.
- Approve a monitored privacy contact email and the person responsible for requests.
- Approve retention periods for enquiries, loyalty accounts, consent evidence, provider records, logs, and backups.
- Confirm lawful bases and document any legitimate-interests assessments.
- Confirm the website host, service regions, processor agreements, international transfer arrangements, and provider retention settings.
- Confirm whether marketing will launch, which service will send it, and how unsubscribe and suppression records will work.
- Confirm how requests from or about children will be handled.
- Check whether an ICO data protection fee or registration is required.

## Request intake

1. Customers use `/contact?topic=privacy` and select “Privacy or data request”.
2. The designated privacy owner records the request in an access-controlled case tracker. Do not use the source repository, public tickets, or ordinary analytics.
3. Record the date received, request type, assigned owner, verification state, actions, providers contacted, response date, and outcome. Store only what is necessary.
4. Acknowledge the request through the approved business contact channel.
5. Work to the current statutory deadline. The operational target is one calendar month, but the legal reviewer must confirm the rule and any permitted extension before launch.

## Identity verification

- Verify identity proportionately before disclosing, changing, or deleting personal information.
- For loyalty requests, start with access to the registered email address and ask for the member code only if needed.
- Never ask for a password, service-role key, complete private card URL, or unnecessary identity documents.
- If identity cannot be verified, pause the request and explain what limited additional evidence is needed.

## Access and correction

After verification, search the systems relevant to the request:

- Supabase: `loyalty_members`, `loyalty_activity`, and `loyalty_consent_events`.
- Resend: the contact enquiry and available delivery metadata, subject to the approved retention policy.
- Google Wallet: the loyalty object, if the customer chose to create one.
- The hosting and rate-limit providers: only if their approved settings retain data relevant to the request.

Review exported material for other people’s information, secrets, internal security details, and legal restrictions before disclosure. Apply verified corrections in the source system and document the result.

## Withdrawing marketing consent

1. Verify the loyalty member.
2. Call the server-side `withdraw_loyalty_marketing` database function. Never update the flag from a browser or anonymous client.
3. Use an approved source value such as `privacy_request` and the current withdrawal wording version.
4. Confirm `marketing_consent` is false and that a `withdrawn` consent event exists.
5. Add the address to the approved marketing suppression process before any future campaign. Do not delete suppression evidence while marketing is active if doing so could cause the address to be re-added.
6. Confirm completion to the customer. Withdrawal does not close the loyalty account.

The site currently records choices but does not send marketing campaigns. Any future sender must include a working unsubscribe route and use the consent and suppression records.

## Deletion

1. Verify identity and check whether any information must be retained for a legal obligation, dispute, fraud prevention, or an overriding lawful reason. Escalate uncertainty for legal review.
2. If a Google Wallet object exists, remove or expire it through the approved issuer process.
3. Remove retained enquiry data from Resend and the authorised case system according to the approved policy.
4. Call the server-side `delete_loyalty_member` function. Related activity and consent events are designed to cascade with the member.
5. Consider backups and processor copies under the approved retention schedule. Record when they will age out if immediate deletion is not technically possible.
6. Confirm the outcome without including unnecessary personal information.

## Retention schedule to approve

| Record | Proposed owner | Period | Status |
| --- | --- | --- | --- |
| Contact enquiries and delivery metadata | Client | To confirm | Legal and client approval required |
| Active loyalty member and activity | Client | While active, plus a confirmed closure period | Legal and client approval required |
| Inactive loyalty member | Client | To confirm | Legal and client approval required |
| Consent and withdrawal evidence | Client | To confirm | Legal and client approval required |
| Privacy request case record | Privacy owner | To confirm | Legal and client approval required |
| Application and provider logs | Technical owner | To confirm | Provider settings must be checked |
| Backups | Technical owner | To confirm | Provider settings must be checked |

## Security and incident handling

- Keep Supabase service-role, Resend, Upstash, Google Wallet, and staff secrets server-side and rotate them if exposure is suspected.
- Limit staff access to people who need it, review access periodically, and remove access promptly when roles change.
- Do not log enquiry contents, names, email addresses, private card URLs, member codes, IP addresses, tokens, or provider responses containing personal information.
- Investigate suspected loss, unauthorised access, or disclosure immediately. Preserve necessary evidence, notify the designated privacy owner, and obtain legal advice on regulatory or customer notification deadlines.

## Migration and release order

The migration `supabase/migrations/20261124000000_add_loyalty_consent_audit.sql` has not been applied. Review it, back up the database, and test it in a non-production project first. Apply the approved migration before deploying the matching application code because new registration uses the `register_loyalty_member` database function.
