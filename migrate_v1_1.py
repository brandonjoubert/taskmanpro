#!/usr/bin/env python3
"""
Database migration for Taskman Pro v1.1.

Migrates:
  - Task.start_date -> Task.due_date
  - Completion.completion_date -> Completion.scheduled_due_date + completed_at

Usage:
  python migrate_v1_1.py

Backs up the database before migrating.
"""
import shutil
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "instance" / "tasks.db"


def backup_database(db_path):
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = db_path.parent / f"tasks.db.bak-{timestamp}"
    shutil.copy2(db_path, backup_path)
    print(f"Backup created: {backup_path}")
    return backup_path


def get_table_columns(conn, table_name):
    cursor = conn.execute(f"PRAGMA table_info({table_name})")
    return {row[1] for row in cursor.fetchall()}


def migrate(db_path):
    if not db_path.exists():
        print(f"No database found at {db_path}. Nothing to migrate.")
        return

    backup_database(db_path)

    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("BEGIN TRANSACTION")

    try:
        # --- Task table: rename start_date -> due_date ---
        task_cols = get_table_columns(conn, "task")
        if "start_date" in task_cols and "due_date" not in task_cols:
            print("Migrating Task.start_date -> Task.due_date ...")
            conn.execute("ALTER TABLE task RENAME COLUMN start_date TO due_date")
            print("  Done.")
        elif "due_date" in task_cols:
            print("Task.due_date already exists. Skipping.")
        else:
            print("ERROR: Task table has neither start_date nor due_date.")
            conn.rollback()
            sys.exit(1)

        # --- Completion table: add scheduled_due_date and completed_at ---
        comp_cols = get_table_columns(conn, "completion")

        if "scheduled_due_date" not in comp_cols:
            print("Adding Completion.scheduled_due_date ...")
            conn.execute("ALTER TABLE completion ADD COLUMN scheduled_due_date DATE")

            # Copy legacy completion_date values into scheduled_due_date
            if "completion_date" in comp_cols:
                print("  Copying completion_date -> scheduled_due_date ...")
                conn.execute("""
                    UPDATE completion
                    SET scheduled_due_date = completion_date
                    WHERE scheduled_due_date IS NULL
                """)
                print(f"  Migrated {conn.execute('SELECT changes()').fetchone()[0]} rows.")
        else:
            print("Completion.scheduled_due_date already exists. Skipping.")

        if "completed_at" not in comp_cols:
            print("Adding Completion.completed_at ...")
            # SQLite doesn't support NOT NULL on ADD COLUMN with existing rows,
            # so we add it nullable and backfill with a sentinel.
            conn.execute("ALTER TABLE completion ADD COLUMN completed_at DATETIME")

            # Backfill: set to scheduled_due_date at midnight as honest "unknown" sentinel
            print("  Backfilling completed_at for legacy records ...")
            conn.execute("""
                UPDATE completion
                SET completed_at = scheduled_due_date || ' 00:00:00'
                WHERE completed_at IS NULL
            """)
            print(f"  Backfilled {conn.execute('SELECT changes()').fetchone()[0]} rows.")
        else:
            print("Completion.completed_at already exists. Skipping.")

        # Drop legacy completion_date column if it exists
        if "completion_date" in comp_cols:
            print("Dropping legacy Completion.completion_date ...")
            # SQLite doesn't support DROP COLUMN directly in older versions,
            # so we recreate the table.
            conn.execute("""
                CREATE TABLE completion_new (
                    id INTEGER PRIMARY KEY,
                    task_id INTEGER NOT NULL,
                    scheduled_due_date DATE NOT NULL,
                    completed_at DATETIME NOT NULL,
                    FOREIGN KEY (task_id) REFERENCES task(id)
                )
            """)
            conn.execute("""
                INSERT INTO completion_new (id, task_id, scheduled_due_date, completed_at)
                SELECT id, task_id,
                       COALESCE(scheduled_due_date, completion_date),
                       COALESCE(completed_at, completion_date || ' 00:00:00')
                FROM completion
            """)
            conn.execute("DROP TABLE completion")
            conn.execute("ALTER TABLE completion_new RENAME TO completion")
            print("  Done.")

        conn.commit()
        print("\nMigration complete.")

        # Verify
        print("\nVerification:")
        task_count = conn.execute("SELECT COUNT(*) FROM task").fetchone()[0]
        comp_count = conn.execute("SELECT COUNT(*) FROM completion").fetchone()[0]
        print(f"  Tasks: {task_count}")
        print(f"  Completions: {comp_count}")

        # Check task due_dates are intact
        sample = conn.execute("SELECT id, due_date FROM task LIMIT 3").fetchall()
        for row in sample:
            print(f"  Task {row[0]}: due_date={row[1]}")

        # Check completion records
        sample = conn.execute(
            "SELECT id, task_id, scheduled_due_date, completed_at FROM completion LIMIT 3"
        ).fetchall()
        for row in sample:
            print(f"  Completion {row[0]}: task={row[1]}, scheduled={row[2]}, completed_at={row[3]}")

    except Exception as e:
        conn.rollback()
        print(f"ERROR: {e}")
        print("Migration rolled back.")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    migrate(DB_PATH)
