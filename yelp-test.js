require('./globals.js');
var Yelp = require('./yelp.js');


var yelp = Yelp();
yelp.searchRoute().then(function(data) {

	var businesses = data.businesses;

	console.log(_.pluck(businesses, 'name'));

})
.catch(function(error) {
	console.error('ERROR! ', error);
})
.done();