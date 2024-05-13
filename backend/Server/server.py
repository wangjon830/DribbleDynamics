import mysql.connector
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from database_utils import get_connection
import datetime
import math
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/get_players', methods=['GET'])
def get_players():
    try:
        database_conn = get_connection('../db_login.json')
        if database_conn:
            cursor = database_conn.cursor()

        sortby = request.args.get('sortby', 'name ASC').split()

        search = request.args.get('search', '').lower()
        page = int(request.args.get('page', 1))
        pagesize = int(request.args.get('pagesize', 10))

        query = f'''
            SELECT ID, Name, min_year, max_year, teams, relevance
            FROM players 
            JOIN (
                SELECT playerid, MIN(year) AS min_year, MAX(year) AS max_year
                FROM playerseasons
                GROUP BY playerid
            ) ps ON players.id = ps.playerid
            JOIN (
                SELECT playerid, GROUP_CONCAT(DISTINCT abr) AS teams
                FROM playerteams 
                INNER JOIN teams 
                ON playerteams.teamid = teams.id
                GROUP BY PlayerID
            ) pt ON pt.playerid = players.id
            WHERE name LIKE %s
            ORDER BY {sortby[0]} {sortby[1]}
            LIMIT {pagesize} OFFSET {(page-1)*pagesize};
        '''
        cursor.execute(query, (f"%{search}%",))
        player_list = []
        player_query = cursor.fetchall()
        for row in player_query:
            player = {
                "id":row[0],
                "name":row[1],
                "teams":row[4].split(','),
                "start_season": row[2],
                "end_season": row[3]
            }
            player_list.append(player)

        ret = {
            "success": True,
            "payload": {
                "size":len(player_list),
                "page":page,
                "players":player_list
            }
        }
        return jsonify(ret)
    except Exception as e:
        print(e)
        return {"success": False, "payload":{}}

@app.route('/get_player_init', methods=['GET'])
def get_player_init():
    try:
        database_conn = get_connection('../db_login.json')
        if database_conn:
            cursor = database_conn.cursor()

        id = request.args.get('id', '')
        query = f'''
            SELECT id, 
                name, 
                AVG(PTS) as PPG, 
                AVG(AST) as APG, 
                AVG(REB) as RPG,
                AVG(STL) as SPG, 
                AVG(BLK) as BPG, 
                AVG(TOV) as TPG, 
                SUM(FGM) / NULLIF(SUM(FGA),0) AS FGP,
                SUM(3PM) / NULLIF(SUM(3PA),0) AS FG3P,
                SUM(FTM) / NULLIF(SUM(FTA),0) AS FTP
            FROM playergames
            JOIN (
                SELECT id, name
                FROM players
            ) as players ON players.id = playergames.playerid
            WHERE playerid = {id};
        '''
        cursor.execute(query)
        player_query = cursor.fetchall()
        if(len(player_query) == 1):
            player_info = player_query[0]

            ret = {
                "success": True,
                "payload": {
                    "id": player_info[0],
                    "name": player_info[1],
                    "career_ppg": 0 if player_info[2] == None else round(player_info[2], 1),
                    "career_apg": 0 if player_info[3] == None else round(player_info[3], 1),
                    "career_rpg": 0 if player_info[4] == None else round(player_info[4], 1),
                    "career_spg": 0 if player_info[5] == None else round(player_info[5], 1),
                    "career_bpg": 0 if player_info[6] == None else round(player_info[6], 1),
                    "career_tpg": 0 if player_info[7] == None else round(player_info[7], 1),
                    "career_fgper": 0 if player_info[8] == None else round(100*player_info[8], 1),
                    "career_fg3per": 0 if player_info[9] == None else round(100*player_info[9], 1),
                    "career_ftper": 0 if player_info[10] == None else round(100*player_info[10], 1)
                }
            }
            return jsonify(ret)
        else:
            raise Exception("No player ID") 
    except Exception as e:
        print(e)
        return {"success": False, "payload":{}}

