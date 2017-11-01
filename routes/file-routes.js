var app = require('../app').app;

var multiparty = require('connect-multiparty')();
var fs = require('fs');
var mongoose = require('mongoose');
var Gridfs = require('gridfs-stream');
var Exception = require('../models/schemas').exceptionSchema;
var User = require('../models/user');
var imagemagick = require('imagemagick');
var config = require('../config/database');
var authorize = require('../security/authorization-middleware');

var saveResource = function(req,res,callback){
  imagemagick.resize({
    srcPath: req.files.file.path,
    dstPath: 'smaller-'+req.files.file,
    width: config.imageWidth}, function(err, stdout, stderr) {
      var db = mongoose.connection.db;
      var mongoDriver = mongoose.mongo;
      var gfs = new Gridfs(db, mongoDriver);
      var writestream = gfs.createWriteStream({
        filename: req.files.file.name,
        mode: 'w',
        content_type: req.files.file.mimetype,
        metadata: req.body
      });
      fs.createReadStream('smaller-'+req.files.file).pipe(writestream);
      writestream.on('close', function(file) {
        callback(file);
        fs.unlink(req.files.file.path, function(err) {});
        fs.unlink('smaller-'+req.files.file, function(err) {});
      });
  });
}

app.post('/api/exception/:exceptionId/picture',authorize(['expert','admin']), multiparty, function(req, res){
  Exception.findById(req.params.exceptionId, function(err, exception) {
    saveResource(req,res,function(file){
        if (err || !exception)
            return res.status(400).json({ message: 'Error: Exception not found' });

        if(exception.author != req.user.username && req.user.role != 'admin')
            return res.status(401).json({ message: 'Not authorized.' });

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

app.post('/api/user/:userName/picture',authorize(['expert','admin']), multiparty, function(req, res){
  if(req.params.userName != req.user.username && req.user.role != 'admin')
    return res.status(401).json({ message: 'Not authorized.' });

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

app.get('/api/picture/:pictureId',authorize(['expert','admin']), function(req, res) {
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