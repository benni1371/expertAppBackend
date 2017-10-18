process.env.NODE_ENV = 'test'; //at the moment not needed

var mongoose = require("mongoose");
var app = require('../app').app;
var Exception = require('../models/schemas').exceptionSchema;

//provide an example JWT for test purpose
var authTokenExample = require('../config/database').authTokenExample;

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect
var should = chai.should();
chai.use(chaiHttp);

//TODO: Try some wrong IDs!

describe('Comment routes', () => {

    var exceptionId;
    var commentId;

    beforeEach((done) => { //Before each test we add a single exception with a single comment
        Exception.remove({}, (err) => {
            var exception = new Exception({ 
                name:'testException', 
                description:'myDescription', 
                author:'henrik',
                date: '2017-10-18T16:45:06.969Z',
                comments: [
                    { body: 'body', author: 'henrik', date: '2017-10-18T16:45:06.969Z'}
                ]
            });
            exception.save((err, exception) => {
                exceptionId = exception._id;
                commentId = exception.comments[0]._id;
                done();
            });         
        });     
    });

    describe('POST /api/exception/:exceptionId/comment without Authorization', () => {
        it('it sould be rejected', (done) => {
            var comment = {body: 'myBody'};
            chai.request(app)
                .post('/api/exception/'+exceptionId+'/comment')
                .send(comment)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    describe('POST /api/exception/:exceptionId/comment', () => {
        it('it sould poste a comment', (done) => {
            var comment = {body: 'myBody'};
            chai.request(app)
                .post('/api/exception/'+exceptionId+'/comment')
                .set('authorization', authTokenExample)
                .send(comment)
                .end((err, res) => {
                    res.should.have.status(200);
                    Exception.findById(exceptionId, function(err, exception){
                        expect(exception.comments).to.have.lengthOf(2);
                        done();
                    });
                });
        });
    });

    describe('DELETE /api/exception/:exceptionId/comment', () => {
        it('it sould delete a comment', (done) => {
            chai.request(app)
                .delete('/api/exception/'+exceptionId+'/comment/'+commentId)
                .set('authorization', authTokenExample)
                .end((err, res) => {
                    res.should.have.status(200);
                    Exception.findById(exceptionId, function(err, exception){
                        expect(exception.comments).to.have.lengthOf(0);
                        done();
                    });
                });
        });
    });

    describe('PUT /api/exception/:exceptionId/comment', () => {
        it('it sould update a comment', (done) => {
            var newComment = {body: 'myNewBody'};
            chai.request(app)
                .put('/api/exception/'+exceptionId+'/comment/'+commentId)
                .set('authorization', authTokenExample)
                .send(newComment)
                .end((err, res) => {
                    res.should.have.status(200);
                    Exception.findById(exceptionId, function(err, exception){
                        expect(exception.comments[0].body).to.equal(newComment.body);
                        done();
                    });
                });
        });
    });
});