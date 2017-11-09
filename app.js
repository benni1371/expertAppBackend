var express = require('express');
var app = express();
module.exports.app = app;
var config = require('./config/database');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
module.exports.io = io;
var jwtauth = require("./security/jwt-auth");
var _ = require('underscore');

//API secret
if(process.env.API_SECRET && process.env.NODE_ENV != 'test')
  config.API_SECRET = process.env.API_SECRET;

//Only for testing purpose!
/*require('./helpers/tokenStorage').storeToken('xyz',require('./config/database').authTokenExample,function(){
  console.log("I am not productive!");
});*/

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length");
  next();
});
app.use(jwtauth.authenticate);
app.use('/api', jwtauth.authenticateapi);

mongoose.connect(config.mongoUrl, {
  useMongoClient: true
}).then(function(){
  if(process.env.NODE_ENV != 'test')
    console.log('Connected to Mongo');
});

//defines the routes
require('./routes/file-routes');
require('./routes/authentication-routes');
require('./routes/comment-routes');
require('./routes/exception-routes');

//socket io, only for authenticated users
io.on('connection', function(socket){
  jwtauth.authenticatesocketio(socket)
});

http.listen(process.env.PORT || 3000, function(){
  if(process.env.NODE_ENV != 'test')
    console.log('Listening on port 3000!');
});
