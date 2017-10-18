process.env.NODE_ENV = 'test'; //at the moment not needed

var mongoose = require("mongoose");
var app = require('../app').app;
var io     = require('socket.io-client');
var Exception = require('../models/schemas').exceptionSchema;

//provide an example JWT for test purpose
var authTokenExample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhlbnJpayIsIl9pZCI6IjU5ZTU2NGVhN2I0Y2ViMDAxZjM1MDE1MCIsImlhdCI6MTUwODIwNTgxOH0.RuBLrrXjfCXM5JDgTGIUEH953V0F7HHJ2TzDuX02zGE';
var socketUrl = 'http://localhost:3000';

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect
var should = chai.should();
chai.use(chaiHttp);

describe('Socket.io tests', () => {

    var socket;

    beforeEach((done) => { //Before each test we empty the database
        Exception.remove({}, (err) => {
            done();         
        });
    });
    afterEach(function() { socket.close(); console.log("closed"); });

    describe('socket.io connect', () => {
        it('it should be able to connect and authenticate', (done) => {
            socket = io(socketUrl);
            
            socket.on('connect', function(){
                socket.emit('authenticate', {token: authTokenExample});
                done();
            });
        })
    });

    describe('socket.io update exception', () => {
        it('it should receive an update when exception is posted', (done) => {
            socket = io(socketUrl);
            var exception = new Exception({ name:'testException', description:'myDescription' });
            
            socket.on('connect', function(){
                socket.emit('authenticate', {token: authTokenExample});
            });

            socket.on('authenticated', function(data){
                chai.request(app)
                .post('/api/exception')
                .set('authorization', authTokenExample)
                .send(exception)
                .end((err, res) => {});
            });

            socket.on('exception', function(returnedException) {
                expect(returnedException.name).to.equal(exception.name);
                expect(returnedException.description).to.equal(exception.description);
                done();
            });
        })
    });

    describe('socket.io disconnected without token', () => {
        it('it should disconnect when not authenticated', (done) => {
            socket = io(socketUrl);
            
            socket.on('connect', function(){
                //No authentication token emitted
            });

            socket.on('disconnect', function(data){
                done();
            });
        })
    });

    describe('socket.io registration phase security', () => {
        it('it should not receive updates in registration phase', (done) => {
            socket = io(socketUrl);
            var exception = new Exception({ name:'testException', description:'myDescription' });

            socket.on('connect', function(){
                //No authentication token emitted, but exception is posted
                chai.request(app)
                .post('/api/exception')
                .set('authorization', authTokenExample)
                .send(exception)
                .end((err, res) => {});
            });

            socket.on('exception', function(returnedException) {
                //it should not see this exception at all
                expect(1).to.equal(0);
            });

            socket.on('disconnect', function(data){
                done();
            });
        })
    });
});