process.env.NODE_ENV = 'test'; //at the moment not needed

var mongoose = require("mongoose");
var app = require('../app').app;
var User = require('../models/user');

//provide an example JWT for test purpose
var authTokenExample = require('../config/database').authTokenExample;

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect
var should = chai.should();
chai.use(chaiHttp);

describe('Authentication routes', () => {
    afterEach((done) => { //Before each test we empty the database
        User.remove({}, (err) => {
            done();         
        });     
    });

    var user = {username: 'o(Y<tbPD{Y-fE[/8H*%%o{AQrFe26k$', password: '5k3</@3h4;%v;j&(/i=!S5=k6p%qwV5'};
    var userNewPassword = {username: 'o(Y<tbPD{Y-fE[/8H*%%o{AQrFe26k$', password: 'new'+ user.password};
    var incorrectUser = {username: 'user', password: 'wrong_password'};

    describe('POST api/signup & signin', () => {
        it('it sould signup and signin', (done) => {
            chai.request(app)
                .post('/api/signup')
                .set('authorization',authTokenExample)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body.username).to.equal(user.username);
                    chai.request(app)
                        .post('/signin')
                        .send(user)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.have.property('token');
                            done();
                        });
                });
            });
    });

    describe('POST api/signup without Token', () => {
        it('it sould fail to signup without token', (done) => {
            chai.request(app)
                .post('/api/signup')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
            });
    });

    describe('POST /signin wrong credentials', () => {
        it('it sould fail to signin', (done) => {
            chai.request(app)
                .post('/signin')
                .send(incorrectUser)
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body.message).to.equal('Authentication failed. Invalid user or password.');
                    done();
                });
            });
    });

    describe('POST /signin without parameters', () => {
        it('it sould give error message', (done) => {
            chai.request(app)
                .post('/signin')
                .send({})
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Please provide username and password');
                    done();
                });
            });
    });

    describe('POST /api/signup without parameters', () => {
        it('it sould give error message', (done) => {
            chai.request(app)
                .post('/api/signup')
                .set('authorization',authTokenExample)
                .send({})
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Please provide username and password');
                    done();
                });
            });
    });

    describe('POST api/changepassword without Token', () => {
        it('it sould fail to change password without token', (done) => {
            chai.request(app)
                .post('/api/changepassword')
                .send({newpassword: userNewPassword.password})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
            });
    });

    describe('POST api/changepassword with wrong Token', () => {
        it('it sould fail to change password with wrong token', (done) => {
            chai.request(app)
                .post('/api/changepassword')
                .set('authorization','wrongToken123')
                .send({newpassword: userNewPassword.password})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
            });
    });

    describe('POST api/changepassword without Parameters', () => {
        it('it sould fail to change password without parameters', (done) => {
            chai.request(app)
                .post('/api/changepassword')
                .set('authorization',authTokenExample)
                .send()
                .end((err, res) => {
                    expect(res.body.message).to.equal('Please provide newpassword');
                    res.should.have.status(400);
                    done();
                });
            });
    });

    describe('POST api/changepassword', () => {
        it('it sould signup, signin, changepassword and signin', (done) => {
            chai.request(app)
                .post('/api/signup')
                .set('authorization',authTokenExample)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body.username).to.equal(user.username);
                    chai.request(app)
                        .post('/signin')
                        .send(user)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.have.property('token');
                            chai.request(app)
                                .post('/api/changepassword')
                                .set('authorization',res.body.token)
                                .send({newpassword: userNewPassword.password})
                                .end((err, res) => {
                                    chai.request(app)
                                    .post('/signin')
                                    .send(userNewPassword)
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.have.property('token');
                                        done();
                                    });
                                });
                        });
                });
        });
    });
});