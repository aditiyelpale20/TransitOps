import os
import sys
import importlib.util

# Resolve absolute path to connection.py inside the sibling database folder
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)) # C:\Projects\transitops\backend\app
BACKEND_DIR = os.path.dirname(CURRENT_DIR) # C:\Projects\transitops\backend
ROOT_DIR = os.path.dirname(BACKEND_DIR) # C:\Projects\transitops
CONNECTION_PATH = os.path.join(ROOT_DIR, "database", "connection.py")

# Load the connection module dynamically to prevent import shadowing
spec = importlib.util.spec_from_file_location("database_connection", CONNECTION_PATH)
db_conn = importlib.util.module_from_spec(spec)
sys.modules["database_connection"] = db_conn
spec.loader.exec_module(db_conn)

# Export the variables so they are accessible to backend modules
Base = db_conn.Base
engine = db_conn.engine
SessionLocal = db_conn.SessionLocal
initialize_database = db_conn.initialize_database
get_db = db_conn.get_db
