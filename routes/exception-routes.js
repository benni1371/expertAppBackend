var app = require('../app').app;
var io = require('../app').io;
var Exception = require('../models/schemas').exceptionSchema;

app.get('/', function(req, res){
 res.send("Hello World-changed-1");
});

app.post('/exception', function(req, res){
    var exception = new Exception();      // create a new instance of the Exception model
    exception.name = req.body.name;
    exception.description = req.body.description;
    exception.date = new Date();

    io.sockets.emit('exception',exception);

    // save the exception and check for errors
    exception.save(function(err) {
        if (err){
            res.send(err);
        }
        res.json({ message: 'exception created!' });
    });
});

app.get('/exception', function(req, res){
    var inputDate = req.query.olderthan || new Date();
    Exception.find({'date': { $lt: inputDate }},function(err, exceptions) {
        if (err)
            res.send(err);
        res.json(exceptions);
    }).limit(parseInt(req.query.limit || '0'))
    .sort([['date', -1]]);
});

app.get('/exception/:exceptionId', function(req, res){
    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err)
            res.send(err);
        res.json(exception);
    });
});

app.delete('/exception/:exceptionId', function(req, res){
    Exception.remove({_id: req.params.exceptionId}, function(err, exception) {
        if (err)
            res.send(err);
        res.json({ message: 'Successfully deleted' });
    });
});

app.put('/exception/:exceptionId', function(req, res){
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