require('./globals.js');

// Request API access: http://www.yelp.com/developers/getting_started/api_access

// for your API keys
var yelp_config = require('./config/yelp-api-keys.json');


// // See http://www.yelp.com/developers/documentation/v2/business
// yelp.business("yelp-san-francisco", function(error, data) {
//   console.log(error);
//   console.log(data);
// });


// Define the factory
function newYelp() {

	var yelp = require("yelp").createClient(yelp_config);


	return {

    // Define a function with async internals
    searchRoute: function searchRoute(route_points) {

		// See http://www.yelp.com/developers/documentation/v2/search_api
		return yelp.searchPromise({term: "food", location: "Montreal"});

    }
  };
}

// Export this file as a module
module.exports = newYelp;