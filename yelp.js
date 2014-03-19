require('./globals.js');

var geocoder = require('geocoder');
var geocoderProvider = 'google';
var httpAdapter = 'http';
var extra = {
    apiKey: 'AIzaSyAzn_oKdewnuozhqhOjQ3RgT5DmSEwlwK0', // for map quest
    formatter: null         // 'gpx', 'string', ...
};
var geocoder2 = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter, extra);


// Request API access: http://www.yelp.com/developers/getting_started/api_access
// for your API keys
var yelp_config = require('./config/yelp-api-keys.json');
var geolib = require('geolib');

var YELP_MAX_RESULTS_PER_QUERY = 5;	// says yelp.
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

	var geocodeResults = function geocodeResults(results) {
		// console.log('geocoding...');
		var promises = _.map(results, function(business) {
			// console.log('business info to geocode is', business);
			var search_location = business.location.address + ',' + business.location.city + ',' + business.location.state_code;
			// console.log('location name is', search_location);
			return geocoder2.geocode(search_location)
			.then(function(results) {
				if ( results && results.length > 0 ) {
					// console.log(results[0]);
					var point = {latitude: results[0].latitude, longitude: results[0].longitude};
					business.location.coordinates = point;
					// console.log('business is now', util.inspect(business));
				} else {
					console.error('GEO failed for '+search_location+', Response = '+util.inspect(results));
				}
				return business;
			});
		});
		return Q.all(promises);
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
				return uniq_results;
			}).then(function(results) {
				return geocodeResults(results);
			}).then(function(results) {
				return polyroute.findObjectsAlongRoute(route_points, results, ROUTE_WIDTH);
			});

		}
	};
}

// Export this file as a module
module.exports = newYelp;
