# Loyalty database backup and recovery

## Before launch

- Confirm the production project reference in the Supabase dashboard. Record the project owner, an approved backup operator, and an independent reviewer in the café’s restricted operations records.
- Confirm the plan, backup schedule and retention against the café’s acceptable data-loss window and expected recovery time. Record those two targets. Check whether daily backups are sufficient or whether point-in-time recovery is warranted.
- Keep backup copies, if required, encrypted and access-controlled. Record the backup timestamp, project reference, migration version and verification date. Store credentials separately. Customer details, staff password hashes and audit history are sensitive even in a backup.
- Run a restore drill against a disposable project using a backup generated from synthetic data. Use the staging safety procedure before any migration or data write. Record when the backup was taken, the restore duration and the validation outcome.
- Verify the database's schema, permissions, and migration history alongside the data. Review functions, RLS policies and grants, staff account roles, consent records, stamp and redemption history and Wallet retry jobs. Use synthetic examples for the drill.

See [Supabase database backups and restore options](https://supabase.com/docs/guides/platform/backups). Confirm what the actual plan and project support before relying on a method.

## During an incident

1. Identify the production project reference, the incident window and the latest known-good snapshot. Preserve operational evidence with access limited to incident responders.
2. Have the operator and reviewer approve the target, restore point, expected downtime and potential loss of changes after the snapshot. Pause loyalty mutations and the Wallet retry job through an approved change if a production restore is necessary.
3. Prefer restoring to a separate restricted recovery project for validation where supported. Keep its app and Wallet jobs disconnected. Handle any production data restored to that project under the same access controls and retention requirements as production.
4. Reconcile post-snapshot transactions, consent changes and staff access changes before resuming service. Assess whether staff sessions must be revoked, because recovery can restore previously revoked sessions. Validate a synthetic card and role permissions before restoring access.
5. Reconcile Wallet passes against the recovered ledger before resuming its retry job. Verify balances at the counter and monitor failures after reopening. Document the data-loss window, remaining discrepancies and who approved the recovery.

Contact mail and Upstash rate-limit state are outside the loyalty database backup. Resend and mailbox retention follow the café’s privacy operations process. Redis rate-limit counters are transient and do not hold loyalty balances.