@app.route('/get_player_career', methods=['GET'])
def get_player_career():
    try:
        database_conn = get_connection('../db_login.json')
        if database_conn:
            cursor = database_conn.cursor()

        id = request.args.get('id', '')
        avgs_query = f'''
            SELECT Year, 
                PTS/NULLIF(Games, 0) as PPG, 
                REB/NULLIF(Games, 0) as RPG,
                OREB/NULLIF(Games, 0) as ORPG,
                DREB/NULLIF(Games, 0) as DRPG,
                AST/NULLIF(Games, 0) as APG,
                STL/NULLIF(Games, 0) as SPG,
                BLK/NULLIF(Games, 0) as BPG,
                TOV/NULLIF(Games, 0) as TPG,
                PF/NULLIF(Games, 0) as FPG,
                FGP,
                3PP,
                FTP,
                Games
            FROM playerseasons
            WHERE playerid = {id};
        '''
        stats = ["ppg", "rpg", "orpg", "drpg", "apg", "spg", "bpg", "tpg", "fpg", "fgp", "tpp", "ftp" , "games"]
        cursor.execute(avgs_query)
        season_query = cursor.fetchall()
        season_list = []
        for row in season_query:
            season = {
                "season":round(row[0], 1),
                "ppg":round(row[1], 1),
                "rpg":round(row[2], 1),
                "orpg":round(row[3], 1),
                "drpg":round(row[4], 1),
                "apg":round(row[5], 1),
                "spg":round(row[6], 1),
                "bpg":round(row[7], 1),
                "tpg":round(row[8], 1),
                "fpg":round(row[9], 1),
                "fgp":round(row[10], 1),
                "tpp":round(row[11], 1),
                "ftp":round(row[12], 1),
                "games":row[13]
            }
            season_list.append(season)

        gamesPer = {}
        
        for season in season_list:
            gamesPer[season['season']] = {
                "games": season['games'],
                "ppg":[],
                "rpg":[],
                "orpg":[],
                "drpg":[],
                "apg":[],
                "spg":[],
                "bpg":[],
                "tpg":[],
                "fpg":[],
                "fgp":[],
                "tpp":[],
                "ftp":[],
                "games":[]
            }
            games_query = f'''
                SELECT pts, reb, oreb, dreb, ast, stl, blk, tov, pf, fgp, 3pp, ftp
                FROM playergames
                JOIN Games on games.id = playergames.gameid
                WHERE PlayerID = {id} AND Season = {season['season']};
            '''

            cursor.execute(games_query)
            games_results = cursor.fetchall()

            for row in games_results:
                gamesPer[season['season']]["ppg"].append(row[0])
                gamesPer[season['season']]["rpg"].append(row[1])
                gamesPer[season['season']]["orpg"].append(row[2])
                gamesPer[season['season']]["drpg"].append(row[3])
                gamesPer[season['season']]["apg"].append(row[4])
                gamesPer[season['season']]["spg"].append(row[5])
                gamesPer[season['season']]["bpg"].append(row[6])
                gamesPer[season['season']]["tpg"].append(row[7])
                gamesPer[season['season']]["fpg"].append(row[8])
                gamesPer[season['season']]["fgp"].append(row[9])
                gamesPer[season['season']]["tpp"].append(row[10])
                gamesPer[season['season']]["ftp"].append(row[11])

        ret = {
            "success": True,
            "payload": {
                "career_stats": {
                    "stats":stats,
                    "seasonAverages": season_list,
                    "gamesPer": gamesPer
                }
            }
        }
        return jsonify(ret)
    except Exception as e:
        print(e)
        return {"success": False, "payload":{}}

