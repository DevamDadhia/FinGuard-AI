# ============================================================
# FinGuard AI
# Database Configuration
# ============================================================

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# ------------------------------------------------------------
# Paths
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

DATABASE_PATH = BASE_DIR / "database" / "finguard.db"


# ------------------------------------------------------------
# Database URL
# ------------------------------------------------------------

DATABASE_URL = f"sqlite:///{DATABASE_PATH}"


# ------------------------------------------------------------
# Engine
# ------------------------------------------------------------

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
)


# ------------------------------------------------------------
# Session
# ------------------------------------------------------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ------------------------------------------------------------
# Base
# ------------------------------------------------------------

Base = declarative_base()


# ------------------------------------------------------------
# Dependency
# ------------------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()