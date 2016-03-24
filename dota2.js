var _ = require('lodash');
var cheerio = require('cheerio');
var Xray = require('x-ray');
var x = Xray();

var regexes = {
    lineBreaks: '\r?\n|\r',
    multipleSpaces: '\s+',
    roundBrackets : '\(|\)'
};

function prettyPrint(input) {
    console.log(JSON.stringify(input, null, 2));
}

// Ranking
function getTeamsRankings() {
    var trimTeamsData = function(teams) {
        _(teams).forEach(function(team, i) {
            team.country = _.trim(team.country);
            team.name = _.trim(team.name);
            team.rank = i + 1;
        });
    };

    var getTeamsRankingsPromise = function(resolve, reject) {
        x('http://www.gosugamers.net/dota2/rankings', 'tr.ranking-link', [{
            country: 'span[title]@title',
            name: 'span:last-child',
            id: 'tr.ranking-link@data-id'
        }])(function(err, teams) {
            if (err) {
                reject(err);
            } else {
                trimTeamsData(teams);
                resolve(teams);
            }
        });
    };

    return new Promise(getTeamsRankingsPromise);
};

// Team logos
function getTeamsLogos() {
    var getTeamsLogosPromise = function(resolve, reject) {
        x('http://dota2.gamepedia.com/Professional_teams', 'td[valign="top"]', [{
            team: 'span',
            url: 'img@src'
        }])(function(err, logos) {
            if (err) {
                reject(err);
            } else {
                resolve(logos);
            }
        });
    }

    return new Promise(getTeamsLogosPromise);
}

/* Get team information */
function getTeamData(id) {
    var parseRecentMatchHtml = function(team) {
        _(team.recentMatches).forEach(function(match, i) {
            var $ = cheerio.load(match.html);
            match.tournament = $('.match-details').clone().children().remove().end().text();
            match.time = $('.time').text();
            delete match.html;
        });
    };

    var parsePlayerAvatar = function(team) {
        _(team.roster).forEach(function(player) {
            player.avatar = 'http://www.gosugamers.net' + player.avatar.match(/\/.+(?:jpeg|png)/);
        });
    };

    var getPerformanceTable = function(html) {
        var parsedArray = _.chain(html).replace(/ +/g, ' ').split('\r\n')
                            .remove(function(element) {
                                return element && element !== ' ' && !_.includes(element, 'Winrate')
                                       && !_.includes(element, 'Matches played') && !_.includes(element, 'Current streak');
                            })
                            .map(function(element) {
                                return _.chain(element).trim().replace(/:/g, '').value();
                            })
                            .value();

        var perfomance = {'currentStreak': _.last(parsedArray)};

        for (var i = 0; i < 3; i++) {
            var matchesPlayed = _.split(parsedArray[i + 6], '/');
            perfomance[parsedArray[i]] = {
                'winRate': parsedArray[i + 3],
                'matchesPlayed': {
                    'win': _.parseInt(matchesPlayed[0], 10),
                    'draw': _.parseInt(matchesPlayed[1], 10),
                    'lose': _.parseInt(matchesPlayed[2], 10)
                }
            };
        }

        return perfomance;
    }

    var promise = function(resolve, reject) {
        x('http://www.gosugamers.net/rankings/show/team/' + id, {
            name: x('h3'),
            roster: x('#roster a', [{
                player: 'a@title',
                signatureHeroes: x('.heroes', ['img@title']),
                avatar: 'a@style'
            }]),
            recentMatches: x('.match-list-row', [{
                html: 'a@title',
                opponent: 'strong',
                result: 'span'
            }]),
            rankings: x('.rankings', {
                worldwide: '.ranking:first-child .number',
                regional: '.ranking:last-child .number'
            }),
            country: '.flag@title',
            region: '.ranking:last-child .region',
            perfomance: x('.stats-table')
        })(function(err, obj) {
            if (err) {
                reject(err);
            } else {
                obj.perfomance = getPerformanceTable(obj.perfomance);
                obj.name = _.trim(obj.name);
                obj.id = id;
                parsePlayerAvatar(obj);
                parseRecentMatchHtml(obj);
                resolve(obj);
            }
        });
    };

    return new Promise(promise);
}

