import nba_api
from nba_api.stats.static import players
from nba_api.stats.endpoints import commonplayerinfo
import pandas as pd
import ast
import re

from database_utils import get_connection

database_conn = get_connection('../db_login.json')

def get_players(cursor, file="./player_data.txt"):
    # Get all players
    players_list = players.get_players()
    players_list = sorted(players_list, key=lambda x: -x['is_active'])

    # Create an empty DataFrame to store player data
    player_entries = []

    start_index = 8
    # Iterate through each player
    with open(file, 'a') as f:
        for i in range(start_index, len(players_list)):
            print(f'Player {i}: {players_list[i]}')
            # Get player info
            try:
                player_info = commonplayerinfo.CommonPlayerInfo(player_id=players_list[i]['id']).get_normalized_dict()
                player_data = player_info['CommonPlayerInfo'][0]
                
                # Extract required information
                row = {
                    'id': player_data['PERSON_ID'],
                    'name': player_data['DISPLAY_FIRST_LAST'],
                    'height': player_data['HEIGHT'],
                    'weight': player_data['WEIGHT'],
                    'draftyear': player_data['DRAFT_YEAR'],
                    'draftpick': player_data['DRAFT_NUMBER'],
                    'draftround': player_data['DRAFT_ROUND'],
                    'country': player_data['COUNTRY'],
                    'birthyear': player_data['BIRTHDATE'].split('T')[0].split('-')[0] if player_data['BIRTHDATE'] else None
                }
                
                f.write(str(row) + '\n')
                # Append row to DataFrame
                player_entries.append(row)
            except Exception as e:
                print(f"Error: wrote up to index {i}")
                break
    
    df = pd.DataFrame(player_entries)
    return df

def populate_players(cursor, file='./player_data.txt'):
    with open(file, 'r') as f:
        for i, line in enumerate(f):
            #print(i)
            player_dict = ast.literal_eval(line.strip())
            print(player_dict)
            name = re.sub(r'[^a-zA-Z\s]', '', player_dict['name'])
            query = f"""
                INSERT INTO Players (ID, Name, Relevance, Height, Weight, DraftYear, DraftPick, DraftRound, Country, BirthYear)
                VALUES (
                    {int(player_dict['id'])}, 
                    \'{name}\', 
                    0, 
                    \'{player_dict['height']}\', 
                    \'{player_dict['weight']}\',
                    {'NULL' if player_dict['draftyear'] == None or not player_dict['draftyear'].isnumeric() else int(player_dict['draftyear'])},
                    {'NULL' if player_dict['draftpick'] == None or not player_dict['draftpick'].isnumeric() else int(player_dict['draftpick'])},
                    {'NULL' if player_dict['draftround'] == None or not player_dict['draftround'].isnumeric() else int(player_dict['draftround'])},
                    \'{player_dict['country']}\',
                    {int(player_dict['birthyear'])}
                )
                ON DUPLICATE KEY UPDATE ID={int(player_dict['id'])}, Name = \'{name}\', Relevance = 0, 
                Height = \'{player_dict['height']}\', Weight = \'{player_dict['weight']}\', 
                DraftYear = {'NULL' if player_dict['draftyear'] == None or not player_dict['draftyear'].isnumeric() else int(player_dict['draftyear'])}, 
                DraftPick = {'NULL' if player_dict['draftpick'] == None or not player_dict['draftpick'].isnumeric() else int(player_dict['draftpick'])},
                DraftRound = {'NULL' if player_dict['draftround'] == None or not player_dict['draftround'].isnumeric() else int(player_dict['draftround'])},
                Country = \'{player_dict['country']}\',
                BirthYear = {int(player_dict['birthyear'])};
            """
            #print(query)
            #cursor.execute(query)
    return

if __name__ == "__main__":
    if database_conn:
        cursor = database_conn.cursor()
        print("Populating Database Players")
        populate_players(cursor)
        database_conn.commit()
    else:
        print("Database Connection Failed")