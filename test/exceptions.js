process.env.NODE_ENV = 'test'; //at the moment not needed

var mongoose = require("mongoose");
var app = require('../app').app;
var Exception = require('../models/schemas').exceptionSchema;

//provide an example JWT for test purpose
var authTokenExample = require('../config/database').authTokenExample;
var authTokenExampleNoAdmin = require('../config/database').authTokenExampleNoAdmin;

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
var should = chai.should();
chai.use(chaiHttp);

describe('Exception routes', () => {
    beforeEach((done) => { //Before each test we empty the database
        Exception.remove({}, (err) => {
            done();         
        });     
    });

    describe('GET /api/exception without authorization token', () => {
        it('it sould be an unauthorized request', (done) => {
            chai.request(app)
                .get('/api/exception')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
            });
    });

    describe('GET /api/exception', () => {
        it('it should GET all the exceptions', (done) => {
            chai.request(app)
                .get('/api/exception')
                .set('authorization', authTokenExample)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
            });
    });

    describe('GET /api/exception/:exceptionId', () => {
        it('it should GET a exception by the given id', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'henrik',date: '2017-10-18T16:45:06.969Z', location: [-179.0, 0.0] });
            exception.save((err, exception) => {
                chai.request(app)
                .get('/api/exception/' + exception.id)
                .set('authorization', authTokenExample)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.should.have.property('description');
                    res.body.should.have.property('author');
                    res.body.should.have.property('date');
                    res.body.should.have.property('location');
                    res.body.should.have.property('_id').eql(exception.id);
                    done();
                });
            });
        });
    });

    describe('POST /api/exception', () => {
        var exception = { name:'testException', description:'myDescription',location: [-179.0, 0.0]  };
        it('it should POST an exception', (done) => {
            chai.request(app)
                .post('/api/exception')
                .set('authorization', authTokenExample)
                .send(exception)
                .end((err, res) => {
                    res.should.have.status(200);
                    Exception.findOne({name: 'testException'}, function(err, returnedException) {
                        expect(returnedException.name).to.equal(exception.name);
                        expect(returnedException.description).to.equal(exception.description);
                        returnedException.should.have.property('location');
                        expect(returnedException.location[0]).to.equal(exception.location[0]);
                        expect(returnedException.location[1]).to.equal(exception.location[1]);
                        //added by server
                        returnedException.should.have.property('author');
                        returnedException.should.have.property('date');
                        done();
                   });
                });
            });
    });

    describe('DELETE /api/exception/:exceptionId as admin', () => {
        it('it should delete a exception by the given id', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'henrik',date: '2017-10-18T16:45:06.969Z' });
            exception.save((err, exception) => {
                chai.request(app)
                .delete('/api/exception/' + exception.id)
                .set('authorization', authTokenExample)
                .end((err, res) => {
                    res.should.have.status(200);
                    Exception.count({name: 'testException'}, function(err, count) {
                        expect(count).to.equal(0);
                        done();
                    });
                });
            });
        });
    });

    describe('DELETE /api/exception/:exceptionId as non-author', () => {
        it('it should not delete a exception by the given id', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'henrik',date: '2017-10-18T16:45:06.969Z' });
            exception.save((err, exception) => {
                chai.request(app)
                .delete('/api/exception/' + exception.id)
                .set('authorization', authTokenExampleNoAdmin)
                .end((err, res) => {
                    res.should.have.status(401);
                    Exception.count({name: 'testException'}, function(err, count) {
                        expect(count).to.equal(1);
                        expect(res.body.message).to.equal('Not authorized.');
                        done();
                    });
                });
            });
        });
    });

    describe('DELETE /api/exception/:exceptionId as author but no admin', () => {
        it('it should delete a exception by the given id', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'noAdmin',date: '2017-10-18T16:45:06.969Z' });
            exception.save((err, exception) => {
                chai.request(app)
                .delete('/api/exception/' + exception.id)
                .set('authorization', authTokenExampleNoAdmin)
                .end((err, res) => {
                    res.should.have.status(200);
                    Exception.count({name: 'testException'}, function(err, count) {
                        expect(count).to.equal(0);
                        done();
                    });
                });
            });
        });
    });

    describe('PUT /api/exception/:exceptionId as admin', () => {
        it('it should update an exception by the given id', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'henrik',date: '2017-10-18T16:45:06.969Z',location: [-179.0, 0.0]});
            var updatedException = new Exception({ name:'testException', description:'my updated Description' });
            exception.save((err, exception) => {
                chai.request(app)
                .put('/api/exception/' + exception.id)
                .set('authorization', authTokenExample)
                .send(updatedException)
                .end((err, res) => {
                    res.should.have.status(200);
                    Exception.findById(exception.id, function(err, returnedException) {
                        expect(returnedException.description).to.equal(updatedException.description);
                        expect(returnedException.location[0]).to.equal(exception.location[0]);
                        expect(returnedException.location[1]).to.equal(exception.location[1]);
                        done();
                    });
                });
            });
        });
    });

    describe('PUT /api/exception/:exceptionId as non-author', () => {
        it('it should not update an exception by the given id', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'henrik',date: '2017-10-18T16:45:06.969Z',location: [-179.0, 0.0]});
            var updatedException = new Exception({ name:'testException', description:'my updated Description' });
            exception.save((err, exception) => {
                chai.request(app)
                .put('/api/exception/' + exception.id)
                .set('authorization', authTokenExampleNoAdmin)
                .send(updatedException)
                .end((err, res) => {
                    res.should.have.status(401);
                    Exception.findById(exception.id, function(err, returnedException) {
                        expect(returnedException.description).to.equal(exception.description);
                        expect(returnedException.location[0]).to.equal(exception.location[0]);
                        expect(returnedException.location[1]).to.equal(exception.location[1]);
                        done();
                    });
                });
            });
        });
    });

    describe('PUT /api/exception/:exceptionId as author but no admin', () => {
        it('it should update an exception by the given id', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'noAdmin',date: '2017-10-18T16:45:06.969Z',location: [-179.0, 0.0]});
            var updatedException = new Exception({ name:'testException', description:'my updated Description' });
            exception.save((err, exception) => {
                chai.request(app)
                .put('/api/exception/' + exception.id)
                .set('authorization', authTokenExampleNoAdmin)
                .send(updatedException)
                .end((err, res) => {
                    res.should.have.status(200);
                    Exception.findById(exception.id, function(err, returnedException) {
                        expect(returnedException.description).to.equal(updatedException.description);
                        expect(returnedException.location[0]).to.equal(exception.location[0]);
                        expect(returnedException.location[1]).to.equal(exception.location[1]);
                        done();
                    });
                });
            });
        });
    });

    describe('POST /api/exception without Parameters', () => {
        it('it should reject the request', (done) => {
            chai.request(app)
                .post('/api/exception')
                .set('authorization', authTokenExample)
                .send({})
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Please provide name and description');
                    done();
                });
            });
    });

    describe('PUT /api/exception/:exceptionId without Parameters', () => {
        it('it should reject the request', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'henrik',date: '2017-10-18T16:45:06.969Z' });
            exception.save((err, exception) => {
                chai.request(app)
                .put('/api/exception/' + exception.id)
                .set('authorization', authTokenExample)
                .send({})
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Please provide name and description');
                    done();
                });
            });
        });
    });

    describe('GET /api/exception/:exceptionId with wrong Id', () => {
        it('it should be rejected', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'henrik',date: '2017-10-18T16:45:06.969Z' });
            exception.save((err, exception) => {
                chai.request(app)
                .get('/api/exception/n0t3xistingpr0bably')
                .set('authorization', authTokenExample)
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Error: Id not found');
                    done();
                });
            });
        });
    });

    describe('DELETE /api/exception/:exceptionId with wrong Id', () => {
        it('it should be rejected', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'henrik',date: '2017-10-18T16:45:06.969Z' });
            exception.save((err, exception) => {
                chai.request(app)
                .delete('/api/exception/n0t3xistingpr0bably')
                .set('authorization', authTokenExample)
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Error: Id not found');
                    done();
                });
            });
        });
    });

    describe('PUT /api/exception/:exceptionId with wrong Id', () => {
        it('it should be rejected', (done) => {
            var exception = new Exception({ name:'testException', description:'myDescription', author:'henrik',date: '2017-10-18T16:45:06.969Z' });
            var updatedException = new Exception({ name:'testException', description:'my updated Description' });
            exception.save((err, exception) => {
                chai.request(app)
                .put('/api/exception/n0t3xistingpr0bably')
                .set('authorization', authTokenExample)
                .send(updatedException)
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Error: Id not found');
                    done();
                });
            });
        });
    });
});