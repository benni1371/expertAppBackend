var app = require('../app').app;

var multiparty = require('connect-multiparty')();
var fs = require('fs');
var mongoose = require('mongoose');
var Gridfs = require('gridfs-stream');

app.post('/testupload1', multiparty, function(req, res){
    console.log(req.files);
});

app.post('/exception/upload/:id', multiparty, function(req, res){
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
      /*User.findById(req.params.id, function(err, user) {
        // handle error
        user.file = file._id;
        user.save(function(err, updatedUser) {
          // handle error
          return res.json(200, updatedUser)
        })
      });*/
      fs.unlink(req.files.file.path, function(err) {
        // handle error
        console.log('success!')
      });
   });
});