## dota2

+ provide some rest interface for accessing popular __dota2__ related data
+ server is built on `express`
+ data is scraped from gosugamers and dotabuff using `cheerio` and `x-ray`

## current feature
+ in-memory caching capabilities for faster access

## work-in-progress
+ periodically fetches data from sources

```
'/'                 : 'root (here!)',
'/teams/rankings'   : 'get rankings for teams, data obtained from gosugamers',
'/teams/logos'      : 'get a list of teams logos',
'/teams/:id'        : 'get detailed information of a team with given id',
'/matches/live'     : 'get a list of live matches',
'/matches/recent'   : 'get a list of recent matches',
'/matches/upcoming' : 'get a list of upcoming matches',
'/heroes'           : 'get a list of all heroes',
'/heroes/:name'     : 'get detailed information of a hero'
```
