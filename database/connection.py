import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()
engine = None
SessionLocal = None

# Dynamically resolve path to the database folder
DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "transitops.db")
SQLITE_URL = f"sqlite:///{DB_PATH}"

def initialize_database():
    global engine, SessionLocal
    if engine is not None and SessionLocal is not None:
        return engine

    # Load configurations from backend app settings if available
    try:
        # Add root folder to system path to load settings
        ROOT_DIR = os.path.dirname(DB_DIR)
        if ROOT_DIR not in sys.path:
            sys.path.append(ROOT_DIR)
        from backend.app.config import settings
        db_url = settings.DATABASE_URL
        fallback = settings.DATABASE_FALLBACK_SQLITE
    except Exception:
        db_url = "mysql+pymysql://root:password@localhost:3306/transitops"
        fallback = True

    try:
        print(f"Connecting to configured database: {db_url.split('@')[-1] if '@' in db_url else db_url}...")
        engine = create_engine(
            db_url,
            pool_recycle=3600,
            pool_pre_ping=True,
        )
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        print("Successfully connected to configured database.")
    except Exception as exc:
        print(f"Configured database connection failed: {exc}", file=sys.stderr)
        if fallback:
            print(f"DATABASE_FALLBACK_SQLITE is enabled. Falling back to SQLite: {SQLITE_URL}...")
            engine = create_engine(
                SQLITE_URL,
                connect_args={"check_same_thread": False},
            )
        else:
            print("Fallback is disabled. Database connection failed.", file=sys.stderr)
            raise exc

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine

# Run initialization
initialize_database()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
