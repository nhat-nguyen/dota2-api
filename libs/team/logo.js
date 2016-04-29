var _       = require('lodash'),
    Xray    = require('x-ray'),
    x       = Xray();

function getXrayModel(url) {
    return x(url, 'td[valign="top"]', [{
        team: 'span',
        url: 'img@src'
    }])
}

module.exports = {
    getXrayModel: getXrayModel
};
