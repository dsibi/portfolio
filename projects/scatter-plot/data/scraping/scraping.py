## web-scrapping
# import requests
# from bs4 import BeautifulSoup
# url = "https://www.imdb.com/chart/top/?ref_=nv_mv_250"
# response = requests.get(url)
# soup = BeautifulSoup(response.text, 'html.parser')
# print(soup.title)
# soup = BeautifulSoup(response.text, 'lxml')
# soup.find('div', class_="news-dzen-header")
# # print(req)

## pandas profiling
# from pandas_profiling import ProfileReport
# import pandas as pd
# df = pd.read_csv("C:/Users/dsibi/OneDrive/Documents/Projects/JavaScript/myportfolio/projects/scatter-plot/data/scraping/movies_metadata.csv")
# report = ProfileReport(df)
# report.to_file('./projects/scatter-plot/data/scraping/report.html')
# report.to_html()

# # df.describe( )
# import pandas as pd
# df = pd.read_csv("C:/Users/dsibi/OneDrive/Documents/Projects/JavaScript/myportfolio/projects/scatter-plot/data/scraping/movies_metadata.csv", low_memory=False)
# print(df.describe( ))


import sweetviz as sv
import pandas as pd
from downcast import reduce
df = pd.read_csv("C:/Users/dsibi/OneDrive/Documents/Projects/JavaScript/myportfolio/projects/scatter-plot/data/scraping/movies_metadata.csv")
df = reduce(df)
# print(df.columns)
cols = ['adult', 'budget', 'original_title','popularity', 'release_date', 'revenue', 'runtime', 'vote_average', 'vote_count']
df = df[cols]
d = {'True': True, 'False': False}
df['adult']=df['adult'].map(d)
df["budget"] = pd.to_numeric(df["budget"], errors='coerce').astype('Int64')
df = df[df['budget'].notna()]
df["popularity"] = pd.to_numeric(df["popularity"], errors='coerce')
df = df[df['popularity'].notna()]
df['release_date'] = pd.to_datetime(df['release_date'])
df['release_year'] = pd.DatetimeIndex(df['release_date']).year.astype('Int64')
df['revenue'] = df['revenue'].astype('Int64')
df['runtime'] = df['runtime'].astype('Int64')
df['vote_count'] = df['vote_count'].astype('Int64')
df=df.dropna()
# print(df.sample(5))
# print(df.dtypes)
# print(df.shape)
df = df[(df[['popularity']]!= 0).any(axis=1)]
df = df[(df[['vote_count']] > 10).any(axis=1)]
df = df[(df[['vote_average']]!= 0).any(axis=1)]
df = df[(df[['budget']]!= 0).any(axis=1)]
df = df[(df[['revenue']]!= 0).any(axis=1)]
df = df[(df[['runtime']]!= 0).any(axis=1)]
# print(df.shape)

cols = ['budget', 'popularity', 'release_year', 'revenue', 'vote_average', 'vote_count']
Q1 = df[cols].quantile(0.25)
Q3 = df[cols].quantile(0.75)
IQR = Q3 - Q1
df = df[~((df[cols] < (Q1 - 1.5 * IQR))).any(axis=1)]

cols = ['budget', 'original_title','popularity', 'release_year', 'revenue', 'vote_average', 'vote_count']
df = df[cols]

df = df[df['release_year'].between(1990, 1999)]
df=df.sort_values(by=['budget'],ascending=False).head(500)
print(df)

# from pandas_profiling import ProfileReport
# report = ProfileReport(df)
# report.to_file('./projects/scatter-plot/data/scraping/report.html')
# report.to_html()

# import seaborn as sns
# import matplotlib.pyplot as plt
# sns.pairplot(df)
# plt.savefig('C:/Users/dsibi/OneDrive/Documents/Projects/JavaScript/myportfolio/projects/scatter-plot/data/scraping/correlation.png')

df.to_csv("C:/Users/dsibi/OneDrive/Documents/Projects/JavaScript/myportfolio/projects/scatter-plot/data/chart.csv", index=False, sep=';')