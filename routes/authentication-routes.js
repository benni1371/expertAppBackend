var mongoose = require('mongoose'),
  app = require('../app').app,
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcryptjs'),
  User = require("../models/user");

var level = require('level');
var Secondary = require('level-secondary');
var sub = require('level-sublevel');
  
var db = sub(level('../db', {
  valueEncoding: 'json'
}));
  
var tokens = db.sublevel('tokens');
tokens.byUsername = Secondary(tokens, 'username');

var config = require('../config/database');

//Todo: only admin
app.post('/api/user',function(req, res) {
  if(!req.body.username || !req.body.username)
    return res.status(400).send({message: 'Please provide username and password'});

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

app.put('/api/user/:userId/password',function(req, res) {
  if(!req.body.newpassword)
    return res.status(400).send({message: 'Please provide newpassword'});

  if(req.params.userId != req.user.username)
    return res.status(401).json({ message: 'You are not authorized to change another user\'s password.' });

  User.findOne({
    username: req.user.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    user.hash_password = bcrypt.hashSync(req.body.newpassword, 10);
    user.save(function(err, user) {
      if (err) {
        return res.status(400).send({
          message: err
        });
      }
      user.hash_password = undefined;
      return res.json(user);
    });
  });
});

//Todo: app.put(/api/user/:userId/roles) for admin & RESET tokens!!!

//Todo: only admin & RESET tokens!!!
app.delete('/api/user/:userId',function(req, res) {
  User.remove({username: req.params.userId}, function(err) {
    if (err)
        return res.status(400).send({message: err});

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
    var token = jwt.sign({ username: user.username, _id: user._id }, config.secret);

    tokens.put(token, {
      username: user.username
    }, function(err) {
      return res.json({ token: token});
    });
  });
});