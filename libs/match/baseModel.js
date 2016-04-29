var x = require('x-ray')();

module.exports = {
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
};
