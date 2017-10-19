var app = require('../app').app;

var multiparty = require('connect-multiparty')();
var fs = require('fs');
var mongoose = require('mongoose');
var Gridfs = require('gridfs-stream');
var Exception = require('../models/schemas').exceptionSchema;
var User = require('../models/user');

var saveResource = function(req,res,callback){
 var db = mongoose.connection.db;
 var mongoDriver = mongoose.mongo;
 var gfs = new Gridfs(db, mongoDriver);
 var writestream = gfs.createWriteStream({
   filename: req.files.file.name,
   mode: 'w',
   content_type: req.files.file.mimetype,
   metadata: req.body
 });
 fs.createReadStream(req.files.file.path).pipe(writestream);
 writestream.on('close', function(file) {
   callback(file);
   fs.unlink(req.files.file.path, function(err) {});
 });
}

app.post('/api/exception/:exceptionId/picture', multiparty, function(req, res){
  saveResource(req,res,function(file){
    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err || !exception)
            return res.status(400).json({ message: 'Error: Exception not found' });

        exception.pictureurl = file._id;  // update the exceptions info

        // save the exception
        exception.save(function(err) {
            if (err)
                return res.status(400).send(err);
            res.json({ message: 'exception updated!' });
        });
      });
  });
});

app.post('/api/user/:userName/picture', multiparty, function(req, res){
  saveResource(req,res,function(file){
    User.findOne({ 'username' :  req.params.userName },function(err, user){
      if (err || !user)
          return res.status(400).json({ message: 'Error: User not found' });

      user.pictureurl = file._id;

      user.save(function(err) {
          if (err)
              return res.status(400).send(err);
          res.json({ message: 'user updated!' });
      });
    });
  });
});

app.get('/api/picture/:pictureId', function(req, res) {
  var db = mongoose.connection.db;
  var mongoDriver = mongoose.mongo;
  var gfs = new Gridfs(db, mongoDriver);
  var options = {
    _id: req.params.pictureId
  };
  gfs.exist(options, function (err, found) {
    if (!found)
      return res.status(400).json({ message: 'Error: Picture not found' });
    var readstream = gfs.createReadStream(options);
    readstream.pipe(res);
  }); 
});

app.get('/api/user/:userName/picture', function(req, res){
  User.findOne({ 'username' :  req.params.userName },function(err, user){
      if (err || !user)
          return res.status(400).json({ message: 'Error: User not found' });
      res.redirect('/api/picture/'+user.pictureurl);
    });
});