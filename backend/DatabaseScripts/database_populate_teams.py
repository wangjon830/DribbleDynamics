import nba_api
from nba_api.stats.static import teams
import pandas as pd

from database_utils import get_connection

database_conn = get_connection('../db_login.json')

additional_info = {
    1610612737: {
        'Championships':1,
        'ConfTitles':0,
        'DivTitles':12
    },
    1610612738: {
        'Championships':17,
        'ConfTitles':10,
        'DivTitles':34
    },
    1610612739: {
        'Championships':1,
        'ConfTitles':5,
        'DivTitles':7
    },
    1610612740: {
        'Championships':0,
        'ConfTitles':0,
        'DivTitles':1
    },
    1610612741: {
        'Championships':6,
        'ConfTitles':6,
        'DivTitles':9
    },
    1610612742: {
        'Championships':1,
        'ConfTitles':2,
        'DivTitles':5
    },
    1610612743: {
        'Championships':1,
        'ConfTitles':1,
        'DivTitles':12
    },
    1610612744: {
        'Championships':7,
        'ConfTitles':11,
        'DivTitles':7
    },
    1610612745: {
        'Championships':2,
        'ConfTitles':4,
        'DivTitles':8
    },
    1610612746: {
        'Championships':0,
        'ConfTitles':0,
        'DivTitles':3
    },
    1610612747: {
        'Championships':18,
        'ConfTitles':19,
        'DivTitles':34
    },
    1610612748: {
        'Championships':3,
        'ConfTitles':7,
        'DivTitles':16
    },
    1610612749: {
        'Championships':2,
        'ConfTitles':3,
        'DivTitles':19
    },
    1610612750: {
        'Championships':0,
        'ConfTitles':0,
        'DivTitles':1
    },
    1610612751: {
        'Championships':2,
        'ConfTitles':2,
        'DivTitles':5
    },
    1610612752: {
        'Championships':2,
        'ConfTitles':4,
        'DivTitles':8
    },
    1610612753: {
        'Championships':0,
        'ConfTitles':2,
        'DivTitles':7
    },
    1610612754: {
        'Championships':3,
        'ConfTitles':1,
        'DivTitles':9
    },
    1610612755: {
        'Championships':3,
        'ConfTitles':5,
        'DivTitles':12
    },
    1610612756: {
        'Championships':0,
        'ConfTitles':3,
        'DivTitles':8
    },
    1610612757: {
        'Championships':1,
        'ConfTitles':3,
        'DivTitles':6
    },
    1610612758: {
        'Championships':2,
        'ConfTitles':0,
        'DivTitles':6
    },
    1610612759: {
        'Championships':5,
        'ConfTitles':6,
        'DivTitles':22
    },
    1610612760: {
        'Championships':1,
        'ConfTitles':4,
        'DivTitles':12
    },
    1610612761: {
        'Championships':1,
        'ConfTitles':1,
        'DivTitles':7
    },
    1610612762: {
        'Championships':0,
        'ConfTitles':2,
        'DivTitles':11
    },
    1610612763: {
        'Championships':0,
        'ConfTitles':0,
        'DivTitles':2
    },
    1610612764: {
        'Championships':1,
        'ConfTitles':4,
        'DivTitles':8
    },
    1610612765: {
        'Championships':5,
        'ConfTitles':5,
        'DivTitles':15
    },
    1610612766: {
        'Championships':0,
        'ConfTitles':0,
        'DivTitles':0
    }
}
def get_teams(file="./team_data.json"):
    # Get all players
    nba_teams = teams.get_teams()
    return nba_teams

def populate_teams(cursor):
    teams = get_teams()
    for team in teams:
        query = f"""
            INSERT INTO Teams (ID, Name, Abr, Founded, Titles, ConfTitles, DivTitles)
            VALUES ({team['id']}, \'{team['full_name']}\', \'{team['abbreviation']}\', {team['year_founded']}, {additional_info[team['id']]['Championships']}, {additional_info[team['id']]['ConfTitles']}, {additional_info[team['id']]['DivTitles']})
            ON DUPLICATE KEY UPDATE Name=\'{team['full_name']}\', Abr=\'{team['abbreviation']}\', Founded={team['year_founded']}, Titles={additional_info[team['id']]['Championships']}, ConfTitles = {additional_info[team['id']]['ConfTitles']}, DivTitles = {additional_info[team['id']]['DivTitles']};
        """
        cursor.execute(query)


if __name__ == "__main__":
    if database_conn:
        cursor = database_conn.cursor()
        print("Populating Database Teams")
        populate_teams(cursor)
        database_conn.commit()
    else:
        print("Database Connection Failed")