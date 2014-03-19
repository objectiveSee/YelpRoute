require('./globals.js');
var qs = require('qs');

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
	// console.log('query is: '+util.inspect(req.query));
	// console.log('Route ='+util.inspect(qs.parse(req.query)));

	var route = req.query.route;

	if ( !route ) {
		res.send(500, {error: 'Missing route'});
	} else {

		console.log('query =', route);

		var route_points = [];
		var last;
		_.each(route, function(point) {
			point = parseFloat(point);
			if ( last ) {
				route_points.push({latitude: last, longitude: point});
				last = undefined;
			} else {
				last = point;
			}
		});
		console.log('route points=', route_points);


		yelp.searchRoute(route_points)
		.catch(function(error) {
			console.error('ERROR! ', error);
			res.send(500, {error:error});
		})
		.done(function(response) {
			console.log(_.pluck(response, 'name'));
			res.send(response);
		});

		// var response = yelp.searchRoute(route_points)
		// .then()
		// console.log('response is',util.inspect(response));
		// res.send(response);
	}
});
 
var port = process.env.PORT || 3002;
app.listen(port);
console.log('Listening on port '+port+'...');