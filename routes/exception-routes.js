var app = require('../app').app;
var io = require('../app').io;
var Exception = require('../models/schemas').exceptionSchema;

app.post('/api/exception', function(req, res){
    if(!req.body.name || !req.body.description)
        return res.status(400).send({message: 'Please provide name and description'});

    var exception = new Exception();      // create a new instance of the Exception model
    exception.name = req.body.name;
    exception.description = req.body.description;
    exception.date = new Date();
    exception.author = req.user.username;
    exception.location = { type: 'Point', coordinates: [-179.0, 0.0] };

    io.sockets.emit('exception',exception);

    // save the exception and check for errors
    exception.save(function(err) {
        if (err){
            res.send(err);
        }
        res.json({ message: 'exception created!' });
    });
});

app.get('/api/exception', function(req, res){
    var inputDate = req.query.olderthan || new Date();
    Exception.find({'date': { $lt: inputDate }},function(err, exceptions) {
        if (err)
            res.status(400).send(err);
        res.json(exceptions);
    }).limit(parseInt(req.query.limit || '0'))
    .sort([['date', -1]]);
});

app.get('/api/exception/:exceptionId', function(req, res){
    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err || !exception)
            return res.status(400).send({message: 'Error: Id not found'});
        res.json(exception);
    });
});

app.delete('/api/exception/:exceptionId', function(req, res){
    Exception.remove({_id: req.params.exceptionId}, function(err, exception) {
        if (err)
            res.status(400).send({message: 'Error: Id not found'});
        res.json({ message: 'Successfully deleted' });
    });
});

app.put('/api/exception/:exceptionId', function(req, res){
    if(!req.body.name || !req.body.description)
        return res.status(400).send({message: 'Please provide name and description'});

    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err || !exception)
            return res.status(400).send({message: 'Error: Id not found'});

        exception.name = req.body.name;  // update the exceptions info
        exception.description = req.body.description;  // update the exceptions info

        // save the exception
        exception.save(function(err) {
            if (err)
                res.status(400).send(err);
            res.json({ message: 'exception updated!' });
        });
    });
});