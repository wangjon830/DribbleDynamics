import json
import pandas as pd

shots_file = '../Data/1_lebron_james_shot_chart_1_2023.csv'
out_file = './pbp.json'

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

if __name__ == '__main__':
    dates = ["Oct 18, 2022", "Oct 28, 2022", "Nov 25, 2022", "Dec 4, 2022", "Apr 4, 2023"]
    shots_json = {
        "success": True,
        "payload": {
            "gameList": [],
            "gameInfo": {}
        }
    }
    gameList = []
    gameInfo = {}
    for id, date in enumerate(dates):
        gameListEntry, gameInfoEntry = getGameInfo(shots_file, date, id)
        shots_json['payload']['gameList'].append(gameListEntry)
        shots_json['payload']['gameInfo'][str(id)] = gameInfoEntry
    with open(out_file, 'w') as f:
        json.dump(shots_json, f, indent=4)