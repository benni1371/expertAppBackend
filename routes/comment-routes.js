var app = require('../app').app;
var io = require('../app').io;
var Exception = require('../models/schemas').exceptionSchema;
var Comment = require('../models/schemas').commentSchema;

app.post('/exception/:exceptionId/comment', function(req, res){
    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err || !exception){
            res.json({ message: 'error' });
            return;
        }

        var comment = new Comment();
        comment.body = req.body.body;
        comment.date = new Date();

        exception.comments.push(comment);

        //keep the clients updated
        io.sockets.emit('comment',exception);

        // save the comment
        exception.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'comment posted!' });
        });
    });
});

app.delete('/exception/:exceptionId/comment/:commentId', function(req, res){
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

app.put('/exception/:exceptionId/comment/:commentId', function(req, res){
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
