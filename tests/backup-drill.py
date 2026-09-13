"""Run with RUN_BACKUP_TESTS=1 against compose.test.yml; uses no production credentials."""
import importlib.util
import json
import os
from pathlib import Path
import secrets
import subprocess
import tempfile
import time
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("backup", Path(__file__).parents[1] / "scripts/backup/database_backup.py")
backup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backup)


class Safety(unittest.TestCase):
    def test_restore_rejects_remote_or_production_and_clears_source_options(self):
        for value in ("postgresql://a:b@production.example/oj_restore_test", "postgresql://a:b@localhost/production"):
            with self.assertRaises(ValueError):
                backup.pg_environment(value, restore=True)
        env = backup.pg_environment("postgresql://a:b@localhost/oj_restore_test", restore=True)
        self.assertNotIn("DATABASE_URL", env)
        self.assertNotIn("default_transaction_read_only", env["PGOPTIONS"])

    def test_private_repository_and_independent_encryption_password_required(self):
        with patch.dict(os.environ, {"RESTIC_REPOSITORY": "s3:http://bucket.invalid/repo", "RESTIC_PASSWORD": "x" * 32, "BACKUP_ALLOW_LOCAL_TEST": "0"}):
            with self.assertRaises(ValueError):
                backup.validate_repository()

    def test_password_file_cannot_bypass_minimum_length(self):
        with tempfile.TemporaryDirectory() as temp:
            secret = Path(temp) / "password"; secret.write_text("short\n")
            with patch.dict(os.environ, {"RESTIC_REPOSITORY": "s3:https://bucket.invalid/repo", "RESTIC_PASSWORD_FILE": str(secret)}):
                with self.assertRaises(ValueError): backup.validate_repository()
                secret.write_text(secrets.token_hex(32) + "\n"); backup.validate_repository()


