var _       = require('lodash'),
    cheerio = require('cheerio'),
    Xray    = require('x-ray'),
    x       = Xray();

function getXrayModel(url) {
    return x(url, {
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
    });
}

function parseRecentMatchHtml(team) {
    _(team.recentMatches).forEach(function(match, i) {
        var $ = cheerio.load(match.html);
        match.tournament = $('.match-details').clone().children().remove().end().text();
        match.time = $('.time').text();
        delete match.html;
    });
}

function parsePlayerAvatar(team) {
    _(team.roster).forEach(function(player) {
        player.avatar = 'http://www.gosugamers.net' + player.avatar.match(/\/.+(?:jpeg|png)/);
    });
}

function getPerformanceTable(html) {
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

function postProcess(teamInformation) {
    teamInformation.perfomance = getPerformanceTable(teamInformation.perfomance);
    teamInformation.name = _.trim(teamInformation.name);
    parsePlayerAvatar(teamInformation);
    parseRecentMatchHtml(teamInformation);

    return teamInformation;
}

module.exports = {
    getXrayModel: getXrayModel,
    postProcess: postProcess
};
