var PORT = 3000 || process.env.PORT;
var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.get('/rankings', function(req, res) {
    
});

app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
});
