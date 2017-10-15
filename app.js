var express = require('express');
var app = express();
module.exports.app = app;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
module.exports.io = io;
var config = require('./config/database');
var jsonwebtoken = require("jsonwebtoken");

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], config.secret, function(err, decode) {
      if (err) req.user = undefined;
      req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});
app.use('/exception', function (req, res, next) {
  if(req.user){
    next();
  } else {
    res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });
  }
});

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
require('./routes/authentication-routes');
require('./routes/comment-routes');
require('./routes/exception-routes');

//socket io
io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(process.env.PORT || 3000, function(){
 console.log('Example app listening on port 3000!');
});
