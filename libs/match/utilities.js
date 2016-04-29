var _ = require('lodash');

function processStringData(match) {
    match.liveIn = _.trim(match.liveIn);
    match.tournament.name = _.chain(match.tournament.name).trim()   // trim trailing and leading spaces
                             .replace(/\r?\n|\r/g, '')              // remove any line breaks
                             .replace(/\s+/g, ' ').value()          // remove any multiple spaces with 1
}

function processBetPercentage(match) {
    var firstOpponent = match.firstOpponent,
        secondOpponent = match.secondOpponent;

    // Remove brackets surrounding the percentage
    firstOpponent.betPercentage = _.replace(firstOpponent.betPercentage, /\(|\)/g, '');
    secondOpponent.betPercentage = _.replace(secondOpponent.betPercentage, /\(|\)/g, '');
}

function processOpponentScore(match, processScoreFn) {
    processScoreFn = processScoreFn || function(x) { return parseInt(_.trim(x), 10); };
    var firstOpponent = match.firstOpponent,
        secondOpponent = match.secondOpponent;

    // Process the score with the process function provided
    firstOpponent.score = processScoreFn(firstOpponent.score);
    secondOpponent.score = processScoreFn(secondOpponent.score);
}

function processMatchTimer(match, processTimerFn) {
    processTimerFn = processTimerFn || function(x) { return _.trim(x); };
    match.liveIn = processTimerFn(match.liveIn);
}

function postProcessMatchData(matches, processScoreFn, processTimerFn) {
    var firstOpponent, secondOpponent;

    _(matches).forEach(function(match) {
        processStringData(match);
        processBetPercentage(match);
        processOpponentScore(match, processScoreFn);
        processMatchTimer(match, processTimerFn);
    });

    return matches;
}

module.exports = {
    postProcessMatchData: postProcessMatchData
};
