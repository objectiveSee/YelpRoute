require('./globals.js');
var Yelp = require('./yelp.js');
var yelp = Yelp();


var route =  [ { latitude: 37.31750199999998, longitude: -122.041674 },
  { latitude: 37.317424, longitude: -122.041673 },
  { latitude: 37.316281, longitude: -122.041702 },
  { latitude: 37.31613399999999, longitude: -122.041721 },
  { latitude: 37.315955, longitude: -122.041827 },
  { latitude: 37.31582900000002, longitude: -122.041997 },
  { latitude: 37.31579699999999, longitude: -122.0421 },
  { latitude: 37.31581099999998, longitude: -122.042167 },
  { latitude: 37.31578499999999, longitude: -122.042372 },
  { latitude: 37.315781, longitude: -122.042677 },
  { latitude: 37.315842, longitude: -122.043729 },
  { latitude: 37.31581099999998, longitude: -122.043816 },
  { latitude: 37.31581299999998, longitude: -122.043976 },
  { latitude: 37.31558500000001, longitude: -122.043975 },
  { latitude: 37.315601, longitude: -122.037521 },
  { latitude: 37.31559499999999, longitude: -122.033025 },
  { latitude: 37.31556499999999, longitude: -122.032858 },
  { latitude: 37.31556, longitude: -122.032377 },
  { latitude: 37.308248, longitude: -122.032336 },
  { latitude: 37.30299399999999, longitude: -122.032327 },
  { latitude: 37.30083299999999, longitude: -122.032404 },
  { latitude: 37.30045399999999, longitude: -122.032391 },
  { latitude: 37.300302, longitude: -122.032107 },
  { latitude: 37.30011, longitude: -122.031813 },
  { latitude: 37.29986499999999, longitude: -122.031481 },
  { latitude: 37.298975, longitude: -122.03046 },
  { latitude: 37.29848199999999, longitude: -122.029944 },
  { latitude: 37.29792299999999, longitude: -122.029431 },
  { latitude: 37.29754800000001, longitude: -122.028987 },
  { latitude: 37.28753, longitude: -122.020737 },
  { latitude: 37.28627, longitude: -122.019664 },
  { latitude: 37.285877, longitude: -122.019296 },
  { latitude: 37.285577, longitude: -122.018978 },
  { latitude: 37.285153, longitude: -122.018488 },
  { latitude: 37.281771, longitude: -122.014075 },
  { latitude: 37.27965, longitude: -122.01134 },
  { latitude: 37.27913299999999, longitude: -122.010848 },
  { latitude: 37.27807199999999, longitude: -122.009679 },
  { latitude: 37.276777, longitude: -122.008094 },
  { latitude: 37.27650999999999, longitude: -122.007715 },
  { latitude: 37.276864, longitude: -122.00717 },
  { latitude: 37.27703299999999, longitude: -122.006963 },
  { latitude: 37.277236, longitude: -122.00675 },
  { latitude: 37.27815099999999, longitude: -122.005939 },
  { latitude: 37.278111, longitude: -122.005876 },
  { latitude: 37.278033, longitude: -122.005844 },
  { latitude: 37.27774499999999, longitude: -122.005396 },
  { latitude: 37.27735100000001, longitude: -122.005791 },
  { latitude: 37.277236, longitude: -122.005845 },
  { latitude: 37.277103, longitude: -122.005863 } ];

console.log(JSON.stringify(route));

yelp.searchRoute(route).then(function(data) {
	console.log(_.pluck(data, 'name'));
})
.catch(function(error) {
	console.error('YELP TEST ERROR! Err=', error);
})
.done();