var _ = require('lodash'),
    x = require('x-ray')();
    HEROES_MAP = require('../../res/heroes-map.json');

var mostUsedItemsModel = {
    name: 'td:nth-child(2) a',
    matches: 'td:nth-child(3)',
    wins: 'td:nth-child(4)',
    winRate: 'td:nth-child(5)',
    icon: '.cell-icon img@src'
};

var heroAgainstModel = {
    fullName: 'td:nth-child(2) a',
    advantage: 'td:nth-child(3)',
    winRate: 'td:nth-child(4)',
    matches: 'td:nth-child(5)',
    icon: '.cell-icon img@src'
};

function getXrayModel(url) {
    return x(url, {
        mostUsedItems: x('section:nth-child(5):not(.hero_attributes) tr', [mostUsedItemsModel]),
        bestAgainst: x('section:nth-child(6) tr', [heroAgainstModel]),
        worstAgainst: x('section:nth-child(7) tr', [heroAgainstModel]),
    });
}

function processAdditionalInformation(hero, name) {
    hero.name = name;
    hero.fullName = HEROES_MAP[name].fullName;
    hero.icon = HEROES_MAP[name].icon;
}

function removeSingleQuoteInNames(array) {
    _.forEach(array, function(h) {
        h.name = _.chain(h.fullName).replace(/'/g, '').kebabCase().value();
    });
}

function postProcess(hero, name) {
    processAdditionalInformation(hero, name);
    removeSingleQuoteInNames(hero.bestAgainst);
    removeSingleQuoteInNames(hero.worstAgainst);

    return hero;
}

module.exports = {
    getXrayModel: getXrayModel,
    postProcess: postProcess
};

