import sqlite3

conn = sqlite3.connect("mandi.db")
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables:", tables)

for table_name in [t[0] for t in tables]:
    print(f"\n--- Table: {table_name} ---")
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 10;")
    rows = cursor.fetchall()
    # Get column names
    cursor.execute(f"PRAGMA table_info({table_name});")
    cols = [col[1] for col in cursor.fetchall()]
    print("Columns:", cols)
    for row in rows:
        print(row)

conn.close()
