#!/usr/bin/env python3
"""Encrypted PostgreSQL backups. Never print subprocess errors containing credentials or data."""
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from urllib.parse import parse_qs, unquote, urlparse

TAG = "online-judge-database"
HOST = "judge-production"


def command(args, *, env=None, output=None, timeout=1800):
    result = subprocess.run(args, env=env, stdout=output or subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout, check=False)
    if result.returncode:
        raise RuntimeError(f"{Path(args[0]).name} failed with exit code {result.returncode}; no success recorded")
    return result.stdout


def pg_environment(value, *, restore=False):
    url = urlparse(value)
    if url.scheme not in ("postgres", "postgresql") or not url.hostname or not url.username or not url.path.strip("/"):
        raise ValueError("A complete PostgreSQL connection must be configured")
    if restore and (url.hostname not in ("localhost", "127.0.0.1", "postgres", "restore-db") or not url.path.startswith("/oj_restore_")):
        raise ValueError("Restore drills only accept an isolated local database named oj_restore_*")
    env = dict(os.environ)
    for key in ("DATABASE_URL", "RESTORE_DATABASE_URL"):
        env.pop(key, None)
    env.update(PGHOST=url.hostname, PGPORT=str(url.port or 5432), PGUSER=unquote(url.username), PGPASSWORD=unquote(url.password or ""), PGDATABASE=unquote(url.path[1:]), PGCONNECT_TIMEOUT="15")
    query = parse_qs(url.query)
    if "sslmode" in query:
        mode = query["sslmode"][0]
        if mode not in ("disable", "require", "verify-ca", "verify-full"):
            raise ValueError("Unsupported SSL mode")
        env["PGSSLMODE"] = mode
    # Prevent a source session read-only setting from stopping the isolated restore.
    env["PGOPTIONS"] = "-c statement_timeout=900000" if restore else "-c default_transaction_read_only=on -c statement_timeout=900000"
    return env


def validate_repository():
    repo = os.environ.get("RESTIC_REPOSITORY", "")
    local_test = os.environ.get("BACKUP_ALLOW_LOCAL_TEST") == "1" and os.environ.get("NODE_ENV") != "production"
    if not (repo.startswith("s3:https://") or repo.startswith("b2:") or (local_test and repo.startswith("/"))):
        raise ValueError("Configure a private HTTPS S3-compatible or B2 repository")
    password_file = os.environ.get("RESTIC_PASSWORD_FILE")
    password = Path(password_file).read_text().rstrip("\r\n") if password_file else os.environ.get("RESTIC_PASSWORD", "")
    if len(password) < 32:
        raise ValueError("A separate backup encryption password of at least 32 characters is required")


def latest_snapshot():
    rows = json.loads(command(["restic", "snapshots", "--tag", TAG, "--host", HOST, "--json"]))
    if not rows:
        raise RuntimeError("No database backup exists")
    return max(rows, key=lambda row: row["time"])


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("init", "backup", "check", "freshness", "restore-drill"))
    parser.add_argument("--snapshot", help="Explicit snapshot ID for a restore drill; defaults to latest database snapshot")
    args = parser.parse_args(argv)
    os.umask(0o077)
    validate_repository()
    started = dt.datetime.now(dt.timezone.utc)
    report = {"action": args.action, "startedAt": started.isoformat()}
    if args.action == "init":
        command(["restic", "init"])
    elif args.action == "backup":
        env = pg_environment(os.environ.get("DATABASE_URL", ""))
        # restic checks pg_dump's exit status. A failed/truncated producer creates no snapshot.
        output = command(["restic", "backup", "--json", "--host", HOST, "--tag", TAG, "--stdin-filename", "database.dump", "--stdin-from-command", "--", "pg_dump", "--format=custom", "--no-owner", "--no-privileges", "--lock-wait-timeout=30s"], env=env)
        summaries = [json.loads(line) for line in output.decode().splitlines() if line.startswith("{")]
        summary = next((row for row in summaries if row.get("message_type") == "summary" and row.get("snapshot_id")), None)
        if not summary:
            raise RuntimeError("Backup did not return a snapshot ID")
        report["snapshotId"] = summary["snapshot_id"]
        command(["restic", "check", "--read-data-subset=5%"])
        # Restrict retention to this database's host/tag group; do not remove unrelated snapshots.
        command(["restic", "forget", "--tag", TAG, "--host", HOST, "--group-by", "host,tags", "--keep-last", "8", "--keep-daily", "7", "--keep-weekly", "4", "--keep-monthly", "6", "--prune"])
    elif args.action == "check":
        command(["restic", "check", "--read-data"], timeout=3600)
    elif args.action == "freshness":
        latest = latest_snapshot()
        age = (started - dt.datetime.fromisoformat(latest["time"].replace("Z", "+00:00"))).total_seconds()
        report.update(snapshotId=latest["id"], ageSeconds=round(age))
        maximum = int(os.environ.get("BACKUP_MAX_AGE_SECONDS", "28800"))
        if maximum < 60 or age < -300 or age > maximum:
            raise RuntimeError("Database backup is stale or has an invalid timestamp")
    else:
        restore_env = pg_environment(os.environ.get("RESTORE_DATABASE_URL", ""), restore=True)
        # Refuse any nonempty target, regardless of ownership or user-supplied flags.
        count = command(["psql", "-XAt", "-v", "ON_ERROR_STOP=1", "-c", "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND c.relkind IN ('r','p','v','m','S')"], env=restore_env)
        if int(count.strip()):
            raise RuntimeError("Restore target is not empty; refusing to overwrite it")
        snapshot = args.snapshot or latest_snapshot()["id"]
        if not re.fullmatch(r"[a-f0-9]{8,64}", snapshot):
            raise ValueError("Invalid snapshot ID")
        with tempfile.TemporaryDirectory(prefix="oj-restore-") as temp:
            dump = Path(temp) / "database.dump"
            with dump.open("wb") as stream:
                command(["restic", "dump", snapshot, "/database.dump"], output=stream)
            command(["pg_restore", "--exit-on-error", "--single-transaction", "--no-owner", "--no-privileges", "--dbname", restore_env["PGDATABASE"], str(dump)], env=restore_env)
            counts = command(["psql", "-XAt", "-v", "ON_ERROR_STOP=1", "-c", 'SELECT json_build_object(\'users\',(SELECT count(*) FROM users),\'problems\',(SELECT count(*) FROM problems),\'migrations\',(SELECT count(*) FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL))'], env=restore_env)
            report.update(snapshotId=snapshot, restoredCounts=json.loads(counts))
    report.update(ok=True, elapsedSeconds=round((dt.datetime.now(dt.timezone.utc) - started).total_seconds(), 2))
    print(json.dumps(report))


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError, OSError, subprocess.TimeoutExpired, json.JSONDecodeError) as error:
        # Do not log tracebacks, request URLs, dump contents or inherited environment values.
        print(json.dumps({"ok": False, "error": str(error) if isinstance(error, (RuntimeError, ValueError)) else type(error).__name__}), file=sys.stderr)
        sys.exit(1)