@app.route('/get_player_pbp', methods=['GET'])
def get_player_pbp():
    try:
        database_conn = get_connection('../db_login.json')
        if database_conn:
            cursor = database_conn.cursor()

        id = request.args.get('id', '')
        game_query = f'''
            SELECT DISTINCT GameID, HomeTeam, AwayTeam, Date, Games.Homescore, Games.AwayScore, Quarters
            FROM playershots
            JOIN Games ON games.id = Playershots.gameid
            WHERE playerid = {id};
        '''
        cursor.execute(game_query)
        game_results = cursor.fetchall()
        game_list = []
        game_info = {}
        for game in game_results:
            formatted_date = game[3].strftime('%b %d, %Y')
            season = {
                "id": game[0],
                "name": f'{game[2]} @ {game[1]} on {formatted_date}'
            }
            game_list.append(season)

            game_info[str(game[0])] = {
                "shots":[],
                "finalScore": [game[4], game[5]],
                "overtimes": max(int(game[6])-4, 0),
                "teams": [game[1], game[2]],
                "date": formatted_date,
            }
            shot_query = f'''
                SELECT X, Y, Time, Miss, Playershots.HomeScore, Playershots.AwayScore, Distance, Type
                FROM playershots
                JOIN games on games.id = playershots.gameid
                WHERE gameid = {game[0]}
            '''
            cursor.execute(shot_query)
            shot_results = cursor.fetchall()
            for shot in shot_results:
                shot_entry = {
                    "x": shot[0],
                    "y": shot[1],
                    "time": shot[2],
                    "miss": bool(shot[3]),
                    "score": [shot[4], shot[5]],
                    "distance":shot[6],
                    "type": int(shot[7])
                }
                game_info[str(game[0])]['shots'].append(shot_entry)

        ret = {
            "success": True,
            "payload": {
                "gameList": game_list,
                "gameInfo": game_info
            }
        }
        return jsonify(ret)
    except Exception as e:
        print(e)
        return {"success": False, "payload":{}}
    
