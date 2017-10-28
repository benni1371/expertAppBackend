var mongoose = require('mongoose'),
  app = require('../app').app,
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcryptjs'),
  User = require("../models/user");
var config = require('../config/database');

app.post('/api/signup',function(req, res) {
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
    return res.json({ token: jwt.sign({ username: user.username, _id: user._id }, config.secret) });
  });
});