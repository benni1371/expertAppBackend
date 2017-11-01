var app = require('../app').app;
var io = require('../app').io;
var Exception = require('../models/schemas').exceptionSchema;
var Comment = require('../models/schemas').commentSchema;
var authorize = require('../security/authorization-middleware');

app.post('/api/exception/:exceptionId/comment',authorize(['expert','admin']), function(req, res){
    if(!req.body.content)
        return res.status(400).send({message: 'Please provide content'});

    Exception.findById(req.params.exceptionId, function(err, exception) {
        if (err || !exception)
            return res.status(400).send({message: 'Error: exceptionId not found'});

        var comment = new Comment();
        comment.content = req.body.content;
        comment.date = new Date();
        comment.author = req.user.username;
        if(req.body.location)
            comment.location = req.body.location;

        exception.comments.push(comment);

        //keep the clients updated
        io.sockets.emit('comment',exception);

        // save the comment
        exception.save(function(err) {
            if (err)
                return res.status(400).send(error);
            res.json({ message: 'comment posted!' });
        });
    });
});

app.delete('/api/exception/:exceptionId/comment/:commentId',authorize(['expert','admin']), function(req, res){
    Exception.findById(req.params.exceptionId, function(err, exception) {
            if (err || !exception)
                return res.status(400).send({message: 'Error: exceptionId not found'});
            
            var found = false;
            for(var i=0;i<exception.comments.length;i++){
                if(exception.comments[i].id == req.params.commentId){
                    if(exception.comments[i].author != req.user.username && req.user.role != 'admin')
                        return res.status(401).json({ message: 'Not authorized.' });
                    exception.comments.splice(i,1);
                    found = true;
                }
            }
            if(!found)
                return res.status(400).send({message: 'Error: commentId not found'});

            // delete the comment
            exception.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'comment deleted!' });
            });
        }
    );
});

app.put('/api/exception/:exceptionId/comment/:commentId',authorize(['expert','admin']), function(req, res){
    if(!req.body.content)
        return res.status(400).send({message: 'Please provide content'});

    Exception.findById(req.params.exceptionId, function(err, exception) {
            if (err || !exception)
                return res.status(400).send({message: 'Error: exceptionId not found'});
            
            var found = false;
            for(var i=0;i<exception.comments.length;i++){
                if(exception.comments[i].id == req.params.commentId){
                    if(exception.comments[i].author != req.user.username && req.user.role != 'admin')
                        return res.status(401).json({ message: 'Not authorized.' });
                    exception.comments[i].content = req.body.content;
                    if(req.body.location)
                        exception.comments[i].location = req.body.location;
                    found = true;
                }
            }
            if(!found)
                return res.status(400).send({message: 'Error: commentId not found'});
            // update the comment
            exception.save(function(err) {
                if (err)
                    res.send(err);
                res.json({ message: 'comment updated!' });
            });
    });
});
