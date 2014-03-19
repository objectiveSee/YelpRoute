require('./globals.js');

// Yelp
var Yelp = require('./yelp.js');
var yelp = Yelp();

// Express
var express = require('express');
var app = express();
 
app.get('/test', function(req, res) {
    res.send({hello: 'world'});
});

app.get('/search', function(req, res) {
	res.send({"todo":"hey"});
});
 
var port = process.env.PORT || 3002;
app.listen(port);
console.log('Listening on port '+port+'...');