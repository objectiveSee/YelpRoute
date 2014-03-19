require('./globals.js');

// Request API access: http://www.yelp.com/developers/getting_started/api_access
// for your API keys
var yelp_config = require('./config/yelp-api-keys.json');
var geolib = require('geolib');

var YELP_MAX_RESULTS_PER_QUERY = 20;	// says yelp.
var SEARCH_LIMIT_PER_QUERY = YELP_MAX_RESULTS_PER_QUERY;
var SEARCH_TERM = 'food';

var Polyroute = require('./polyroute.js');
var ROUTE_WIDTH = 20;		// in meters

// // See http://www.yelp.com/developers/documentation/v2/business
// yelp.business("yelp-san-francisco", function(error, data) {
//   console.log(error);
//   console.log(data);
// });
// Search API
// See http://www.yelp.com/developers/documentation/v2/search_api

// Define the factory
function newYelp() {

	var yelp = require("yelp").createClient(yelp_config);
	var polyroute = Polyroute();

	var searchBox = function searchBox(box) {		// TODO: handle errors
		console.log('searching box'+box);
		return yelp.searchPromise({
			term: SEARCH_TERM,
			limit: SEARCH_LIMIT_PER_QUERY,
			bounds: box
		}).then(function(foo) {
			console.log('Box finished. Found '+foo.businesses.length);
			return foo;
		});
	};

	var compressResults = function compressResults(results) {	// flattens results from multipe Yelp api responses into a single, unique array of responses
		var objects = [];
		_.each(results, function(result) {
			objects = _.union(result.businesses);
		});
		// console.log('BUSINESSES =', JSON.stringify(objects));
		return objects;
	};

	return {
		searchRoute: function searchRoute(route_points) {

			var boxes = polyroute.convertRouteToBoxes(route_points, ROUTE_WIDTH);
			var promises = _.map(boxes, function(box) {
				return searchBox(box);
			});
			return Q.all(promises)
			.then(function(result) {
				console.log('searches finished!');
				var uniq_results = compressResults(result);
				return polyroute.findObjectsAlongRoute(route_points, uniq_results, ROUTE_WIDTH);
			});
		}
	};
}

// Export this file as a module
module.exports = newYelp;