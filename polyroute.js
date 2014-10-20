require('./globals.js');
var geolib = require('geolib');
var geopoint = require('geopoint');

var MAX_BOX_SIZE = 0.0002;	//.03,.04 diff of stroke


// From http://www.movable-type.co.uk/scripts/latlong.html
// var bearingFromPointsInRadians = function (pointA, pointB) {	// TODO: naive. doesnt consider radius of earth
// 	var lat1 = pointA.latitude;
// 	var lon1 = pointA.longitude;
// 	var lat2 = pointB.latitude;
// 	var lon2 = pointB.longitude;

// 	// var dLat = (lat2-lat1).toRad();	// unused
// 	var dLon = (lon2-lon1).toRad();
	
// 	var y = Math.sin(dLon) * Math.cos(lat2);
// 	var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
// 	var brng = Math.atan2(y, x);	// .toDeg()
// 	return brng;
// };

/**
Improvements:

- If the route doubles back on itself, then boxes may overlap or even fully cover eachother.
	CONSIDER: Check if a point is contained within an existing box in the solution (`boxes`) before expanding `current_box`.

- boxSize() doesn't consider the radius of the earth.

- Allow MAX_BOX_SIZE to be set externally.

*/

var latitudeModifyByStroke = function(latitude, stroke) {	// TODO: naive. doesnt consider radius of earth
	return latitude + stroke;
};
var longitudeModifyByStroke = function(longitude, stroke) {	// TODO: naive. doesnt consider radius of earth
	return longitude + stroke;
};

// Return a box in the format you want it to be in. TODO: Allow users to override this with new export format
var exportBox = function(box) {
	return box[0]+','+box[1]+'|'+box[2]+','+box[3];
};


// TODO: use absolute value somewhere in here.

// returns the size of a box.
var boxSize = function(box) {	// NOTE: naive. doesnt consider radius of earth
	var x = box[2] - box[0];
	var y = box[3] - box[1];
	return x*y;
};

// takes a box and expands it such that the box contains the given point. 
// It will always contain the point with at least `stroke` distance on every side of the point.
// If box is undefined, will return a new box that is `stroke` distance from the given point (ie. each side of the box is 2*stroke in length).
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

// Take a route of points and returns an array of boxes which contain the route. See README for more info.
var convertRouteToBoxes = function (route, stroke) {

	console.log('converting boxes...');
	var length = route.length;
	console.log('route has '+length+' items. Length is '+geolib.getPathLength(route)/1000.0+' km');

	// _.each(route, function(item) {
		// console.log('route $ '+item.latitude+','+item.longitude);
	// });

	var j = 0;
	var boxes = [];
	var current_box = undefined;

	for ( var i = 0; i < length; i++ ) {

		var newbox = boxExpand(current_box, route[i], stroke);
		
		var box_size = boxSize(newbox);
		// console.log('BOX SIZE is'+ box_size);

		// if the `newBox` is too big then save `current_box` and start a new box using the last point used.
		if ( box_size > MAX_BOX_SIZE ) {
			boxes.push(exportBox(current_box));
			current_box = boxExpand(undefined, route[i], stroke);	// make a new box starting w/ this point

		} else {		// else, keep making the `current_box` bigger until we eventually are too big or the for-loop ends
			current_box = newbox;
		}
	}

	// add the final box when you break out of the for-loop (if one exists).
	if ( current_box ) {
		boxes.push(exportBox(current_box));
	}

	console.log('Route has '+boxes.length+' boxes!');
	_.each(boxes, function (box) {
		console.log('box is: '+util.inspect(box));
	});
	return boxes;
};

// Module exports this function
function newPolyroute() {

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

// Now you're a module!
module.exports = newPolyroute;