@app.route('/get_player_similar_setup', methods=['GET'])
def get_player_similar_setup():
    try:
        database_conn = get_connection('../db_login.json')
        if database_conn:
            cursor = database_conn.cursor()

        id = request.args.get('id', '')
        radar_query = f'''
            WITH PlayerAverages AS (
                SELECT 
                    PlayerId,
                    SUM(PTS) / NULLIF(SUM(GAMES), 0) AS PPG, 
                    SUM(REB) / NULLIF(SUM(GAMES), 0) AS RPG, 
                    SUM(AST) / NULLIF(SUM(GAMES), 0) AS APG, 
                    SUM(STL) / NULLIF(SUM(GAMES), 0) AS SPG, 
                    SUM(BLK) / NULLIF(SUM(GAMES), 0) AS BPG,
                    SUM(FGA) / NULLIF(SUM(GAMES), 0) AS FGAPG, 
                    SUM(FGM) / NULLIF(SUM(FGA), 0) AS FGP,
                    SUM(3PA) / NULLIF(SUM(GAMES), 0) AS 3PAPG, 
                    SUM(3PM) / NULLIF(SUM(3PA), 0) AS 3PP,
                    SUM(FTA) / NULLIF(SUM(GAMES), 0) AS FTAPG, 
                    SUM(FTM) / NULLIF(SUM(FTA), 0) AS FTP
                FROM playerseasons
                GROUP BY PlayerId
            ), StatsExtremes AS (
                SELECT 
                    MAX(PPG) AS MAX_PPG, MIN(PPG) AS MIN_PPG,
                    MAX(RPG) AS MAX_RPG, MIN(RPG) AS MIN_RPG,
                    MAX(APG) AS MAX_APG, MIN(APG) AS MIN_APG,
                    MAX(SPG) AS MAX_SPG, MIN(SPG) AS MIN_SPG,
                    MAX(BPG) AS MAX_BPG, MIN(BPG) AS MIN_BPG,
                    MAX(FGAPG) AS MAX_FGAPG, MIN(FGAPG) AS MIN_FGAPG,
                    MAX(FGP) AS MAX_FGP, MIN(FGP) AS MIN_FGP,
                    MAX(3PAPG) AS MAX_3PAPG, MIN(3PAPG) AS MIN_3PAPG,
                    MAX(3PP) AS MAX_3PP, MIN(3PP) AS MIN_3PP,
                    MAX(FTAPG) AS MAX_FTAPG, MIN(FTAPG) AS MIN_FTAPG,
                    MAX(FTP) AS MAX_FTP, MIN(FTP) AS MIN_FTP
                FROM PlayerAverages
            )
            SELECT 
                a.PlayerId,
                (a.PPG - e.MIN_PPG) * 100 / (e.MAX_PPG - e.MIN_PPG) AS normalized_ppg,
                (a.RPG - e.MIN_RPG) * 100 / (e.MAX_RPG - e.MIN_RPG) AS normalized_rpg,
                (a.APG - e.MIN_APG) * 100 / (e.MAX_APG - e.MIN_APG) AS normalized_apg,
                (a.SPG - e.MIN_SPG) * 100 / (e.MAX_SPG - e.MIN_SPG) AS normalized_spg,
                (a.BPG - e.MIN_BPG) * 100 / (e.MAX_BPG - e.MIN_BPG) AS normalized_bpg,
                (a.FGAPG - e.MIN_FGAPG) * 100 / (e.MAX_FGAPG - e.MIN_FGAPG) AS normalized_fgapg,
                (a.FGP - e.MIN_FGP) * 100 / (e.MAX_FGP - e.MIN_FGP) AS normalized_fgp,
                (a.3PAPG - e.MIN_3PAPG) * 100 / (e.MAX_3PAPG - e.MIN_3PAPG) AS normalized_3papg,
                (a.3PP - e.MIN_3PP) * 100 / (e.MAX_3PP - e.MIN_3PP) AS normalized_3pp,
                (a.FTAPG - e.MIN_FTAPG) * 100 / (e.MAX_FTAPG - e.MIN_FTAPG) AS normalized_ftapg,
                (a.FTP - e.MIN_FTP) * 100 / (e.MAX_FTP - e.MIN_FTP) AS normalized_ftp
            FROM PlayerAverages a, StatsExtremes e
            WHERE PlayerID = {id};
        '''
        stats = ["ppg", "rpg", "apg", "spg", "bpg", "fga", "fgp", "tpa", "tpp", "fta", "ftp"]
        cursor.execute(radar_query)
        player_query = cursor.fetchall()
        if(len(player_query) == 1):
            player_info = player_query[0]

            ret = {
                "success": True,
                "payload": {
                    "stats": stats,
                    "radar_chart": {
                        "ppg": 0 if player_info[1] == None else round(player_info[1], 1),
                        "rpg": 0 if player_info[2] == None else  round(player_info[2], 1),
                        "apg": 0 if player_info[3] == None else  round(player_info[3], 1),
                        "spg": 0 if player_info[4] == None else  round(player_info[4], 1),
                        "bpg": 0 if player_info[5] == None else  round(player_info[5], 1),
                        "fga": 0 if player_info[6] == None else  round(player_info[6], 1),
                        "fgp": 0 if player_info[7] == None else  round(player_info[7], 1),
                        "tpa": 0 if player_info[8] == None else  round(player_info[8], 1),
                        "tpp": 0 if player_info[9] == None else  round(player_info[9], 1),
                        "fta": 0 if player_info[10] == None else  round(player_info[10], 1),
                        "ftp": 0 if player_info[11] == None else  round(player_info[11], 1)
                    }
                }
            }
            return jsonify(ret)
        else:
            raise Exception("No player ID") 
    except Exception as e:
        print(e)
        return {"success": False, "payload":{}}

