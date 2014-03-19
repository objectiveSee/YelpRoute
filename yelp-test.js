require('./globals.js');
var Yelp = require('./yelp.js');
var yelp = Yelp();



var route = [
{
	'latitude':38.930145,
	'longitude':-77.031955
},
{
	'latitude':38.878659,
	'longitude':-76.981679
}
];

console.log(JSON.stringify(route));

yelp.searchRoute(route).then(function(data) {
	console.log(_.pluck(data, 'name'));
})
.catch(function(error) {
	console.error('ERROR! ', error);
})
.done();