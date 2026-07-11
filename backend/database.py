import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from .env
load_dotenv()

# Load from environment or fallback to default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost/mandidb"
)

# Force SQLite database path to be absolute relative to the project root
if DATABASE_URL.startswith("sqlite:///"):
    db_file = DATABASE_URL.split("sqlite:///")[1]
    if not os.path.isabs(db_file):
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        clean_db_file = os.path.basename(db_file)
        abs_db_path = os.path.join(project_root, clean_db_file)
        DATABASE_URL = f"sqlite:///{abs_db_path.replace(os.sep, '/')}"

# Conditionally configure check_same_thread only for sqlite databases
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()