############################
#Method 1 not working
#import nbaHeadshots
#from nbaHeadshots import getHeadshotById, getAllHeadshots

# Lebron James headshot will be saved as lebron.jpg in saveHere folder
#getHeadshotById(2544, folder="saveHere/", fileName="lebron.jpg")

# Lebron James headshot will be saved as 2544.png in current directory
#getHeadshotById(2544)

# All headshots will be saved as "id".png in saveHere folder
#getAllHeadshots("saveHere/")
#################################################################

#Method 2 
#To download images from base url
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats, playergamelog
import os
import requests

# Function to download headshot of a player
#Only need this if you download and save images
def download_headshot(player_id, player_name):
    base_url = "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/"
    headshot_url = f"{base_url}{player_id}.png"
    response = requests.get(headshot_url)
    if response.status_code == 200:
        with open(f"{player_name}_{player_id}.png", 'wb') as f:
            f.write(response.content)
            print(f"Downloaded headshot for {player_name}")
    else:
        print(f"Failed to download headshot for {player_name}")

# Get all NBA players
all_players = players.get_players()

# Download headshots for all players
for player in all_players:
    player_id = player['id']
    player_name = player['full_name']
    download_headshot(player_id, player_name)

##########################################################
#Method 3
#To return only the complete url/ no downloads (HD images)
from nba_api.stats.static import players
import os
import requests

# Function to return url
def get_headshoturl(player_id, player_name):
    base_url = "https://cdn.nba.com/headshots/nba/latest/1040x760/"
    headshot_url = f"{base_url}{player_id}.png"
    response = requests.get(headshot_url)
    if response.status_code == 200:
        return(headshot_url)
        print(f"Downloaded headshot for {player_name}")
    else:
        print(f"Failed to download headshot for {player_name}")

# Get all NBA players
all_players = players.get_players()

# Download headshots for all players
for player in all_players:
    player_id = player['id']
    player_name = player['full_name']
    get_headshoturl(player_id, player_name)
