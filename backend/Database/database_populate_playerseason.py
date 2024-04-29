import nba_api
from nba_api.stats.static import players
from nba_api.stats.endpoints import commonplayerinfo
from nba_api.stats.endpoints import playergamelog
import pandas as pd
import ast
from tqdm import tqdm

from database_utils import get_connection

database_conn = get_connection('../db_login.json')

def get_playerseasons(file="./playerseason_data.txt"):
    # Get all games
    playerlist = players.get_players()
    
    playergames_list = []
    playerseason_list = []
    start_index = 2009 + 168 + 6 + 2125
    with open(file, 'a') as f1, open("./playergames_data.txt", 'a') as f2:
        for i in tqdm(range(start_index, len(playerlist))):
            for year in range(1983, 2023):
                name = f'{year}-{f"{(year+1)%100:02}"}'
                
                season = year+1
                player_id = playerlist[i]['id']
                gamelog = playergamelog.PlayerGameLog(player_id=player_id, season=name).get_data_frames()[0]

                games = len(gamelog.index)
                if games == 0: continue

                FGM, FGA, ThreePM, ThreePA, FTM, FTA, PTS, REB, OREB, DREB, AST, STL, BLK, TOV, PF = 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                for _, row in gamelog.iterrows():
                    FGM += 0 if row['FGM']==None else row['FGM']
                    FGA += 0 if row['FGA']==None else row['FGA']
                    ThreePM += 0 if row['FG3M']==None else row['FG3M']
                    ThreePA += 0 if row['FG3A']==None else row['FG3A']
                    FTM += 0 if row['FTM']==None else row['FTM']
                    FTA += 0 if row['FTA']==None else row['FTA']
                    PTS += 0 if row['PTS']==None else row['PTS']
                    REB += 0 if row['REB']==None else row['REB']
                    OREB += 0 if row['OREB']==None else row['OREB']
                    DREB += 0 if row['DREB']==None else row['DREB']
                    AST += 0 if row['AST']==None else row['AST']
                    STL += 0 if row['STL']==None else row['STL']
                    BLK += 0 if row['BLK']==None else row['BLK']
                    TOV += 0 if row['TOV']==None else row['TOV']
                    PF += 0 if row['PF']==None else row['PF']

                    playergame = {
                        'PlayerID': player_id,
                        'GameID': row['Game_ID'],
                        'FGM': row['FGM'],
                        'FGA': row['FGA'],
                        'FGP': 0 if row['FG_PCT'] == None else round(row['FG_PCT']*100,1),
                        '3PM': row['FG3M'],
                        '3PA': row['FG3A'],
                        '3PP': 0 if row['FG3_PCT'] == None else round(row['FG3_PCT']*100,1),
                        'FTM': row['FTM'],
                        'FTA': row['FTA'],
                        'FTP': 0 if row['FT_PCT'] == None else round(row['FT_PCT']*100,1),
                        'PTS': row['PTS'],
                        'REB': row['REB'],
                        'OREB': row['OREB'],
                        'DREB': row['DREB'],
                        'AST': row['AST'],
                        'STL': row['STL'],
                        'BLK': row['BLK'],
                        'TOV': row['TOV'],
                        'PF': row['PF'],
                        'MIN': row['MIN'],
                        'WIN': row['WL']
                    }
                    playergames_list.append(playergame)
                    f2.write(str(playergame) + '\n')

                playerseason = {
                    'PlayerID':player_id,
                    'Year': season,
                    'Games': games,
                    'FGM': FGM,
                    'FGA': FGA,
                    'FGP': 0 if FGA == 0 else round((FGM/FGA)*100, 1),
                    '3PM':ThreePM,
                    '3PA':ThreePA,
                    '3PP': 0 if ThreePA == 0 else round((ThreePM/ThreePA)*100, 1),
                    'FTM': FTM,
                    'FTA': FTA,
                    'FTP': 0 if FTA == 0 else round((FTM/FTA)*100, 1),
                    'PTS': PTS,
                    'REB': REB,
                    'OREB': OREB,
                    'DREB': DREB,
                    'AST': AST,
                    'STL': STL,
                    'BLK': BLK,
                    'TOV': TOV,
                    'PF': PF,
                }
                playerseason_list.append(playerseason)
                f1.write(str(playerseason) + '\n')
    return playerseason_list

