import nba_api
from nba_api.stats.static import players
from nba_api.stats.endpoints import commonplayerinfo, playercareerstats
import pandas as pd
import ast
import re

from database_utils import get_connection

database_conn = get_connection('../db_login.json')

def get_playerteams(file="./playerteam_data.txt"):
    # Get all players
    players_list = players.get_players()
    players_list = sorted(players_list, key=lambda x: -x['is_active'])

    # Create an empty DataFrame to store player data
    player_teams = []

    start_index = 0
    # Iterate through each player
    with open(file, 'a') as f:
        for i in range(start_index, len(players_list)):
            print(f'Player {i}: {players_list[i]}')
            # Get player info
            try:
                career = playercareerstats.PlayerCareerStats(player_id=players_list[i]['id'])
                career_df = career.get_data_frames()[0]

                
                # Extract required information
                for index, row in career_df.iterrows():
                    season_year = int(f"20{row['SEASON_ID'][-2:]}") if int(row['SEASON_ID'][-2]) < 25 else int(f"19{row['SEASON_ID'][-2:]}")
                    if row['TEAM_ID'] != 0 and season_year < 2024:
                        player_team = {
                            'PlayerID': players_list[i]['id'],
                            'TeamID': row['TEAM_ID'],
                            'Season': season_year
                        }
                        player_teams.append(player_team)
                        f.write(str(player_team) + '\n')
                
            except Exception as e:
                print(f"Error: wrote up to index {i}")
                break
    
    df = pd.DataFrame(player_teams)
    return df

def populate_playerteams(cursor, file='./playerteam_data.txt'):
    with open(file, 'r') as f:
        for i, line in enumerate(f):
            #print(i)
            player_dict = ast.literal_eval(line.strip())
            print(player_dict)
            query = f"""
                INSERT INTO PlayerTeams (PlayerID, TeamID, Year)
                VALUES (
                    {player_dict['PlayerID']},
                    {player_dict['TeamID']},
                    {player_dict['Season']}
                )
                ON DUPLICATE KEY UPDATE PlayerID = {player_dict['PlayerID']}, TeamID = {player_dict['TeamID']}, Year = {player_dict['Season']};
            """
            #print(query)
            cursor.execute(query)
    return

if __name__ == "__main__":
    if database_conn:
        cursor = database_conn.cursor()
        print("Populating Database PlayerTeams")
        populate_playerteams(cursor)
        database_conn.commit()
    else:
        print("Database Connection Failed")