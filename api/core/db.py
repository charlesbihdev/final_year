# core/db.py
import os
import libsql_client
from dotenv import load_dotenv

# Load env vars
load_dotenv()

# Turso connection
url = os.getenv("TURSO_DATABASE_URL")
auth_token = os.getenv("TURSO_AUTH_TOKEN")

# Create a single shared client
client = libsql_client.create_client_sync(url, auth_token=auth_token)

def get_db_connection():
    return client
