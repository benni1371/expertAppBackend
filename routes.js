var app = require('./app');
var Exception = require('./schemas').exceptionSchema;
var Comment = require('./schemas').commentSchema;

app.app.get('/', function(req, res){
 res.send("Hello World-changed-1");
});

app.app.post('/exception', function(req, res){
    var exception = new Exception();      // create a new instance of the Exception model
    exception.name = req.body.name;
    exception.description = req.body.description;
    exception.date = new Date();

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
    var inputDate = req.query.olderthan || new Date();
    Exception.find({'date': { $lte: inputDate }},function(err, exceptions) {
        if (err)
            res.send(err);
        res.json(exceptions);
    }).limit(parseInt(req.query.limit || '0'));
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

app.app.post('/exception/:exceptionId/comment', function(req, res){
    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err || !exception){
            res.json({ message: 'error' });
            return;
        }

        var comment = new Comment();
        comment.body = req.body.body;
        comment.date = new Date();

        exception.comments.push(comment);

        // save the comment
        exception.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'comment posted!' });
        });
    });
});

app.app.delete('/exception/:exceptionId/comment/:commentId', function(req, res){
    Exception.findById(req.params.exceptionId, function(err, exception) {
            if (err || !exception){
                res.json({ message: 'error' });
                return;
            }
            for(var i=0;i<exception.comments.length;i++){
                if(exception.comments[i].id == req.params.commentId){
                    exception.comments.splice(i,1);
                }
            }
            // delete the comment
            exception.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'comment deleted!' });
            });
        }
    );
});

app.app.put('/exception/:exceptionId/comment/:commentId', function(req, res){
    Exception.findById(req.params.exceptionId, function(err, exception) {
            if (err || !exception){
                res.json({ message: 'error' });
                return;
            }
            for(var i=0;i<exception.comments.length;i++){
                if(exception.comments[i].id == req.params.commentId){
                    exception.comments[i].body = req.body.body;
                }
            }
            // update the comment
            exception.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'comment updated!' });
            });
        }
    );
});