def getPlayerPoints1D(info, selected_stats):
    points = []
    loadings = {
        selected_stats[0]:[1, 0]
    }
    for player in info:
        # 0 is ID, 1 is name, 2 is parameter
        if None not in player: 
            player_point = {
                "id": player[0],
                "name":player[1],
                "x": float(player[2]),
                "y": 1
            }
            points.append(player_point)
    return points, loadings

def getPlayerPoints2D(info, selected_stats):
    points = []
    loadings = {
        selected_stats[0]:[1, 0],
        selected_stats[1]:[0, 1]
    }
    for player in info:
        # 0 is ID, 1 is name, 2 and 3 are parameters
        if None not in player: 
            player_point = {
                "id": player[0],
                "name":player[1],
                "x": float(player[2]),
                "y": float(player[3]),
            }
            points.append(player_point)
    return points, loadings

def getPlayerPointsND(info, selected_stats):
    data = [entry[2:] for entry in info]
    df = pd.DataFrame(data, columns=selected_stats).fillna(0)
    df = StandardScaler().fit_transform(df)
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(df)
    pc1_loadings, pc2_loadings = pca.components_

    points = []
    loadings = {}
    if(len(pc1_loadings) != len(selected_stats)): print("Error mismatched sizes")
    for i, variable in enumerate(zip(pc1_loadings, pc2_loadings)):
        loadings[selected_stats[i]] = variable
    
    if(len(pca_result) != len(info)): print("Error mismatched sizes")
    for i, (x, y) in enumerate(pca_result):
        player_info = info[i]
        # 0 is ID, 1 is name
        player_point = {
            "id": player_info[0],
            "name":player_info[1],
            "x": float(x),
            "y": float(y),
        }
        points.append(player_point)
    return points, loadings

