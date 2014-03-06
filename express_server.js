var express = require('express');
 
var app = express();
 
// see http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/
app.get('/test', function(req, res) {
    res.send({hello: 'world'});
});
 
app.listen(3000);
console.log('Listening on port 3000...');