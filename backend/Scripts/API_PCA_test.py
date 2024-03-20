from nba_api.stats.endpoints import playercareerstats
import pandas as pd 
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Nikola Jokić
#career = playercareerstats.PlayerCareerStats(player_id='203999') 

# pandas data frames (optional: pip install pandas)
#df1 = career.get_data_frames()[0]
#print(df1)

#Lebron James
#career = playercareerstats.PlayerCareerStats(player_id='2544')
#df2 = career.get_data_frames()[0]
#print(df2)

#Michael Jordan
#career = playercareerstats.PlayerCareerStats(player_id='893')
#df3 = career.get_data_frames()[0]
#print(df3)
#frames = [df1,df2,df3]
#result = pd.concat(frames)
#print(result)
#result.to_csv('CareerStat.csv', index=False)

df = pd.read_csv('CareerStat.csv')

# Define all the features you want to do PCA of minimum 3 recommended
features = ['REB', 'AST', 'FGM']
x = df.loc[:, features].values
x = StandardScaler().fit_transform(x)
print(pd.DataFrame(data = x, columns = features).head())
#Storing Standardized features in a data frame y
y = pd.DataFrame(data = x, columns = features)
pca = PCA(n_components=2)
principalComponents = pca.fit_transform(x)
principalDf = pd.DataFrame(data = principalComponents
             , columns = ['principal component 1', 'principal component 2'])
print(principalDf.head(5))
fig = plt.figure(figsize = (8,8))
ax = fig.add_subplot(1,1,1) 
ax.set_xlabel('Principal Component 1', fontsize = 15)
ax.set_ylabel('Principal Component 2', fontsize = 15)
ax.set_title('2 Component PCA', fontsize = 20)


targets = ['Nikola Jokic', 'Lebron James', 'Michael Jordan']
colors = ['r', 'g', 'b']
for PLAYER_NAME, color in zip(targets,colors):
    indicesToKeep = df['PLAYER_NAME'] == PLAYER_NAME
    ax.scatter(principalDf.loc[indicesToKeep, 'principal component 1']
               , principalDf.loc[indicesToKeep, 'principal component 2']
               , c = color
               , s = 50)
ax.legend(targets)
ax.grid()

#PCA to individual Stat ---> Changing X axis to any stat and Choosing one of the two principal components in Y axis
fig = plt.figure(figsize = (8,8))
ax = fig.add_subplot(1,1,1) 
ax.set_xlabel('Field Goal Made', fontsize = 15)
ax.set_ylabel('Principal Component 2', fontsize = 15)
ax.set_title('2 Component PCA', fontsize = 20)


targets = ['Nikola Jokic', 'Lebron James', 'Michael Jordan']
colors = ['r', 'g', 'b']
for PLAYER_NAME, color in zip(targets,colors):
    indicesToKeep = df['PLAYER_NAME'] == PLAYER_NAME
    ax.scatter(y.loc[indicesToKeep, 'FGM']
               , principalDf.loc[indicesToKeep, 'principal component 2']
               , c = color
               , s = 50)
ax.legend(targets)
ax.grid()
print('Explained variation per principal component: {}'.format(pca.explained_variance_ratio_))





