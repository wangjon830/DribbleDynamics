import mysql.connector
import json

def get_connection(credentials_file):
    credentials = {
    'host':None,
    'user':None,
    'password':None
    }
    with open(credentials_file, 'r') as f:
        credentials = json.load(f)

    database_conn = mysql.connector.connect(
        host=credentials['host'],
        user=credentials['user'],
        password=credentials['password'],
        database=credentials['database']
    )
    return database_conn
