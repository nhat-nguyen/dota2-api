var _ = require('lodash');
var url = require('url');

function getNextUrl(originalUrl, currentPage) {
    var nextPage = parseInt(currentPage, 10) + 1 || 2;

    if (_.isEmpty(currentPage)) {
        originalUrl += _.endsWith(originalUrl, '/') ? nextPage: '/' + nextPage;
    } else {
        originalUrl = _.chain(originalUrl).split('/').slice(0, -1)              // split to array, remove current page
                    .push(nextPage).join('/').value();                          // add next page, join array
    }

    return originalUrl;
}


function nextUrlMiddleware(request, response, next) {
    if (_.isEmpty(request.params.heroesPerRequest)) return;

    var oldJson      =  response.json,
        originalUrl  =  url.format({
                            protocol: request.protocol,
                            host: request.get('host'),
                            pathname: request.originalUrl,
                        });

    response.json = function(data) {
        // arguments[0] contains the body passed in
        arguments[0].next = getNextUrl(originalUrl, request.params.page);
        oldJson.apply(response, arguments);
    }

    next();
}

function validateHeroesStatRequest(request, response, next) {
    var params      = request.params,
        nHeroes     = parseInt(params.heroesPerRequest, 10),
        parsedPage  = parseInt(params.page, 10);

    if ((_.isFinite(nHeroes) && nHeroes > 0 && _.isEmpty(params.page)) ||
        (_.isFinite(nHeroes) && nHeroes > 0 && _.isFinite(parsedPage) && parsedPage > 0)) {
        next();
    } else {
        return response.send(400);
    }
}

module.exports = {
    heroesPaginate: nextUrlMiddleware,
    validate: validateHeroesStatRequest
};
