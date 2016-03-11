var PORT = process.env.PORT || 3000;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var dota = require('./dota2.js');

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.get('/teams/rankings', function(req, res) {
    dota.getTeamsRankings().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/logos', function(req, res) {
    dota.getTeamsLogos().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/teams/:id', function(req, res) {
    var id = req.params.id;
    dota.getTeamData(id).then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/matches/live', function(req, res) {
    dota.getLiveMatches().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/matches/recent', function(req, res) {
    dota.getRecentMatchesResults().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/matches/upcoming', function(req, res) {
    dota.getUpcomingMatches().then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.get('/heroes/:name', function(req, res) {
    var name = req.params.name;
    dota.getHeroStats(name).then(function(data) {
        res.json(data);
    }, function(err) {
        req.status(500).send();
    });
});

app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
});