def getDistance(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

@app.route('/get_player_similar', methods=['GET'])
def get_player_similar(k=200):
    try:
        database_conn = get_connection('../db_login.json')
        if database_conn:
            cursor = database_conn.cursor()

        id = int(request.args.get('id', ''))
        stats_str = request.args.get('stats', '')
        selected_stats = []
        if(len(stats_str) > 0):
            selected_stats = stats_str.split(',')

        if len(selected_stats) == 0:
            return {
                "success": True,
                "payload": {
                    "loadings": {}, 
                    "scatter": {
                        "num_points": 0,
                        "points": []
                    }
                }
            }
        elif len(selected_stats) == 1:
            pointsFun = getPlayerPoints1D
        elif len(selected_stats) == 2:
            pointsFun = getPlayerPoints2D
        else:
            pointsFun = getPlayerPointsND

        other_players_info_query = f'''
            WITH PlayerAverages AS (
                SELECT 
                    PlayerId,
                    SUM(PTS) / NULLIF(SUM(GAMES), 0) AS ppg, 
                    SUM(REB) / NULLIF(SUM(GAMES), 0) AS rpg, 
                    SUM(AST) / NULLIF(SUM(GAMES), 0) AS apg, 
                    SUM(STL) / NULLIF(SUM(GAMES), 0) AS spg, 
                    SUM(BLK) / NULLIF(SUM(GAMES), 0) AS bpg,
                    SUM(FGA) / NULLIF(SUM(GAMES), 0) AS fga, 
                    SUM(FGM) / NULLIF(SUM(FGA), 0) AS fgp,
                    SUM(3PA) / NULLIF(SUM(GAMES), 0) AS tpa, 
                    SUM(3PM) / NULLIF(SUM(3PA), 0) AS tpp,
                    SUM(FTA) / NULLIF(SUM(GAMES), 0) AS fta, 
                    SUM(FTM) / NULLIF(SUM(FTA), 0) AS ftp
                FROM playerseasons
                GROUP BY PlayerId
            )
            SELECT PlayerId, Name, {', '.join(selected_stats)}
            FROM PlayerAverages
            JOIN players ON players.id = PlayerAverages.playerid;
        '''
        cursor.execute(other_players_info_query)
        player_info_list = [list(t) for t in cursor.fetchall()]
        player_points, loadings =  pointsFun(player_info_list, selected_stats)
        my_player_point = None
        for player_point in player_points:
            if player_point['id'] == id:
                my_player_point = player_point
        for i in range(len(player_points)):
            distance = getDistance([player_points[i]['x'], player_points[i]['y']], [my_player_point['x'], my_player_point['y']])
            
            player_points[i]['distance'] = distance
        player_points.sort(key=lambda x:x['distance'])

        nearest_player_points = player_points[0:k]
        ids = [str(p['id']) for p in nearest_player_points]

        radar_query = f'''
            WITH PlayerAverages AS (
                SELECT 
                    PlayerId,
                    SUM(PTS) / NULLIF(SUM(GAMES), 0) AS PPG, 
                    SUM(REB) / NULLIF(SUM(GAMES), 0) AS RPG, 
                    SUM(AST) / NULLIF(SUM(GAMES), 0) AS APG, 
                    SUM(STL) / NULLIF(SUM(GAMES), 0) AS SPG, 
                    SUM(BLK) / NULLIF(SUM(GAMES), 0) AS BPG,
                    SUM(FGA) / NULLIF(SUM(GAMES), 0) AS FGAPG, 
                    SUM(FGM) / NULLIF(SUM(FGA), 0) AS FGP,
                    SUM(3PA) / NULLIF(SUM(GAMES), 0) AS 3PAPG, 
                    SUM(3PM) / NULLIF(SUM(3PA), 0) AS 3PP,
                    SUM(FTA) / NULLIF(SUM(GAMES), 0) AS FTAPG, 
                    SUM(FTM) / NULLIF(SUM(FTA), 0) AS FTP
                FROM playerseasons
                GROUP BY PlayerId
            ), StatsExtremes AS (
                SELECT 
                    MAX(PPG) AS MAX_PPG, MIN(PPG) AS MIN_PPG,
                    MAX(RPG) AS MAX_RPG, MIN(RPG) AS MIN_RPG,
                    MAX(APG) AS MAX_APG, MIN(APG) AS MIN_APG,
                    MAX(SPG) AS MAX_SPG, MIN(SPG) AS MIN_SPG,
                    MAX(BPG) AS MAX_BPG, MIN(BPG) AS MIN_BPG,
                    MAX(FGAPG) AS MAX_FGAPG, MIN(FGAPG) AS MIN_FGAPG,
                    MAX(FGP) AS MAX_FGP, MIN(FGP) AS MIN_FGP,
                    MAX(3PAPG) AS MAX_3PAPG, MIN(3PAPG) AS MIN_3PAPG,
                    MAX(3PP) AS MAX_3PP, MIN(3PP) AS MIN_3PP,
                    MAX(FTAPG) AS MAX_FTAPG, MIN(FTAPG) AS MIN_FTAPG,
                    MAX(FTP) AS MAX_FTP, MIN(FTP) AS MIN_FTP
                FROM PlayerAverages
            )
            SELECT 
                a.PlayerId,
                (a.PPG - e.MIN_PPG) * 100 / (e.MAX_PPG - e.MIN_PPG) AS normalized_ppg,
                (a.RPG - e.MIN_RPG) * 100 / (e.MAX_RPG - e.MIN_RPG) AS normalized_rpg,
                (a.APG - e.MIN_APG) * 100 / (e.MAX_APG - e.MIN_APG) AS normalized_apg,
                (a.SPG - e.MIN_SPG) * 100 / (e.MAX_SPG - e.MIN_SPG) AS normalized_spg,
                (a.BPG - e.MIN_BPG) * 100 / (e.MAX_BPG - e.MIN_BPG) AS normalized_bpg,
                (a.FGAPG - e.MIN_FGAPG) * 100 / (e.MAX_FGAPG - e.MIN_FGAPG) AS normalized_fgapg,
                (a.FGP - e.MIN_FGP) * 100 / (e.MAX_FGP - e.MIN_FGP) AS normalized_fgp,
                (a.3PAPG - e.MIN_3PAPG) * 100 / (e.MAX_3PAPG - e.MIN_3PAPG) AS normalized_3papg,
                (a.3PP - e.MIN_3PP) * 100 / (e.MAX_3PP - e.MIN_3PP) AS normalized_3pp,
                (a.FTAPG - e.MIN_FTAPG) * 100 / (e.MAX_FTAPG - e.MIN_FTAPG) AS normalized_ftapg,
                (a.FTP - e.MIN_FTP) * 100 / (e.MAX_FTP - e.MIN_FTP) AS normalized_ftp
            FROM PlayerAverages a, StatsExtremes e
            WHERE PlayerID IN ({', '.join(ids)});
        '''
        cursor.execute(radar_query)
        radars = cursor.fetchall()
        nearest_player_points.sort(key=lambda x:x['id'])
        for i in range(len(radars)):
            nearest_player_points[i]["radar_chart"] = {
                "ppg": 0 if radars[i][1] == None else round(radars[i][1], 1),
                "rpg": 0 if radars[i][2] == None else  round(radars[i][2], 1),
                "apg": 0 if radars[i][3] == None else  round(radars[i][3], 1),
                "spg": 0 if radars[i][4] == None else  round(radars[i][4], 1),
                "bpg": 0 if radars[i][5] == None else  round(radars[i][5], 1),
                "fga": 0 if radars[i][6] == None else  round(radars[i][6], 1),
                "fgp": 0 if radars[i][7] == None else  round(radars[i][7], 1),
                "tpa": 0 if radars[i][8] == None else  round(radars[i][8], 1),
                "tpp": 0 if radars[i][9] == None else  round(radars[i][9], 1),
                "fta": 0 if radars[i][10] == None else  round(radars[i][10], 1),
                "ftp": 0 if radars[i][11] == None else  round(radars[i][11], 1)
            }
        ret = {
            "success": True,
            "payload": {
                "loadings": loadings, 
                "scatter": {
                    "num_points": len(nearest_player_points),
                    "points": nearest_player_points
                }
            }
        }
        return jsonify(ret)
    except Exception as e:
        print(e)
        return {"success": False, "payload":{}}

@app.route('/get_teams', methods=['GET'])
def get_teams():
    try:
        database_conn = get_connection('../db_login.json')
        if database_conn:
            cursor = database_conn.cursor()

        query = f'''
            SELECT * FROM teams;
        '''
        cursor.execute(query)
        team_list = []
        team_query = cursor.fetchall()
        for row in team_query:
            player = {
                "id":row[0],
                "name":row[1],
                "abbreviation": row[2],
                "founded": row[3],
                "championships": row[6]
            }
            team_list.append(player)

        ret = {
            "success": True,
            "payload": {
                "size":len(team_list),
                "page":1,
                "teams":team_list
            }
        }
        return jsonify(ret)
    except Exception as e:
        print(e)
        return {"success": False, "payload":{}}
    
@app.route('/get_team_init', methods=['GET'])
def get_team_init():
    try:
        database_conn = get_connection('../db_login.json')
        if database_conn:
            cursor = database_conn.cursor()

        id = request.args.get('id', '')
        query = f'''
            SELECT ID, Name, Titles, ConfTitles, DivTitles FROM teams WHERE ID = {id};
        '''

        cursor.execute(query)
        team_query = cursor.fetchall()
        if(len(team_query) == 1):
            team_info = team_query[0]

            ret = {
                "success": True,
                "payload": {
                    "id": team_info[0],
                    "name": team_info[1],
                    "championships":team_info[2],
                    "conference_titles":team_info[3],
                    "division_titles":team_info[4]
                }
            }
            return jsonify(ret)
        else:
            raise Exception("No team ID") 
    except Exception as e:
        print(e)
        return {"success": False, "payload":{}}

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True, threaded=True)

        