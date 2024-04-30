import nba_api
from nba_api.stats.static import teams
from nba_api.stats.endpoints import leaguegamefinder
import pandas as pd
import ast
from tqdm import tqdm

from database_utils import get_connection

database_conn = get_connection('../db_login.json')

def get_teamseasons(file="./teamseason_data.txt"):
    # Get all games
    nba_teams = teams.get_teams()
    
    teamgames_list = []
    teamseason_list = []
    start_index = 0
    with open(file, 'a') as f1, open("./teamgames_data.txt", 'a') as f2:
        for i in tqdm(range(start_index, len(nba_teams))):
            for year in range(1983, 2023):  
                name = f'{year}-{f"{(year+1)%100:02}"}'
                
                season = year+1
                team_id = nba_teams[i]['id']
                gamelog = leaguegamefinder.LeagueGameFinder(team_id_nullable=team_id, season_nullable=name, league_id_nullable='00').get_data_frames()[0]
                games = len(gamelog.index)
                if games == 0: continue

                FGM, FGA, ThreePM, ThreePA, FTM, FTA, PTS, REB, OREB, DREB, AST, STL, BLK, TOV, PF = 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                for _, row in gamelog.iterrows():
                    FGM += row['FGM']
                    FGA += row['FGA']
                    ThreePM += row['FG3M']
                    ThreePA += row['FG3A']
                    FTM += row['FTM']
                    FTA += row['FTA']
                    PTS += row['PTS']
                    REB += row['REB']
                    OREB += row['OREB']
                    DREB += row['DREB']
                    AST += row['AST']
                    STL += row['STL']
                    BLK += row['BLK']
                    TOV += row['TOV']
                    PF += row['PF']

                    teamgame = {
                        'TeamID': team_id,
                        'GameID': row['GAME_ID'],
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
                        'WIN': row['WL']
                    }
                    teamgames_list.append(teamgame)
                    f2.write(str(teamgame) + '\n')

                teamseason = {
                    'TeamID':team_id,
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
                teamseason_list.append(teamseason)
                f1.write(str(teamseason) + '\n')
    return teamseason_list

def populate_teamseasons(cursor, file='./teamseason_data.txt'):
    with open(file, 'r') as f:
        for i, line in tqdm(enumerate(f)):
            #print(i)
            game_dict = ast.literal_eval(line.strip())
            query = f"""
                INSERT INTO TeamSeasons (
                    TeamID,
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
                    {game_dict['TeamID']},
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
                    TeamID = {game_dict['TeamID']},
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

def populate_teamgames(cursor, file='./teamgames_data.txt'):
    with open(file, 'r') as f:
        for i, line in tqdm(enumerate(f)):
            #print(i)
            game_dict = ast.literal_eval(line.strip())
            query = f"""
                INSERT INTO TeamGames (
                    TeamID,
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
                    WIN
                )
                VALUES (
                    {game_dict['TeamID']},
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
                    {'TRUE' if game_dict['WIN'] == 'W' else 'FALSE'}
                )
                ON DUPLICATE KEY UPDATE 
                    TeamID = {game_dict['TeamID']},
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
                    WIN={'TRUE' if game_dict['WIN'] == 'W' else 'FALSE'}
                ;
            """
            #print(query)
            cursor.execute(query)
    return

if __name__ == "__main__":
    if database_conn:
        cursor = database_conn.cursor()
        print("Populating Database TeamGames and TeamSeasons")
        populate_teamgames(cursor)
        database_conn.commit()
    else:
        print("Database Connection Failed")