from database_utils import get_connection

database_conn = get_connection('../db_login.json')

def create_tables(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Players (
            ID INT NOT NULL,
            Name VARCHAR(255) NOT NULL,
            Relevance INT NOT NULL,
            Height VARCHAR(10),
            Weight VARCHAR(10),
            DraftYear INT,
            DraftPick INT,
            DraftRound INT,
            Country VARCHAR(100),
            BirthYear INT,
            PRIMARY KEY (ID)
        );
    """)
    print("\tCreated Players")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Teams (
            ID INT NOT NULL,
            Name VARCHAR(255) NOT NULL,
            Abr VARCHAR(3) NOT NULL,
            Founded INT,
            ConfTitles INT,
            DivTitles INT,
            Titles INT,
            PRIMARY KEY (ID)
        );
    """)
    print("\tCreated Teams")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Games (
            ID INT NOT NULL,
            Season INT NOT NULL,
            Date DATE NOT NULL,
            HomeTeam VARCHAR(10) NOT NULL,
            AwayTeam VARCHAR(10) NOT NULL,
            HomeScore INT NOT NULL,
            AwayScore INT NOT NULL,
            Quarters INT NOT NULL,
            PRIMARY KEY (ID),
            FOREIGN KEY (Season) REFERENCES Season(Year)
        );
    """)
    print("\tCreated Games")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Seasons (
            Year INT NOT NULL,
            Games INT,
            Winner INT,
            PRIMARY KEY (Year),
            FOREIGN KEY (Winner) REFERENCES Teams(ID)
        );
    """)
    print("\tCreated Seasons")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS PlayerTeams (
            PlayerID INT NOT NULL,
            TeamID INT NOT NULL,
            Year INT NOT NULL,
            PRIMARY KEY (PlayerID, TeamID, Year),
            FOREIGN KEY (PlayerID) REFERENCES Players(ID),
            FOREIGN KEY (TeamID) REFERENCES Teams(ID),
            FOREIGN KEY (Year) REFERENCES Seasons(Year)
        );
    """)
    print("\tCreated PlayerTeams")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS PlayerShots (
            PlayerID INT NOT NULL,
            GameID INT NOT NULL,
            X FLOAT NOT NULL,
            Y FLOAT NOT NULL,
            Time INT NOT NULL,
            Type VARCHAR(50),
            HomeScore INT,
            AwayScore INT,
            Distance FLOAT,
            Miss BOOLEAN,
            PRIMARY KEY (PlayerID, GameID, Time),
            FOREIGN KEY (PlayerID) REFERENCES Players(ID),
            FOREIGN KEY (GameID) REFERENCES Games(ID)
        );
    """)
    print("\tCreated PlayerShots")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS PlayerGames (
            PlayerID INT NOT NULL,
            GameID INT NOT NULL,
            FGM INT,
            FGA INT,
            FGP FLOAT,
            3PM INT,
            3PA INT,
            3PP FLOAT,
            FTM INT,
            FTA INT,
            FTP FLOAT,
            PTS INT,
            REB INT,
            OREB INT,
            DREB INT,
            AST INT,
            STL INT,
            BLK INT,
            TOV INT,
            PF INT,
            MIN INT,
            WIN BOOLEAN,
            PRIMARY KEY (PlayerID, GameID),
            FOREIGN KEY (PlayerID) REFERENCES Players(ID),
            FOREIGN KEY (GameID) REFERENCES Games(ID)
        );
    """)
    print("\tCreated PlayerGames")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS PlayerSeasons (
            PlayerID INT NOT NULL,
            Year INT NOT NULL,
            Games INT NOT NULL,
            FGM INT,
            FGA INT,
            FGP FLOAT,
            3PM INT,
            3PA INT,
            3PP FLOAT,
            FTM INT,
            FTA INT,
            FTP FLOAT,
            PTS INT,
            REB INT,
            OREB INT,
            DREB INT,
            AST INT,
            STL INT,
            BLK INT,
            TOV INT,
            PF INT,
            PRIMARY KEY (PlayerID, Year),
            FOREIGN KEY (PlayerID) REFERENCES Players(ID),
            FOREIGN KEY (Year) REFERENCES Seasons(Year)
        );
    """)
    print("\tCreated PlayerSeasons")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS TeamGames (
            TeamID INT NOT NULL,
            GameID INT NOT NULL,
            FGM INT,
            FGA INT,
            FGP FLOAT,
            3PM INT,
            3PA INT,
            3PP FLOAT,
            FTM INT,
            FTA INT,
            FTP FLOAT,
            PTS INT,
            REB INT,
            OREB INT,
            DREB INT,
            AST INT,
            STL INT,
            BLK INT,
            TOV INT,
            PF INT,
            WIN BOOLEAN,
            PRIMARY KEY (TeamID, GameID),
            FOREIGN KEY (TeamID) REFERENCES Teams(ID),
            FOREIGN KEY (GameID) REFERENCES Games(ID)
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS TeamSeasons (
            TeamID INT NOT NULL,
            Year INT NOT NULL,
            Games INT NOT NULL,
            FGM INT,
            FGA INT,
            FGP FLOAT,
            3PM INT,
            3PA INT,
            3PP FLOAT,
            FTM INT,
            FTA INT,
            FTP FLOAT,
            PTS INT,
            REB INT,
            OREB INT,
            DREB INT,
            AST INT,
            STL INT,
            BLK INT,
            TOV INT,
            PF INT,
            PRIMARY KEY (TeamID, Year),
            FOREIGN KEY (TeamID) REFERENCES Teams(ID),
            FOREIGN KEY (Year) REFERENCES Seasons(Year)
        );
    """)
    print("\tCreated TeamSeasons")


def drop_tables(cursor):

    cursor.execute("""
        DROP TABLE IF EXISTS TeamSeasons;
        DROP TABLE IF EXISTS TeamGames;
        DROP TABLE IF EXISTS PlayerSeasons;
        DROP TABLE IF EXISTS PlayerSeasonStats;
        DROP TABLE IF EXISTS PlayerGames;
        DROP TABLE IF EXISTS PlayerShots;
        DROP TABLE IF EXISTS PlayerTeams;
        DROP TABLE IF EXISTS Seasons;
        DROP TABLE IF EXISTS Games;
        DROP TABLE IF EXISTS Players;
        DROP TABLE IF EXISTS Teams;
    """)

if __name__ == "__main__":
    if database_conn:
        cursor = database_conn.cursor()
        print("Initializing Database")
        #drop_tables(cursor)
        print("\tCreated Tables")
        create_tables(cursor)
        database_conn.commit()
    else:
        print("Database Connection Failed")