// Upcoming matches
function getUpcomingMatches() {
    var promise = function(resolve, reject) {
        x('http://www.gosugamers.net/dota2/gosubet', '#col1 .box:nth-child(2) tr', [{
            firstOpponent: {
                name: '.opp.opp1 span:first-child',
                betPercentage: '.bet-percentage.bet1'
            },
            secondOpponent: {
                name: '.opp.opp2 span:last-child',
                betPercentage: '.bet-percentage.bet2'
            },
            liveIn: '.live-in',
            tournament: {
                name: x('.tournament a@href', 'h1'),
                icon: '.tournament-icon img@src'
            }
        }])(function(err, upcomingMatches) {
            if (err) {
                reject(err);
            } else {
                _(upcomingMatches).forEach(function(match) {
                    match.liveIn = _.trim(match.liveIn);
                    match.tournament.name = _.chain(match.tournament.name)
                                             .trim()                            // trim trailing and leading spaces
                                             .replace(/\r?\n|\r/g, '')          // remove any line breaks
                                             .replace(/\s+/g, ' ')              // remove any multiple spaces with 1
                                             .value();
                    match.firstOpponent.betPercentage = _.replace(match.firstOpponent.betPercentage, /\(|\)/g, '');
                    match.secondOpponent.betPercentage = _.replace(match.secondOpponent.betPercentage, /\(|\)/g, '');
                });

                resolve(upcomingMatches);
            }
        });
    };

    return new Promise(promise);
}

// Live matches
function getLiveMatches() {
    var promise = function(resolve, reject) {
        x('http://www.gosugamers.net/dota2/gosubet', '#col1 .box:first-child a.match.hover-background', [{
            opponent_1: '.opp.opp1 span:first-child',
            opponent_2: '.opp.opp2 span:last-child'
        }])(function(err, matches) {
            if (err) {
                reject(err);
            } else {
                resolve(matches);
            }
        });
    };

    return new Promise(promise);
}

// Recent results
function getRecentMatches() {
    var promise = function(resolve, reject) {
        x('http://www.gosugamers.net/dota2/gosubet', '#col1 .box:last-child tr', [{
            firstOpponent: {
                name: '.opp.opp1 span:first-child',
                betPercentage: '.bet-percentage.bet1',
                score: '.score-wrap > span:nth-child(2) > span:first-child'
            },
            secondOpponent: {
                name: '.opp.opp2 span:last-child',
                betPercentage: '.bet-percentage.bet2',
                score: '.score-wrap > span:nth-child(2) > span:last-child'
            },
            tournament: {
                name: x('.tournament a@href', 'h1'),
                icon: '.tournament-icon img@src'
            }
        }])(function(err, matches) {
            if (err) {
                reject(err);
            } else {
                _(matches).forEach(function(match) {
                    match.tournament.name = _.chain(match.tournament.name)
                                             .trim()
                                             .replace(/\r?\n|\r/g, '')
                                             .replace(/\s+/g, ' ')
                                             .value();
                    match.firstOpponent.betPercentage = _.replace(match.firstOpponent.betPercentage, /\(|\)/g, '');
                    match.secondOpponent.betPercentage = _.replace(match.secondOpponent.betPercentage, /\(|\)/g, '');
                });

                resolve(matches);
            }
        });
    };

    return new Promise(promise);
}

// Returns a map from hero name to its corresponding name used in the api
function getHeroes() {
    var promise = function(resolve, reject) {
        x('http://www.dotabuff.com/heroes', ['.name'])(function(err, heroes) {
            if (err) {
                reject(err);
            } else {
                var map = _.zipObject(_.map(heroes, function(hero) {
                    return _.kebabCase(hero);
                }), heroes);

                resolve(map);
            }
        });
    };

    return new Promise(promise);
}

function getHeroStats(name) {
    var heroLink = 'http://www.dotabuff.com/heroes/' + name;

    var mostUsedItemsModel = {
        name: 'td:nth-child(2) a',
        matches: 'td:nth-child(3)',
        wins: 'td:nth-child(4)',
        winRate: 'td:nth-child(5)',
        icon: '.cell-icon img@src'
    };

    var heroAgainstModel = {
        name: 'td:nth-child(2) a',
        advantage: 'td:nth-child(3)',
        winRate: 'td:nth-child(4)',
        matches: 'td:nth-child(5)',
        icon: '.cell-icon img@src'
    };

    var promise = function(resolve, reject) {
        x(heroLink, '.col-8', {
            mostUsedItems: x('section:nth-child(5) tr', [mostUsedItemsModel]),
            bestAgainst: x('section:nth-child(6) tr', [heroAgainstModel]),
            worstAgainst: x('section:nth-child(7) tr', [heroAgainstModel]),
        })(function(err, hero) {
            if (err) {
                reject(err);
            } else {
                getHeroes().then(function(res) {
                    hero['name'] = res[name];
                    resolve(hero);
                }, function(err) {
                    reject(err);
                });
            }
        });
    };

    return new Promise(promise);
}

module.exports = {
    getTeamsRankings: getTeamsRankings,
    getTeamsLogos: getTeamsLogos,
    getTeamData: getTeamData,
    getUpcomingMatches: getUpcomingMatches,
    getLiveMatches: getLiveMatches,
    getRecentMatches: getRecentMatches,
    getHeroStats: getHeroStats,
    getHeroes: getHeroes
};