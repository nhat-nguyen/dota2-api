var _         = require('lodash'),
    x         = require('x-ray')();
    baseModel = require('./baseModel.js');
    utilities = require('./utilities.js');

function getXrayModel(url) {
    return x(url, '#col1 .box:nth-child(2) tr', [_.assign({
        liveIn: '.live-in'
    }, baseModel)]);
}

function postProcess(matches) {
    return utilities.postProcessMatchData(matches, () => 'N/A');
}

module.exports = {
    getXrayModel: getXrayModel,
    postProcess: postProcess
};
