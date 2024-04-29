from nba_api.stats.endpoints import leaguegamefinder
import pandas as pd
import ast
import re
import tqdm

from database_utils import get_connection

database_conn = get_connection('../db_login.json')

def get_games(file="./game_data.txt"):
    # Get all games
    game_list = []
    with open(file, 'a') as f:
        for year in range(1983, 2023):
            name = f'{year}-{f"{(year+1)%100:02}"}'
            season = year+1
            print(f"Season {name}")
            gamefinder = leaguegamefinder.LeagueGameFinder(season_nullable=name, league_id_nullable='00')
            games = gamefinder.get_data_frames()[0]
            for game_id in games['GAME_ID'].unique():
                curr_game = games[games['GAME_ID'] == game_id]

                team1 = curr_game.iloc[0].values
                team2 = curr_game.iloc[1].values

                quarters = max(4, 4 + int(((team1[8]/5) - 48)/5))
                date = team1[5]

                if('@' in team1[6]):
                    awayteam = team1[2]
                    hometeam = team2[2]
                    awayscore = team1[9]
                    homescore = team2[9]
                else:
                    awayteam = team2[2]
                    hometeam = team1[2]
                    awayscore = team2[9]
                    homescore = team1[9]
                
                game_dict = {
                    'ID': game_id,
                    'Date': date,
                    'HomeTeam': hometeam,
                    'AwayTeam': awayteam,
                    'HomeScore': homescore,
                    'AwayScore': awayscore,
                    'Quarters': quarters,
                    'Season': season
                }
                game_list.append(game_dict)
                f.write(str(game_dict) + '\n')
    return game_list

def populate_games(cursor, file='./game_data.txt'):
    with open(file, 'r') as f:
        for i, line in enumerate(f):
            #print(i)
            game_dict = ast.literal_eval(line.strip())
            query = f"""
                INSERT INTO Games (ID, Date, HomeTeam, AwayTeam, HomeScore, AwayScore, Quarters, Season)
                VALUES (
                    {int(game_dict['ID'])}, 
                    \'{game_dict['Date']}\',
                    \'{game_dict['HomeTeam']}\',
                    \'{game_dict['AwayTeam']}\',
                    {game_dict['HomeScore']},
                    {game_dict['AwayScore']},
                    {game_dict['Quarters']},
                    {game_dict['Season']}
                )
                ON DUPLICATE KEY UPDATE ID={int(game_dict['ID'])}, Date = \'{game_dict['Date']}\', 
                HomeTeam = \'{game_dict['HomeTeam']}\', AwayTeam = \'{game_dict['AwayTeam']}\',
                HomeScore = {game_dict['HomeScore']}, AwayScore = {game_dict['AwayScore']},
                Quarters = {game_dict['Quarters']}, Season = {game_dict['Season']};
            """
            #print(query)
            cursor.execute(query)
    return

if __name__ == "__main__":
    if database_conn:
        cursor = database_conn.cursor()
        print("Populating Database Games")
        populate_games(cursor)
        database_conn.commit()
    else:
        print("Database Connection Failed")