def populate_playeseasons(cursor, file='./playerseason_data.txt'):
    with open(file, 'r') as f:
        for i, line in tqdm(enumerate(f)):
            #print(i)
            game_dict = ast.literal_eval(line.strip())
            query = f"""
                INSERT INTO PlayerSeasons (
                    PlayerID,
                    Year,
                    Games,
                    FGM,
                    FGA,
                    FGP,
                    3PM,
                    3PA,
                    3PP,
                    FTM,
                    FTA,
                    FTP,
                    PTS,
                    REB,
                    OREB,
                    DREB,
                    AST,
                    STL,
                    BLK,
                    TOV,
                    PF
                )
                VALUES (
                    {game_dict['PlayerID']},
                    {game_dict['Year']},
                    {game_dict['Games']},
                    {game_dict['FGM']},
                    {game_dict['FGA']},
                    {game_dict['FGP']},
                    {game_dict['3PM']},
                    {game_dict['3PA']},
                    {game_dict['3PP']},
                    {game_dict['FTM']},
                    {game_dict['FTA']},
                    {game_dict['FTP']},
                    {game_dict['PTS']},
                    {game_dict['REB']},
                    {game_dict['OREB']},
                    {game_dict['DREB']},
                    {game_dict['AST']},
                    {game_dict['STL']},
                    {game_dict['BLK']},
                    {game_dict['TOV']},
                    {game_dict['PF']}
                )
                ON DUPLICATE KEY UPDATE 
                    PlayerID = {game_dict['PlayerID']},
                    Year = {game_dict['Year']},
                    Games ={game_dict['Games']},
                    FGM = {game_dict['FGM']},
                    FGA={game_dict['FGA']},
                    FGP={game_dict['FGP']},
                    3PM={game_dict['3PM']},
                    3PA={game_dict['3PA']},
                    3PP={game_dict['3PP']},
                    FTM={game_dict['FTM']},
                    FTA={game_dict['FTA']},
                    FTP={game_dict['FTA']},
                    PTS={game_dict['PTS']},
                    REB={game_dict['REB']},
                    OREB={game_dict['OREB']},
                    DREB={game_dict['DREB']},
                    AST={game_dict['AST']},
                    STL={game_dict['STL']},
                    BLK={game_dict['BLK']},
                    TOV={game_dict['TOV']},
                    PF={game_dict['PF']}
                ;
            """
            #print(query)
            cursor.execute(query)
    return

def populate_playergames(cursor, file='./playergames_data.txt'):
    with open(file, 'r') as f:
        for i, line in tqdm(enumerate(f)):
            #print(i)
            game_dict = ast.literal_eval(line.strip())
            query = f"""
                INSERT INTO PlayerGames (
                    PlayerID,
                    GameID,
                    FGM,
                    FGA,
                    FGP,
                    3PM,
                    3PA,
                    3PP,
                    FTM,
                    FTA,
                    FTP,
                    PTS,
                    REB,
                    OREB,
                    DREB,
                    AST,
                    STL,
                    BLK,
                    TOV,
                    PF,
                    MIN,
                    WIN
                )
                VALUES (
                    {game_dict['PlayerID']},
                    {game_dict['GameID']},
                    {game_dict['FGM']},
                    {game_dict['FGA']},
                    {game_dict['FGP']},
                    {game_dict['3PM']},
                    {game_dict['3PA']},
                    {game_dict['3PP']},
                    {game_dict['FTM']},
                    {game_dict['FTA']},
                    {game_dict['FTP']},
                    {game_dict['PTS']},
                    {game_dict['REB']},
                    {game_dict['OREB']},
                    {game_dict['DREB']},
                    {game_dict['AST']},
                    {game_dict['STL']},
                    {game_dict['BLK']},
                    {game_dict['TOV']},
                    {game_dict['PF']},
                    {game_dict['MIN']},
                    {'TRUE' if game_dict['WIN'] == 'W' else 'FALSE'}
                )
                ON DUPLICATE KEY UPDATE 
                    PlayerID = {game_dict['PlayerID']},
                    GameID = {game_dict['GameID']},
                    FGM = {game_dict['FGM']},
                    FGA={game_dict['FGA']},
                    FGP={game_dict['FGP']},
                    3PM={game_dict['3PM']},
                    3PA={game_dict['3PA']},
                    3PP={game_dict['3PP']},
                    FTM={game_dict['FTM']},
                    FTA={game_dict['FTA']},
                    FTP={game_dict['FTA']},
                    PTS={game_dict['PTS']},
                    REB={game_dict['REB']},
                    OREB={game_dict['OREB']},
                    DREB={game_dict['DREB']},
                    AST={game_dict['AST']},
                    STL={game_dict['STL']},
                    BLK={game_dict['BLK']},
                    TOV={game_dict['TOV']},
                    PF={game_dict['PF']},
                    MIN={game_dict['MIN']},
                    WIN={'TRUE' if game_dict['WIN'] == 'W' else 'FALSE'}
                ;
            """
            #print(query)
            cursor.execute(query)
    return

if __name__ == "__main__":
    if database_conn:
        cursor = database_conn.cursor()
        print("Populating Database Games")
        populate_playergames(cursor)
        database_conn.commit()
    else:
        print("Database Connection Failed")