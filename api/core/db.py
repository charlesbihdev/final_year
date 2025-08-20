import os
import libsql
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("DB_URL")
auth_token = os.getenv("DB_AUTH_TOKEN")

client = libsql.connect(database=url, auth_token=auth_token)

def get_db_connection():
    return client