var _       = require('lodash'),
    x       = require('x-ray')(),
    HEROES  = require('./res/heroes.json'),
    LOGOS   = require('./res/teams-logos.json');

var MODELS = {
    teamRankings: require('./libs/team/ranking.js'),
    teamInformation: require('./libs/team/information.js'),
    teamLogo: require('./libs/team/logo.js'),
    upcomingMatches: require('./libs/match/upcoming.js'),
    liveMatches: require('./libs/match/live.js'),
    recentMatches: require('./libs/match/recent.js'),
    hero: require('./libs/hero/stats.js')
};

var URLS = {
    teamRankings: 'http://www.gosugamers.net/dota2/rankings/',
    teamInformation: 'http://www.gosugamers.net/rankings/show/team/',
    teamLogo: 'http://dota2.gamepedia.com/Professional_teams/',
    matches: 'http://www.gosugamers.net/dota2/gosubet/',
    hero: 'http://www.dotabuff.com/heroes/'
};

function Dota() {}

function prettyPrint(input) {
    console.log(JSON.stringify(input, null, 2));
}

Dota.prototype.getTeamsRankings = () => {
    return new Promise((resolve, reject) => {
        MODELS.teamRankings.getXrayModel(URLS.teamRankings)((err, res) => {
            if (err) return reject(err);
            resolve(MODELS.teamRankings.postProcess(res));
        });
    });
};

Dota.prototype.getTeamsLogos = () => {
    return new Promise((resolve, reject) => {
        teamLogo.getXrayModel(URLS.teamLogo)((err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};

Dota.prototype.getTeamLogo = function(name) {

};

Dota.prototype.getTeamData = (id) => {
    var url = URLS.teamInformation + id;
    return new Promise((resolve, reject) => {
        MODELS.teamInformation.getXrayModel(url)((err, res) => {
            if (err) return reject(err);
            resolve(MODELS.teamInformation.postProcess(res));
        });
    });
};

Dota.prototype.getUpcomingMatches = () => {
    return new Promise((resolve, reject) => {
        MODELS.upcomingMatches.getXrayModel(URLS.matches)((err, res) => {
            if (err) return reject(err);
            resolve(MODELS.upcomingMatches.postProcess(res));
        });
    });
};

Dota.prototype.getLiveMatches = function() {
    var errorMsg = 'undefined is not a URL';
    return new Promise((resolve, reject) => {
        MODELS.liveMatches.getXrayModel(URLS.matches)((err, res) => {
            if (err && err.message === errorMsg) {
                resolve([]);
            } else if (err) {
                reject(err);
            } else {
                resolve(MODELS.liveMatches.postProcess(res));
            }
        });
    });
};

Dota.prototype.getRecentMatches = function() {
    return new Promise((resolve, reject) => {
        MODELS.recentMatches.getXrayModel(URLS.matches)((err, res) => {
            if (err) return reject(err);
            resolve(MODELS.recentMatches.postProcess(res));
        });
    });
};

// Returns a list of all heroes with their icons and full names
Dota.prototype.getHeroes = function() {
    return new Promise(function(resolve, reject) {
        resolve(HEROES);
    });
};

Dota.prototype.getHeroesStats = function(start, end) {
    start = start || 0;
    end = end || heroes.length;

    var heroesPromises = _.map(_.slice(heroes, start, end), function(hero) {
        return getHeroStats(hero);
    });

    return new Promise(function(resolve, reject) {
        Promise.all(heroesPromises).then(function(heroesStats) {
            resolve(_.keyBy(heroesStats, 'name'));
        });
    });
};

Dota.prototype.getHeroStats = function(name) {
    var url = URLS.hero + name;
    return new Promise((resolve, reject) => {
        MODELS.hero.getXrayModel(url)((err, res) => {
            if (err) return reject(err);
            resolve(MODELS.hero.postProcess(res, name));
        });
    });
};

module.exports = new Dota();
