require('./globals.js');

// Request API access: http://www.yelp.com/developers/getting_started/api_access

// for your API keys
var yelp_config = require('./config/yelp-api-keys.json');


// // See http://www.yelp.com/developers/documentation/v2/business
// yelp.business("yelp-san-francisco", function(error, data) {
//   console.log(error);
//   console.log(data);
// });

// Search API
// See http://www.yelp.com/developers/documentation/v2/search_api

// Define the factory
function newYelp() {

	// console.log('config=',yelp_config);

	var yelp = require("yelp").createClient(yelp_config);

	var searchBox = function searchBox(box) {
		
		return yelp.searchPromise({
			term: 'food',
			limit: 3,
			bounds: box
		}).then(function(foo) {
			return foo;
		});
	};

	return {
		searchBox: searchBox,
		searchRoute: function searchRoute(route_points) {
			return searchBox('37.900000,-122.500000|37.788022,-122.399797');
		}
  };
}

// Export this file as a module
module.exports = newYelp;