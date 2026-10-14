import sqlite3
from pathlib import Path

database = Path("backend/database/hrms.db")
output = Path("deliverables/hrms_database_dump.sql")

if not database.exists():
    raise SystemExit(f"Database not found: {database}")

connection = sqlite3.connect(database)
with output.open("w", encoding="utf-8", newline="\n") as file:
    file.write("-- HRMS SQLite database schema and data dump\n")
    file.write("PRAGMA foreign_keys=OFF;\n")
    for statement in connection.iterdump():
        file.write(statement + ";\n")
    file.write("PRAGMA foreign_keys=ON;\n")
connection.close()

print(f"Database dump created: {output}")
print(f"Size: {output.stat().st_size:,} bytes")
