var cloudinary = require('cloudinary');
var app = require('../app').app;
var config = require('../config/database');
var multer = require('multer');

var upload = multer({ dest : '../public/uploads'});
var type = upload.single('recfile');

cloudinary.config({ 
    cloud_name: config.cloud_name, 
    api_key: config.api_key, 
    api_secret: config.api_secret
});

/*app.post('/upload', type, function (req,res) {
    res.send('File uploaded');
    console.log(req.file.path);
    cloudinary.uploader.upload(req.file.path, function(result) { 
        console.log(result);
    });
});*/

app.post('/exception/:exceptionId/picture', type, function(req, res){
    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err || !exception){
            res.json({ message: 'error' });
            return;
        }

        cloudinary.uploader.upload(req.file.path, function(result) { 
            exception.pic_url = result.url;
            exception.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'picture uploaded' });
            });
        });
    });
});