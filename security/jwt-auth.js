var config = require('../config/database');
var jsonwebtoken = require("jsonwebtoken");
var _ = require('underscore');
var io = require('../app').io;
var tokenstorage = require('../helpers/tokenStorage');

_.each(io.nsps, function(nsp){
  nsp.on('connect', function(socket){
    if (!socket.auth) {
      //console.log("removing socket from", nsp.name)
      delete nsp.connected[socket.id];
    }
  });
});

module.exports.authenticatesocketio = function(socket){
  socket.auth = false;
  socket.on('authenticate', function(data){
    //check the auth data sent by the client
      if(data.token){
        verifyToken(data.token, function(err, decode) {
          if (err) {
            socket.request.user = undefined;
          } else {
            socket.request.user = decode;
            //console.log("Authenticated socket ", socket.id);
            socket.auth = true;
            _.each(io.nsps, function(nsp) {
              if(_.findWhere(nsp.sockets, {id: socket.id})) {
                //console.log("restoring socket to", nsp.name);
                nsp.connected[socket.id] = socket;
              }
            });
            socket.emit('authenticated');
          }
        });
      }
  });
  setTimeout(function(){
    //If the socket didn't authenticate, disconnect it
    if (!socket.auth) {
      //console.log("Disconnecting socket ", socket.id);
      socket.disconnect('unauthorized');
    }
  }, 1000);
};

module.exports.authenticate = function(req, res, next) {
  if(req.method == 'OPTIONS'){
    req.user = {'username':'optionsuser'};
    next();
  } else if (req.headers && req.headers.authorization) {
    verifyToken(req.headers.authorization, function(err, decode) {
      if (err) req.user = undefined;
      req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
};

var verifyToken = function(token, callback){
  jsonwebtoken.verify(token, config.secret, function(err, decode) {
    if (err)
      return callback('JWT is invalid', undefined);
    tokenstorage.validateToken(decode.username,token,function(valid){
      if(valid) 
        return callback(err, decode);
      return callback('JWT is not accepted', undefined);
    })
  });
}

module.exports.authenticateapi = function (req, res, next) {
  if(req.user){
    next();
  } else {
    res.status(401).json({ message: 'JWT is invalid.' });
  }
};