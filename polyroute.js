require('./globals.js');
var geolib = require('geolib');
var geopoint = require('geopoint');

var MAX_BOX_SIZE = 0.002;	//.03,.04 diff of stroke


// From http://www.movable-type.co.uk/scripts/latlong.html
var bearingFromPointsInRadians = function (pointA, pointB) {	// TODO: naive. doesnt consider radius of earth
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

var latitudeModifyByStroke = function(latitude, stroke) {	// TODO: naive. doesnt consider radius of earth
	return latitude + stroke;
};
var longitudeModifyByStroke = function(longitude, stroke) {	// TODO: naive. doesnt consider radius of earth
	return longitude + stroke;
};
var boxToYelp = function(box) {
	return box[0]+','+box[1]+'|'+box[2]+','+box[3];
};
var boxSize = function(box) {	// TODO: naive. doesnt consider radius of earth
	var x = box[2] - box[0];
	var y = box[3] - box[1];
	return x*y;
};
var boxExpand = function (box, point, stroke) {

	var lat_minus = latitudeModifyByStroke(point.latitude, -stroke);
	var lat_plus = latitudeModifyByStroke(point.latitude, stroke);
	var lon_minus = latitudeModifyByStroke(point.longitude, -stroke);
	var lon_plus = latitudeModifyByStroke(point.longitude, stroke);

	if ( !box ) {
		return [lat_minus, lon_minus, lat_plus, lon_plus];
	}
	return [Math.min(lat_minus, box[0]),
	Math.min(lon_minus, box[1]),
	Math.max(lat_plus, box[2]),
	Math.max(lon_plus, box[3])];
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

		console.log('converting boxes...');
		var length = route.length;
		console.log('route has '+length+' items. Length is '+geolib.getPathLength(route)/1000.0+' km');

		// _.each(route, function(item) {
			// console.log('route $ '+item.latitude+','+item.longitude);
		// });

		var j = 0;
		var boxes = [];
		var current_box;

		for ( var i = 0; i < length; i++ ) {

			var newbox = boxExpand(current_box, route[i], stroke);
			
			var box_size = boxSize(newbox);
			// console.log('BOX SIZE is'+ box_size);

			if ( box_size > MAX_BOX_SIZE ) {
				boxes.push(boxToYelp(current_box));
				current_box = boxExpand(undefined, route[i], stroke);	// make box starting w/ this point
			} else {
				current_box = newbox;
			}
		}
		if ( current_box ) {
			boxes.push(boxToYelp(current_box));
		}

		console.log('Route has '+boxes.length+' boxes!');
		_.each(boxes, function (box) {
			console.log('box is: '+util.inspect(box));
		});
		return boxes;
	};


	return {
		convertRouteToBoxes : convertRouteToBoxes,
		findObjectsAlongRoute: function searchRoute(route, objects, stroke) {
			var objects_with_coordinates = _.filter(objects, function(obj) {
				return obj.location.coordinates;
			});
			return objects_with_coordinates;
		}
	};
}

// Export this file as a module
module.exports = newPolyroute;