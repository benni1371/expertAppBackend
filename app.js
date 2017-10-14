var express = require('express');
var app = express();
module.exports.app = app;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
module.exports.io = io;
console.log('dev');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//DB setup
var uristring =
    process.env.MONGODB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost:27017';
	
mongoose.connect(uristring, {
  useMongoClient: true
}).then(function(){
	console.log('Connected to Mongo');
});

//defines the routes
require('./routes');

//socket io
io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(process.env.PORT || 3000, function(){
 console.log('Example app listening on port 3000!');
});
