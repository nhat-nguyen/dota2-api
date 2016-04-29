var _         = require('lodash'),
    x         = require('x-ray')();
    baseModel = require('./baseModel.js');
    utilities = require('./utilities.js');

function getXrayModel(url) {
    return x(url, '#col1 .box:first-child tr', [baseModel]);
}

function postProcess(matches) {
    return utilities.postProcessMatchData(matches, null, () => 'Now');
}

module.exports = {
    getXrayModel: getXrayModel,
    postProcess: postProcess
};
