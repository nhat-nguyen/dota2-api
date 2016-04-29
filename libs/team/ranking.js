var _       = require('lodash'),
    Xray    = require('x-ray'),
    x       = Xray();

function getXrayModel(url) {
    return x(url, 'tr.ranking-link', [{
        country: 'span[title]@title',
        name: 'span:last-child',
        id: 'tr.ranking-link@data-id'
    }]);
}

function postProcess(rankings) {
    _(rankings).forEach(function(team, i) {
        team.country = _.trim(team.country);
        team.name = _.trim(team.name);
        team.rank = i + 1;
    });

    return rankings;
}

module.exports = {
    getXrayModel: getXrayModel,
    postProcess: postProcess
};
