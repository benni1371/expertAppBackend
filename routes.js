var app = require('./app');
var Exception = require('./exception');

app.app.get('/', function(req, res){
 res.send("Hello World-changed-1");
});

app.app.post('/exception', function(req, res){
    var exception = new Exception();      // create a new instance of the Exception model
    exception.name = req.body.name;  // set the exceptions name (comes from the request)
    exception.description = req.body.description;  // set the exceptions description (comes from the request)

    app.io.sockets.emit('exception',exception);

    // save the exception and check for errors
    exception.save(function(err) {
        if (err){
            res.send(err);
        }
        res.json({ message: 'exception created!' });
    });
});

app.app.get('/exception', function(req, res){
    Exception.find(function(err, exceptions) {
        if (err)
            res.send(err);
        res.json(exceptions);
    });
});

app.app.get('/exception/:exceptionId', function(req, res){
    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err)
            res.send(err);
        res.json(exception);
    });
});

app.app.delete('/exception/:exceptionId', function(req, res){
    Exception.remove({_id: req.params.exceptionId}, function(err, exception) {
        if (err)
            res.send(err);
        res.json({ message: 'Successfully deleted' });
    });
});

app.app.put('/exception/:exceptionId', function(req, res){
    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err || !exception){
            res.json({ message: 'error' });
            return;
        }

        exception.name = req.body.name;  // update the exceptions info
        exception.description = req.body.description;  // update the exceptions info

        // save the exception
        exception.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'exception updated!' });
        });
    });
});