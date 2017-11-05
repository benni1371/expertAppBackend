process.env.NODE_ENV = 'test'; //at the moment not needed

var mongoose = require("mongoose");
var app = require('../app').app;
var User = require('../models/user');

//provide an example JWT for test purpose
var authTokenExample = require('../config/database').authTokenExample;
var authTokenExampleNoAdmin = require('../config/database').authTokenExampleNoAdmin;

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect
var should = chai.should();
chai.use(chaiHttp);

var tokenstorage = require('../helpers/tokenStorage');

describe('Authentication routes', () => {

    afterEach((done) => { //Before each test we empty the database
        User.remove({}, (err) => {
            done();         
        });     
    });

    var user = {username: 'createdUser', password: '5k3</@3h4;%v;j&(/i=!S5=k6p%qwV5', role: 'expert'};
    var userNewPassword = {username: 'createdUser', password: 'new'+ user.password};
    var incorrectUser = {username: 'user', password: 'wrong_password' , role: 'expert'};

    describe('Access with outdated token', () => {
        it('You should not be able to access a route', (done) => {
            tokenstorage.deleteTokensOfUser('xyz', function(){
                chai.request(app)
                .get('/api/exception')
                .set('authorization',authTokenExample)
                .end((err, res) => {
                    res.should.have.status(401);
                    //reverse changes for test user
                    tokenstorage.storeToken('xyz',authTokenExample,function(){
                        done();
                    });
                });
            })
        });
    });

    describe('POST api/signup & signin', () => {
        it('it sould signup and signin', (done) => {
            chai.request(app)
                .post('/api/user')
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

    describe('POST api/signup with Http-Method-Override', () => {
        it('it sould ignore the method override', (done) => {
            chai.request(app)
                .options('/api/user')
                .set('X-HTTP-Method-Override','POST')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.request(app)
                    .post('/signin')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(401);
                        done();
                    });
                });
            });
    });

    describe('POST api/signup & signin without admin role', () => {
        it('it sould signup and signin', (done) => {
            chai.request(app)
                .post('/api/user')
                .set('authorization',authTokenExampleNoAdmin)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body.message).to.equal('Not authorized.');
                    done();
                });
            });
    });

    describe('POST api/signup without Token', () => {
        it('it sould fail to signup without token', (done) => {
            chai.request(app)
                .post('/api/user')
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

    describe('POST /api/user without parameters', () => {
        it('it sould give error message', (done) => {
            chai.request(app)
                .post('/api/user')
                .set('authorization',authTokenExample)
                .send({})
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Please provide username, password and role');
                    done();
                });
            });
    });

    describe('PUT api/user/:userId/password without Token', () => {
        it('it sould fail to change password without token', (done) => {
            chai.request(app)
                .put('/api/user/xyz/password')
                .send({newpassword: userNewPassword.password})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
            });
    });

    describe('PUT api/user/:userId/password with wrong Token', () => {
        it('it sould fail to change password with wrong token', (done) => {
            chai.request(app)
                .put('/api/user/xyz/password')
                .set('authorization','wrongToken123')
                .send({newpassword: userNewPassword.password})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
            });
    });

    describe('PUT api/user/:userId/role', () => {
        it('it sould change the role', (done) => {
            var user = new User({username: 'benjaminfranklin', hash_password: '5k3</@3h4;%v;j&(/i=!S5=k6p%qwV5', role: 'expert'});
            user.save((err, user) => {
                chai.request(app)
                .put('/api/user/benjaminfranklin/role')
                .set('authorization',authTokenExample)
                .send({newrole: 'myNewRole'})
                .end((err, res) => {
                    User.findOne({
                        username: 'benjaminfranklin'
                    }, function(err, user) {
                        expect(user.role).to.be.equal('myNewRole');
                        done();
                    });
                });
            });
        });
    });

    describe('PUT api/user/:userId/role without Parameters', () => {
        it('it sould be rejected', (done) => {
            var user = new User({username: 'benjaminfranklin', hash_password: '5k3</@3h4;%v;j&(/i=!S5=k6p%qwV5', role: 'expert'});
            user.save((err, user) => {
                chai.request(app)
                .put('/api/user/benjaminfranklin/role')
                .set('authorization',authTokenExample)
                .end((err, res) => {
                    res.should.have.status(400);
                    expect(res.body.message).to.equal('Please provide newrole');
                    done();
                });
            });
        });
    });

    describe('PUT api/user/:userId/role without admin Role', () => {
        it('it sould be rejected', (done) => {
            var user = new User({username: 'benjaminfranklin', hash_password: '5k3</@3h4;%v;j&(/i=!S5=k6p%qwV5', role: 'expert'});
            user.save((err, user) => {
                chai.request(app)
                .put('/api/user/benjaminfranklin/role')
                .set('authorization',authTokenExampleNoAdmin)
                .send({newrole: 'myNewRole'})
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body.message).to.equal('Not authorized.');
                    done();
                });
            });
        });
    });

    describe('PUT api/user/:userId/password for other user as admin', () => {
        it('it sould fail to change password for other user as admin', (done) => {
            var user = new User({username: 'benjaminfranklin', hash_password: '5k3</@3h4;%v;j&(/i=!S5=k6p%qwV5', role: 'expert'});
            user.save((err, user) => {
                chai.request(app)
                .put('/api/user/benjaminfranklin/password')
                .set('authorization',authTokenExample)
                .send({newpassword: userNewPassword.password})
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
            });
        });
    });

    describe('PUT api/user/:userId/password for wrong user', () => {
        it('it sould fail to change password for wrong user', (done) => {
            chai.request(app)
                .put('/api/user/otherUser/password')
                .set('authorization',authTokenExampleNoAdmin)
                .send({newpassword: userNewPassword.password,
                    oldpassword: user.password})
                .end((err, res) => {
                    res.should.have.status(401);
                    expect(res.body.message).to.equal('You are not authorized to change another user\'s password.');
                    done();
                });
            });
    });

    describe('DELETE api/user/:userId for other user as admin', () => {
        it('it sould delete the user', (done) => {
            var user = new User({username: 'benjaminfranklin', hash_password: '5k3</@3h4;%v;j&(/i=!S5=k6p%qwV5', role: 'expert'});
            user.save((err, user) => {
                    chai.request(app)
                    .delete('/api/user/benjaminfranklin')
                    .set('authorization',authTokenExample)
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    });
            });
        });  
    });

    describe('DELETE api/user/:userId for other user', () => {
        it('it sould fail to delete the user', (done) => {
            chai.request(app)
            .delete('/api/user/benjaminfranklin')
            .set('authorization',authTokenExampleNoAdmin)
            .end((err, res) => {
                res.should.have.status(401);
                expect(res.body.message).to.equal('You are not authorized to delete another user.');
                done();
            });
        });
    });

    describe('PUT api/user/:userId/password without Parameters', () => {
        it('it sould fail to change password without parameters', (done) => {
            chai.request(app)
                .put('/api/user/xyz/password')
                .set('authorization',authTokenExample)
                .send()
                .end((err, res) => {
                    expect(res.body.message).to.equal('Please provide newpassword');
                    res.should.have.status(400);
                    done();
                });
            });
    });

    describe('PUT api/user/:userId/password', () => {
        it('it sould signup, signin, changepassword and signin', (done) => {
            chai.request(app)
                .post('/api/user')
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
                                .put('/api/user/createdUser/password')
                                .set('authorization',res.body.token)
                                .send({newpassword: userNewPassword.password,
                                    oldpassword: user.password})
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

    describe('PUT api/user/:userId/password with wrong old password', () => {
        it('it sould signup, signin but not change password', (done) => {
            chai.request(app)
                .post('/api/user')
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
                                .put('/api/user/createdUser/password')
                                .set('authorization',res.body.token)
                                .send({newpassword: userNewPassword.password,
                                    oldpassword: 'wrong password'})
                                .end((err, res) => {
                                    res.should.have.status(401);
                                    done();
                                });
                        });
                });
        });
    });

    describe('Change password and try to access with old token', () => {
        it('it sould be rejected', (done) => {
            chai.request(app)
                .post('/api/user')
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
                            var token = res.body.token;
                            chai.request(app)
                                .put('/api/user/createdUser/password')
                                .set('authorization',token)
                                .send({newpassword: userNewPassword.password,
                                    oldpassword: user.password})
                                .end((err, res) => {
                                    chai.request(app)
                                    .post('/api/exception')
                                    .set('authorization',token)
                                    .end((err, res) => {
                                        res.should.have.status(401);
                                        done();
                                    });
                                });
                        });
                });
        });
    });

    describe('DELETE api/user/:userId', () => {
        it('it sould delete the user', (done) => {
            chai.request(app)
                .post('/api/user')
                .set('authorization',authTokenExample)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body.username).to.equal(user.username);
                    chai.request(app)
                        .delete('/api/user/createdUser')
                        .set('authorization',authTokenExample)
                        .end((err, res) => {
                            res.should.have.status(200);
                            chai.request(app)
                                .post('/signin')
                                .send(user)
                                .end((err, res) => {
                                        res.should.have.status(401);
                                        done();
                                });
                        });
                });
        });
    });

    describe('DELETE api/user/:userId', () => {
        it('it sould not accept the now outdated token', (done) => {
            chai.request(app)
                .post('/api/user')
                .set('authorization',authTokenExample)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body.username).to.equal(user.username);
                    chai.request(app)
                    .post('/signin')
                    .send(user)
                    .end((err, res) => {
                        var token = res.body.token;
                        chai.request(app)
                            .delete('/api/user/createdUser')
                            .set('authorization',authTokenExample)
                            .end((err, res) => {
                                res.should.have.status(200);
                                chai.request(app)
                                    .get('/api/exception')
                                    .set('authorization',token)
                                    .end((err, res) => {
                                            res.should.have.status(401);
                                            done();
                                    });
                            });
                    });
                });
        });
    });

    describe('DELETE api/user/:userId own user', () => {
        it('it sould delete the user', (done) => {
            var user = new User({username: 'benjaminfranklin', hash_password: '$2a$10$sg/DPvInU6EZEdQdHheKWePhDYbiyoOQV6TxrdOecriCUybkhsBa6', role: 'expert'});
            user.save((err, user) => {
                chai.request(app)
                .post('/signin')
                .send({
                    username: user.username,
                    password: 'testPassword'
                })
                .end((err, res) => {
                    var token = res.body.token;
                    chai.request(app)
                    .delete('/api/user/benjaminfranklin')
                    .set('authorization',token)
                    .send({password: 'testPassword'})
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    });
                });
            });
        });
    });

    describe('DELETE api/user/:userId own user without old password', () => {
        it('it sould be rejected', (done) => {
            var user = new User({username: 'benjaminfranklin', hash_password: '$2a$10$sg/DPvInU6EZEdQdHheKWePhDYbiyoOQV6TxrdOecriCUybkhsBa6', role: 'expert'});
            user.save((err, user) => {
                chai.request(app)
                .post('/signin')
                .send({
                    username: user.username,
                    password: 'testPassword'
                })
                .end((err, res) => {
                    var token = res.body.token;
                    chai.request(app)
                    .delete('/api/user/benjaminfranklin')
                    .set('authorization',token)
                    .end((err, res) => {
                        res.should.have.status(400);
                        done();
                    });
                });
            });
        });
    });

    describe('DELETE api/user/:userId own user with wrong old password', () => {
        it('it sould be rejected', (done) => {
            var user = new User({username: 'benjaminfranklin', hash_password: '$2a$10$sg/DPvInU6EZEdQdHheKWePhDYbiyoOQV6TxrdOecriCUybkhsBa6', role: 'expert'});
            user.save((err, user) => {
                chai.request(app)
                .post('/signin')
                .send({
                    username: user.username,
                    password: 'testPassword'
                })
                .end((err, res) => {
                    var token = res.body.token;
                    chai.request(app)
                    .delete('/api/user/benjaminfranklin')
                    .set('authorization',token)
                    .send({password: 'wrongPassword'})
                    .end((err, res) => {
                        res.should.have.status(401);
                        done();
                    });
                });
            });
        });
    });
    
});