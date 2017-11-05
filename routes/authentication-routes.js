var mongoose = require('mongoose'),
  app = require('../app').app,
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcryptjs'),
  User = require("../models/user");
var tokenstorage = require('../helpers/tokenStorage');

var config = require('../config/database');
var authorize = require('../security/authorization-middleware');

app.post('/api/user',authorize(['admin']),function(req, res) {
  if(!req.body.username || !req.body.username || !req.body.role)
    return res.status(400).send({message: 'Please provide username, password and role'});

  var newUser = new User(req.body);
  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
  newUser.save(function(err, user) {
    if (err) {
      return res.status(400).send({
        message: err
      });
    } else {
      user.hash_password = undefined;
      return res.json(user);
    }
  });
});

app.put('/api/user/:userId/password',authorize(['admin','expert']),function(req, res) {
  if(!req.body.newpassword)
    return res.status(400).send({message: 'Please provide newpassword'});

  if(!req.body.oldpassword && req.user.role != 'admin')
    return res.status(400).send({message: 'Please provide newpassword'});

  if(req.params.userId != req.user.username && req.user.role != 'admin')
    return res.status(401).json({ message: 'You are not authorized to change another user\'s password.' });

  User.findOne({
    username: req.params.userId
  }, function(err, user) {
    if (err) throw err;
    if (!user)
      return res.status(400).json({ message: 'User not found.' });
    
    if (req.user.role != 'admin' && !user.comparePassword(req.body.oldpassword))
      return res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });


    user.hash_password = bcrypt.hashSync(req.body.newpassword, 10);
    user.save(function(err, user) {
      if (err) {
        return res.status(400).send({
          message: err
        });
      }
      user.hash_password = undefined;
      tokenstorage.deleteTokensOfUser(req.params.userId);
      return res.json(user);
    });
  });
});

app.put('/api/user/:userId/role',authorize(['admin']),function(req, res) {
  if(!req.body.newrole)
    return res.status(400).send({message: 'Please provide newrole'});

  User.findOne({
    username: req.params.userId
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    user.role = req.body.newrole;
    user.save(function(err, user) {
      if (err) {
        return res.status(400).send({
          message: err
        });
      }
      user.hash_password = undefined;
      tokenstorage.deleteTokensOfUser(req.params.userId);
      return res.json(user);
    });
  });
});

app.delete('/api/user/:userId',authorize(['expert','admin']),function(req, res) {
  if(req.params.userId != req.user.username && req.user.role != 'admin')
    return res.status(401).json({ message: 'You are not authorized to delete another user.' });

  User.remove({username: req.params.userId}, function(err) {
    if (err)
        return res.status(400).send({message: err});

    tokenstorage.deleteTokensOfUser(req.params.userId);
    res.json({ message: 'Successfully deleted' });
  });
});

app.post('/signin', function(req, res) {
  if(!req.body.username || !req.body.username)
    return res.status(400).send({message: 'Please provide username and password'});

  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!user || !user.comparePassword(req.body.password)) {
      return res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });
    }
    var token = jwt.sign({ username: user.username, role: user.role, _id: user._id }, config.secret);
    tokenstorage.storeToken(user.username,token,function(err){
      return res.json({ token: token});
    });
  });
});