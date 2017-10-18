var app = require('../app').app;
var io = require('../app').io;
var Exception = require('../models/schemas').exceptionSchema;
var Comment = require('../models/schemas').commentSchema;

app.post('/api/exception/:exceptionId/comment', function(req, res){
    if(!req.body.content)
        return res.status(400).send({message: 'Please provide content'});

    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err || !exception){
            res.json({ message: 'error' });
            return;
        }

        var comment = new Comment();
        comment.content = req.body.content;
        comment.date = new Date();
        comment.author = req.user.username;

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

app.delete('/api/exception/:exceptionId/comment/:commentId', function(req, res){
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

app.put('/api/exception/:exceptionId/comment/:commentId', function(req, res){
    if(!req.body.content)
        return res.status(400).send({message: 'Please provide content'});

    Exception.findById(req.params.exceptionId, function(err, exception) {
            if (err || !exception){
                res.json({ message: 'error' });
                return;
            }
            for(var i=0;i<exception.comments.length;i++){
                if(exception.comments[i].id == req.params.commentId){
                    exception.comments[i].content = req.body.content;
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
