var express = require('express');
var app = express();
module.exports.app = app;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
module.exports.io = io;
var jwtauth = require("./security/jwt-auth");

//socket io middleware
io.use(jwtauth.authenticatesocketio);

// middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length");
  next();
});
app.use(jwtauth.authenticate);
app.use('/api', jwtauth.authenticateapi);

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
//TODO: change to exception/id/picture
require('./routes/file-routes');
require('./routes/authentication-routes');
require('./routes/comment-routes');
require('./routes/exception-routes');

//socket io, only for authenticated users
io.on('connection', function(socket){
  socket.emit('success', {
    message: 'success logged in!',
    user: socket.request.user
  });
});

http.listen(process.env.PORT || 3000, function(){
 console.log('Example app listening on port 3000!');
});
