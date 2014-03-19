require('./globals.js');
var geolib = require('geolib');


// From http://www.movable-type.co.uk/scripts/latlong.html
var bearingFromPointsInRadians = function (pointA, pointB) {
	var lat1 = pointA.latitude;
	var lon1 = pointA.longitude;
	var lat2 = pointB.latitude;
	var lon2 = pointB.longitude;

	// var dLat = (lat2-lat1).toRad();	// unused
	var dLon = (lon2-lon1).toRad();
	
	var y = Math.sin(dLon) * Math.cos(lat2);
	var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
	var brng = Math.atan2(y, x);	// .toDeg()
	return brng;
};


// Define the factory
function newPolyroute() {

	var convertRouteToBoxesNaive = function (route, stroke) {

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

	var convertRouteToBoxes = function (route, stroke) {

		var length = route.length;
		_.each(route, function(item) {
			// console.log(item.latitude+','+item.longitude);
		});
		console.log('route has '+length+' items. Length is '+geolib.getPathLength(route)/1000.0+' km');
		var p0 = route[0];
		var p1 = {latitude: route[1].latitude, longitude: route[0].longitude};
		// var p0 = {latitude: p1.latitude - stroke, longitude: p1.longitude - stroke};
		var bearing = bearingFromPointsInRadians(p0, p1);
		console.log('Bearing is '+bearing+' radians.');
		var reverse_bearing = bearing - Math.PI;

		var r = Math.sqrt(2) * stroke;
		var x = Math.cos(reverse_bearing) * r;
		var y = Math.sin(reverse_bearing) * r;
		console.log('x='+x+', y='+y+', r='+r);

		var newPoint = {latitude: p0.latitude + x, longitude: p0.longitude + y};
		console.log('First Point:', p0);
		console.log('New Point:', newPoint);

	};


	return {
		convertRouteToBoxes : convertRouteToBoxesNaive,
		findObjectsAlongRoute: function searchRoute(route, objects, stroke) {
			return objects;
		}
	};
}

// Export this file as a module
module.exports = newPolyroute;