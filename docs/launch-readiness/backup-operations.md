# Encrypted scheduled database backups

The existing 2026-09-13 local dump is a one-time backup. This implementation does not claim that an offsite schedule is active until storage is configured and a restore drill passes.

## Deployment

Build `docker/Dockerfile.backup` as a separate Railway service with the configuration file `scripts/backup/railway.json`. It runs at minute 17 every six hours (UTC). Set `DATABASE_URL` to the existing private PostgreSQL reference. The source session is read-only; credentials are passed in the child environment, never command arguments or logs.

Set `RESTIC_REPOSITORY` to a dedicated private `s3:https://…/bucket/prefix` repository (S3/R2/B2 S3 API) or `b2:bucket:prefix`. Provide the provider's limited bucket credentials using its standard restic environment variables. Set a separate random `RESTIC_PASSWORD` (at least 32 characters) through the secret manager, and retain an independent copy in the owner's recovery vault. Keep the account MFA encryption key in that recovery vault too. Losing either key cannot be repaired by restoring encrypted data alone.

Run the image with `init` once after provisioning the private repository, then use the default `backup` action. Do not put a database export in a public Actions artifact or Git. Restrict bucket access and keep it in an account independent of the application administrator when possible.

Successful runs report only the snapshot identifier, timestamps and duration. A dump failure causes restic to reject the snapshot. Before pruning, each run checks repository metadata and a sample of stored data. Retention is the latest 8 snapshots, 7 daily, 4 weekly and 6 monthly snapshots, scoped to this database host/tag. Configure provider versioning and lifecycle separately so repository corruption/deletion can also be recovered; never apply blind object expiry to active restic data.

## Freshness and restore evidence

Run `freshness` hourly from a separate scheduler/monitor and alert on any nonzero exit; the default maximum age is eight hours. Run `check` weekly to read and verify all repository data. A backup cron cannot detect its own absence, so the freshness monitor must be independent.

For a weekly restore drill, create a new empty disposable PostgreSQL 18 database named `oj_restore_<date>` on localhost or an isolated Docker service called `restore-db`. Set `RESTORE_DATABASE_URL` and run `restore-drill --snapshot <id>`. The command refuses remote/production names and nonempty databases, restores with error-stop in one transaction, checks core tables/migration history, erases the temporary plaintext dump, and reports counts and elapsed time. It never deletes the restored database: retain it only as long as the drill needs, then remove the disposable container/volume.

Target RPO: six hours; initial RTO target: one hour. These are objectives, not achieved measurements. Record the actual restore duration and application smoke checks after each drill. Before a production recovery, stop writes and judge queues, restore into a new service, run the matching application revision and payment reconciliation, then switch connections. Do not replay external payments or pending refunds blindly. Prefer a forward schema repair; restoring a snapshot discards subsequent writes.

Sources: [restic producer exit handling](https://restic.readthedocs.io/en/stable/040_backup.html), [restore commands](https://restic.readthedocs.io/en/stable/050_restore.html), [encryption](https://restic.readthedocs.io/en/stable/070_encryption.html).
