var app = require('../app').app;

var multiparty = require('connect-multiparty')();
var fs = require('fs');
var mongoose = require('mongoose');
var Gridfs = require('gridfs-stream');
var Exception = require('../models/schemas').exceptionSchema;
var User = require('../models/user');
var sharp = require('sharp');
var config = require('../config/database');
var authorize = require('../security/authorization-middleware');

var saveResource = function(req,res,callback){
  if(!req.files.file)
    return callback("Please upload file", null);

  sharp(req.files.file.path)
    .resize(config.imageWidth, config.imageWidth)
    .max()
    .toFile('smaller-'+req.files.file, function(err) {
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
        callback(undefined, file);
        fs.unlink('smaller-'+req.files.file, function(err) {});
        fs.unlink(req.files.file.path, function(err) {});
      });
    });
}

app.post('/api/exception/:exceptionId/picture',authorize(['expert','admin']), multiparty, function(req, res){
  Exception.findById(req.params.exceptionId, function(err, exception) {
    saveResource(req,res,function(errFile,file){
        if (errFile)
            return res.status(400).json({ message: errFile });

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

  saveResource(req,res,function(errFile,file){
    if (errFile)
      return res.status(400).json({ message: errFile });
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

var sendPicture = function(pictureId,res){
  var db = mongoose.connection.db;
  var mongoDriver = mongoose.mongo;
  var gfs = new Gridfs(db, mongoDriver);
  var options = {
    _id: pictureId
  };
  gfs.exist(options, function (err, found) {
    if (!found)
      return res.status(400).json({ message: 'Error: Picture not found' });
    var readstream = gfs.createReadStream(options);
    readstream.pipe(res);
  });
}

app.get('/api/picture/:pictureId',authorize(['expert','admin']), function(req, res) {
  sendPicture(req.params.pictureId,res);
});

app.get('/api/user/:userName/picture', function(req, res){
  User.findOne({ 'username' :  req.params.userName },function(err, user){
      if (err || !user)
          return res.status(400).json({ message: 'Error: User not found' });
      sendPicture(user.pictureurl,res);
    });
});