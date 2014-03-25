require('./globals.js');

var geocoder = require('geocoder');
var geocoderProvider = 'openstreetmap'; // openstreetmap, google, mapquest
var httpAdapter = 'http';
var geocode_key;
if ( geocoderProvider === "google") {
	geocode_key = env.google_geocode_api_key;
} else if ( geocoderProvider === "mapquest") {
	geocode_key = env.mapquest_geocode_api_key;
}
var extra = {
    apiKey: geocode_key,
    formatter: null
};
var geocoder2 = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter, extra);


var geolib = require('geolib');

var YELP_MAX_RESULTS_PER_QUERY = 20;	// says yelp.

var SEARCH_LIMIT_PER_QUERY = YELP_MAX_RESULTS_PER_QUERY;		// helps to avoid request timeout due to huge number of results needing a seperate geocode request
var SEARCH_TERM = 'food';

var Polyroute = require('./polyroute.js');


var METERS_PER_LATITUDE_ESTIMATED = 111131.745;

var ROUTE_WIDTH = 1000 / METERS_PER_LATITUDE_ESTIMATED;		// in degrees


// See http://www.yelp.com/developers/documentation/v2/business
// See http://www.yelp.com/developers/documentation/v2/search_api

var compressResults = function compressResults(results) {	// flattens results from multipe Yelp api responses into a single, unique array of responses
	var objects = [];
	_.each(results, function(result) {
		console.log('result has '+result.businesses.length+' sub-results');
		console.log('names are: ', _.pluck(result.businesses, 'name'));
		objects = _.union(result.businesses, objects);
	});
	// console.log('BUSINESSES =', JSON.stringify(objects));
	return objects;
};

var geocodeResults = function geocodeResults(results) {
	console.log('geocoding...');
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
				console.error('Warning: Geocode failed for '+search_location+', Response = '+util.inspect(results));
			}
			return business;
		});
	});
	return Q.all(promises);
};

// Define the factory
function newYelp() {

	var yelp_config = {
		"consumer_key": env.yelp_consumer_key,
		"consumer_secret": env.yelp_consumer_secret,
		"token": env.yelp_token,
		"token_secret": env.yelp_token_secret
	};

	var yelp = require("yelp").createClient(yelp_config);
	var polyroute = Polyroute();

	var searchBox = function searchBox(box) {		// TODO: handle errors
		console.log('searching box'+box);
		return yelp.searchPromise({
			term: SEARCH_TERM,
			limit: SEARCH_LIMIT_PER_QUERY,
			bounds: box
		}).then(function(foo) {
			console.log('Found '+foo.businesses.length+' businesses in a box: '+util.inspect(box));
			return foo;
		});
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
