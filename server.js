var PORT = process.env.PORT || 3000;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var apicache = require('apicache').options({ debug: true }).middleware;
var dota = require('./dota2.js');

app.set('json spaces', 40);

app.use(bodyParser.json());

app.get('/', function(req, res) {
    var routes = {
        '/': 'root (here!)',
        '/teams/rankings': 'get rankings for teams, data obtained from gosugamers',
        '/teams/logos': 'get a list of teams logos',
        '/teams/:id': 'get detailed information of a team with given id',
        '/matches/live': 'get a list of live matches',
        '/matches/recent': 'get a list of recent matches',
        '/matches/upcoming': 'get a list of upcoming matches',
        '/heroes': 'get a list of all heroes',
        '/heroes/:name': 'get detailed information of a hero'
    };

    res.json(routes);
});

app.get('/teams/rankings', apicache('2 hours'), function(req, res) {
    dota.getTeamsRankings().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/teams/logos', apicache('1 day'), function(req, res) {
    dota.getTeamsLogos().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/teams/:id', apicache('2 hours'), function(req, res) {
    var id = req.params.id;
    dota.getTeamData(id).then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/matches/live', apicache('5 minutes'), function(req, res) {
    dota.getLiveMatches().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/matches/recent', apicache('1 hour'), function(req, res) {
    dota.getRecentMatches().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/matches/upcoming', apicache('2 hours'), function(req, res) {
    dota.getUpcomingMatches().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/heroes', apicache('2 hours'), function(req, res) {
    dota.getHeroes().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/heroes/:name', apicache('2 hours'), function(req, res) {
    var name = req.params.name;
    dota.getHeroStats(name).then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('*', function(req, res) {
    var errorMsg = 'Sorry! Page not found! Please go to the homepage for information about available routes. :)';
    res.status(404).send(errorMsg);
});

app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
});