@unittest.skipUnless(os.environ.get("RUN_BACKUP_TESTS") == "1", "Requires disposable Docker services")
class RestoreDrill(unittest.TestCase):
    def test_encrypted_round_trip_and_failure_guards(self):
        def call(args, **kw):
            result = subprocess.run(args, capture_output=True, text=True, **kw)
            if result.returncode: raise AssertionError(result.stderr[:1000])
            return result.stdout
        database = "oj_restore_" + secrets.token_hex(6)
        fixture_id = "backup_fixture_" + secrets.token_hex(6)
        source = os.environ.get("BACKUP_TEST_SOURCE_CONTAINER")
        network, source_host = "oj-readiness_default", "postgres"
        if source:
            inspected = json.loads(call(["docker", "inspect", source]))[0]
            network, config = next(iter(inspected["NetworkSettings"]["Networks"].items()))
            source_host = config["IPAddress"]
            psql = ["docker", "exec", source]
        else:
            psql = ["docker", "compose", "-p", "oj-readiness", "-f", "compose.test.yml", "exec", "-T", "postgres"]
        psql += ["psql", "-XAt", "-U", "oj_test", "-d", "oj_test", "-v", "ON_ERROR_STOP=1", "-c"]
        container = "oj-readiness-restore-" + secrets.token_hex(6)
        call(["docker", "run", "-d", "--name", container, "--network", network, "--network-alias", "restore-db", "--tmpfs", "/var/lib/postgresql", "-e", "POSTGRES_USER=oj_test", "-e", "POSTGRES_PASSWORD=oj_test_local_only", "-e", f"POSTGRES_DB={database}", "postgres:18-bookworm"])
        try:
            call(psql + [f'''INSERT INTO users (id,handle,email,bio,settings,"updatedAt") VALUES ('{fixture_id}','{fixture_id}','{fixture_id}@example.test','備份測試 — café', '{{"uiLocale":"zh-TW","dailyGoal":3}}',NOW()); INSERT INTO problems (id,slug,title,"statementMd","updatedAt") VALUES ('{fixture_id}','{fixture_id}','備份測試','A newline follows' || chr(10) || '測試內容',NOW());'''])
            for _ in range(120):
                if subprocess.run(["docker", "exec", container, "pg_isready", "-U", "oj_test", "-d", database], capture_output=True).returncode == 0: break
                time.sleep(0.25)
            else: raise AssertionError("Disposable restore database did not become ready")
            with tempfile.TemporaryDirectory(prefix="oj-backup-test-") as temp:
                root = Path(temp); repository = root / "repository"; repository.mkdir(mode=0o777); repository.chmod(0o777)
                env = root / "test.env"
                config = {"NODE_ENV": "test", "BACKUP_ALLOW_LOCAL_TEST": "1", "RESTIC_REPOSITORY": "/repository", "RESTIC_PASSWORD": secrets.token_hex(32), "DATABASE_URL": f"postgresql://oj_test:oj_test_local_only@{source_host}:5432/oj_test", "RESTORE_DATABASE_URL": f"postgresql://oj_test:oj_test_local_only@restore-db:5432/{database}"}
                env.write_text("\n".join(f"{key}={value}" for key, value in config.items())); env.chmod(0o600)
                docker = ["docker", "run", "--rm", "--network", network, "--user", "1000:1000", "--env-file", str(env), "-v", f"{repository}:/repository", "oj-readiness-backup"]
                self.assertTrue(json.loads(call(docker + ["init"]))["ok"])
                saved = json.loads(call(docker + ["backup"])); self.assertTrue(saved["ok"])
                self.assertTrue(json.loads(call(docker + ["freshness"]))["ok"])
                self.assertTrue(json.loads(call(docker + ["check"]))["ok"])
                # A failed pg_dump must not publish a new snapshot or a false success.
                env.write_text("\n".join(f"{key}={value if key != 'DATABASE_URL' else value.rsplit('/', 1)[0] + '/missing_backup_source'}" for key, value in config.items()))
                failed_backup = subprocess.run(docker + ["backup"], capture_output=True, text=True)
                self.assertNotEqual(failed_backup.returncode, 0)
                self.assertEqual(json.loads(call(docker + ["freshness"]))["snapshotId"][:8], saved["snapshotId"][:8])
                env.write_text("\n".join(f"{key}={value}" for key, value in config.items()))
                report = json.loads(call(docker + ["restore-drill", "--snapshot", saved["snapshotId"]])); self.assertTrue(report["ok"])
                original = int(call(psql + ['SELECT count(*) FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL']).strip())
                self.assertEqual(report["restoredCounts"]["migrations"], original)
                # Verify exact Unicode/JSON and multiline problem content, not just schema restoration.
                check_sql = f'''SELECT json_build_object('bio',bio,'settings',settings,'statement',(SELECT "statementMd" FROM problems WHERE id='{fixture_id}')) FROM users WHERE id='{fixture_id}';'''
                restored = json.loads(call(["docker", "exec", container, "psql", "-XAt", "-U", "oj_test", "-d", database, "-c", check_sql]))
                self.assertEqual(restored["bio"], "備份測試 — café"); self.assertEqual(restored["settings"]["uiLocale"], "zh-TW"); self.assertEqual(restored["statement"], "A newline follows\n測試內容")
                print(json.dumps({"backupRestoreDrill": "passed", "snapshotId": saved["snapshotId"], "restoredCounts": report["restoredCounts"], "restoreSeconds": report["elapsedSeconds"]}))
                repeated = subprocess.run(docker + ["restore-drill"], capture_output=True, text=True)
                self.assertNotEqual(repeated.returncode, 0); self.assertIn("not empty", repeated.stderr)
                # Wrong encryption password cannot read snapshots.
                env.write_text("\n".join(f"{key}={'wrong-password-' * 4 if key == 'RESTIC_PASSWORD' else value}" for key, value in config.items()))
                self.assertNotEqual(subprocess.run(docker + ["freshness"], capture_output=True).returncode, 0)
        finally:
            call(psql + [f"DELETE FROM users WHERE id='{fixture_id}'; DELETE FROM problems WHERE id='{fixture_id}';"])
            call(["docker", "rm", "-f", container])


if __name__ == "__main__":
    unittest.main()
