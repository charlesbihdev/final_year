import os
import libsql
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("DB_URL")
auth_token = os.getenv("DB_AUTH_TOKEN")

def get_db_connection():
    # Create a fresh connection for each request to avoid stale connections
    return libsql.connect(database=url, auth_token=auth_token)