var config = require('../config/database');
var jsonwebtoken = require("jsonwebtoken");

module.exports.authenticatesocketio = function(socket, next){
  if(socket.request._query.auth_token){
    jsonwebtoken.verify(socket.request._query.auth_token, config.secret, function(err, decode) {
      if (err) {
        socket.request.user = undefined;
        next(new Error('JWT is invalid.'));
      } else {
        socket.request.user = decode;
        next();
      }
    });
  } else {
    socket.request.user = undefined;
    next(new Error('JWT is invalid.'));
  }
};

module.exports.authenticate = function(req, res, next) {
  if(req.method == 'OPTIONS'){
    req.user = {'username':'optionsuser'};
    next();
  } else if (req.headers && req.headers.authorization) {
    jsonwebtoken.verify(req.headers.authorization, config.secret, function(err, decode) {
      if (err) req.user = undefined;
      req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
};

module.exports.authenticateapi = function (req, res, next) {
  if(req.user){
    next();
  } else {
    res.status(401).json({ message: 'JWT is invalid.' });
  }
};