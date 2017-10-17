var app = require('../app').app;

var multiparty = require('connect-multiparty')();
var fs = require('fs');
var mongoose = require('mongoose');
var Gridfs = require('gridfs-stream');
var Exception = require('../models/schemas').exceptionSchema;

app.post('/api/exception/:exceptionId/picture', multiparty, function(req, res){
    console.log(req.files.file.path);
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
   console.log(req.files.file.path);
   writestream.on('close', function(file) {
      Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err || !exception){
            res.json({ message: 'error' });
            return;
        }

        exception.pictureurl = file._id;  // update the exceptions info

        // save the exception
        exception.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'exception updated!' });
        });
      });
      fs.unlink(req.files.file.path, function(err) {
        // handle error
        console.log('success!')
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
    if (!found) {
      res.send('picture id does not exist');
      return;
    } else {
      var readstream = gfs.createReadStream(options);
      readstream.pipe(res);
    }
  }); 
});