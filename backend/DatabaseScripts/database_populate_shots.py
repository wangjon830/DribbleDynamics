import nba_api
from nba_api.stats.static import players
from nba_api.stats.endpoints import commonplayerinfo
import pandas as pd
import ast
import re
import mysql.connector

from database_utils import get_connection

database_conn = get_connection('../db_login.json')

def convert_time_to_seconds(row):
    quarterType = "ot" if "OT" in row['qtr'] else "qtr"
    quarter = int(row['qtr'][0])
    minutes, seconds = map(int, row['time_remaining'].split(':'))
    
    if quarterType == 'ot':
        quarter_seconds = 5*60 - (minutes * 60 + seconds)
        totalSeconds = 4*12*60 + (quarter-1)*5*60 + quarter_seconds
        return totalSeconds
    elif quarterType == 'qtr':
        quarter_seconds = 12*60 - (minutes * 60 + seconds)
        totalSeconds = (quarter-1)*12*60 + quarter_seconds
        return totalSeconds
    return None

def scale_number(x, old_min, old_max, new_min, new_max):
    return new_min + ((x - old_min) * (new_max - new_min) / (old_max - old_min))

def convertCoords(x, y, qtr):
    new_x = 564 - int(scale_number(x, 0, 390, 0, 564))
    new_y = int(scale_number(y, 0, 485, -300, 300))

    if 'OT' in qtr or int(qtr[0]) > 2:
        new_x = -new_x
    return new_x, new_y

def getGameInfo(file, date, id):
    df = pd.read_csv(file)
    df = df[df['date'] == date]
    df['seconds'] = df.apply(convert_time_to_seconds, axis=1)
    df = df.sort_values(by='seconds')

    print(df)
    last_row = df.iloc[-1]
    gameListEntry = {
        "name": f"{last_row['team']} vs {last_row['opponent']} on {last_row['date']}",
        "id":id
    }
    gameInfoEntry = {
        "shots":[],
        "finalScore": [],
        "overtimes": int(last_row['qtr'][0]) if "OT" in last_row['qtr'] else 0,
        "teams":[last_row['team'], last_row['opponent']],
        "date":last_row['date']
    }

    for index, row in df.iterrows():
        x, y = convertCoords(row['top'], row['left'], row['qtr'])
        shot = {
            "x": x,
            "y": y,
            "time": row['seconds'],
            "miss": row['result'],
            "score": [row['lebron_team_score'], row['opponent_team_score']],
            "distance": row['distance_ft'],
            "type": row['shot_type']
        }
        gameInfoEntry['shots'].append(shot)
    return gameListEntry, gameInfoEntry


def get_player_shots(cursor, player_ids = [2544, 201935, 201939], shot_files=['../Data/1_lebron_james_shot_chart_1_2023.csv', '../Data/2_james_harden_shot_chart_2023.csv', '../Data/3_stephen_curry_shot_chart_2023.csv'], out_file="./playershots_data.txt"):
    
    with open(out_file, 'a') as f_out:
        for i in range(len(player_ids)):
            player_id = player_ids[i]
            df = pd.read_csv(shot_files[i])
            df['seconds'] = df.apply(convert_time_to_seconds, axis=1)
            df['date'] = pd.to_datetime(df['date'])
            df['date'] = df['date'].dt.strftime('%Y-%m-%d')               
            for index, row in df.iterrows():
                x, y = convertCoords(row['top'], row['left'], row['qtr'])
                query = f'''
                    SELECT PlayerID, GameID, Date, HomeTeam, AwayTeam
                    FROM games 
                    INNER JOIN playergames 
                    ON games.id = playergames.gameid 
                    WHERE PlayerID = {player_id} AND Date="{row['date']}";
                '''
                cursor.execute(query)
                found_games = cursor.fetchall()
                if len(found_games) != 1: 
                    print("ERROR")
                    continue
                else:
                    for game in found_games:
                        print(game)
                    game = found_games[0]
                    gameid = game[1]
                    hometeam = game[3]
                    awayteam = game[4]
                    if hometeam == row['team']:
                        homescore = row['lebron_team_score']
                        awayscore = row['opponent_team_score']
                    else:
                        homescore = row['opponent_team_score']
                        awayscore = row['lebron_team_score']
                    player_shot = {
                        'PlayerID': player_id,
                        'GameID': gameid,
                        'X': x,
                        'Y': y,
                        'Time': row['seconds'],
                        'Miss': row['result'],
                        "Distance": row['distance_ft'],
                        "Type": row['shot_type'],
                        "HomeScore": homescore,
                        "AwayScore": awayscore
                    }
                    f_out.write(str(player_shot) + '\n')

    return df

def populate_shots(cursor, file='./playershots_data.txt'):
    with open(file, 'r') as f:
        for i, line in enumerate(f):
            shot_dict = ast.literal_eval(line.strip())
            query = f"""
                INSERT INTO PlayerShots (PlayerID, GameID, X, Y, Time, Type, HomeScore, AwayScore, Distance, Miss)
                VALUES (
                    {int(shot_dict['PlayerID'])}, 
                    {int(shot_dict['GameID'])}, 
                    {float(shot_dict['X'])}, 
                    {float(shot_dict['Y'])}, 
                    {int(shot_dict['Time'])}, 
                    \'{shot_dict['Type']}\', 
                    {int(shot_dict['HomeScore'])}, 
                    {int(shot_dict['AwayScore'])}, 
                    {float(shot_dict['Distance'])}, 
                    {'TRUE' if shot_dict['Miss'] else 'FALSE'}
                )
                ON DUPLICATE KEY UPDATE 
                PlayerID={int(shot_dict['PlayerID'])}, GameID={int(shot_dict['GameID'])},
                X={float(shot_dict['X'])}, Y={float(shot_dict['Y'])}, Time={int(shot_dict['Time'])}, Type=\'{shot_dict['Type']}\', 
                HomeScore= {int(shot_dict['HomeScore'])}, AwayScore={int(shot_dict['AwayScore'])}, 
                Distance={float(shot_dict['Distance'])}, Miss = {'TRUE' if shot_dict['Miss'] else 'FALSE'};
            """
            #print(query)
            cursor.execute(query)
    return

if __name__ == "__main__":
    if database_conn:
        cursor = database_conn.cursor()
        print("Populating Database Players")
        populate_shots(cursor)
        database_conn.commit()
    else:
        print("Database Connection Failed")