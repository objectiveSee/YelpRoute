require('./globals.js');
var Yelp = require('./yelp.js');


var yelp = Yelp();
yelp.searchRoute().then(function(data, response) {

	console.log(data);

});
