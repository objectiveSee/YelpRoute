require('./globals.js');

// Request API access: http://www.yelp.com/developers/getting_started/api_access
// for your API keys
var yelp_config = require('./config/yelp-api-keys.json');
var geo_lib = require('geolib');

var YELP_MAX_RESULTS_PER_QUERY = 20;	// says yelp.
var SEARCH_LIMIT_PER_QUERY = YELP_MAX_RESULTS_PER_QUERY;
var SEARCH_TERM = 'food';

var Polyroute = require('./polyroute.js');
var ROUTE_WIDTH = 20;

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

	var makeBoxesFromRoute = function makeBoxesFromRoute(route) {
		// TODO: this is a naive implementation. Assuming latitude is positive and longitude is negative. Returning 1 box only.
		var bottom = 10000;
		var left = 10000;
		var right = -1000;
		var top = -1000;
		_.each(route, function(marker) {
			if ( marker.longitude < left ) {
				left = marker.longitude;
			}
			if ( marker.longitude > right ) {
				right = marker.longitude;
			}
			if ( marker.latitude < bottom ) {
				bottom = marker.latitude;
			}
			if ( marker.longitude > top ) {
				top = marker.latitude;
			}
		});
		console.log(bottom,left,right,top);
		// Yelp uses the following format to represent a box: bounds=sw_latitude,sw_longitude|ne_latitude,ne_longitude
		var aBox = bottom+","+left+"|"+top+","+right;
		return [aBox];
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

			var boxes = makeBoxesFromRoute(route_points);
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