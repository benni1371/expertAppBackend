var redisUrl = require('../config/database').redisUrl;
var redisClient = require('redis').createClient(redisUrl);

redisClient.on('connect',function(err){
  if(process.env.NODE_ENV != 'test')
   console.log('Connected to Redis');
})

module.exports.storeToken = function(username, token, callback){
    redisClient.sadd([username,token],callback);
};

module.exports.deleteTokensOfUser = function(username, callback){
    redisClient.del(username,callback);
};

module.exports.validateToken = function(username, token, callback){
    redisClient.sismember([username,token],function(err,reply){
        if(reply == 1)
            return callback(true);
        callback(false);
    })
};

