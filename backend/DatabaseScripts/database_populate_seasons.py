from database_utils import get_connection

database_conn = get_connection('../db_login.json')

def populate_seasons(cursor):
    for i in range(1947, 2024):
        query = f"""
            INSERT INTO Seasons (Year)
            VALUES ({i})
            ON DUPLICATE KEY UPDATE Year={i};
        """
        cursor.execute(query)

if __name__ == "__main__":
    if database_conn:
        cursor = database_conn.cursor()
        print("Populating Database Seasons")
        populate_seasons(cursor)
        database_conn.commit()
    else:
        print("Database Connection Failed")