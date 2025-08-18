import os
import libsql
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("TURSO_DATABASE_URL")
auth_token = os.getenv("TURSO_AUTH_TOKEN")

client = libsql.connect(database=url, auth_token=auth_token)

def get_db_connection():
    return client