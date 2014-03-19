require('./globals.js');
var Yelp = require('./yelp.js');
var yelp = Yelp();


var route = [
{
	'latitude':38.930145,		// kenyon street
	'longitude':-77.031955
},
{
	'latitude':38.878659,		// white house
	'longitude':-76.981679
}
];

yelp.searchRoute(route).then(function(data) {
	console.log(_.pluck(data, 'name'));
})
.catch(function(error) {
	console.error('ERROR! ', error);
})
.done();