require('./globals.js');

// Define the factory
function newPolyroute() {
	return {
		findObjectsAlongRoute: function searchRoute(route, objects, stroke) {
			return objects;
		}
	};
}

// Export this file as a module
module.exports = newPolyroute;