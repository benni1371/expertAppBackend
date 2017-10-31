process.env.NODE_ENV = 'test'; //at the moment not needed

var tokenstorage = require('../helpers/tokenStorage');

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect
var should = chai.should();
chai.use(chaiHttp);

describe('Token Storage', () => {
    afterEach((done) => { //Before each test we empty the database
        tokenstorage.deleteTokensOfUser('username',function(err){
            done();
        });     
    });
    
    describe('Store token and validate it', () => {
        it('it sould be validated', (done) => {
            tokenstorage.storeToken('username','123',function(err){
                tokenstorage.validateToken('username','123',function(result){
                    expect(result).to.be.equal(true);
                    done();
                });
            });
        }); 
    });

    describe('Validate unexisting token', () => {
        it('it sould not be validated', (done) => {
            tokenstorage.storeToken('username','123',function(err){
                tokenstorage.validateToken('username','124',function(result){
                    expect(result).to.be.equal(false);
                    done();
                });
            });
        }); 
    });

    describe('Store two tokens and validate one', () => {
        it('it sould be validated', (done) => {
            tokenstorage.storeToken('username','123',function(err){
                tokenstorage.storeToken('username','124',function(err){
                    tokenstorage.validateToken('username','123',function(result){
                        expect(result).to.be.equal(true);
                        done();
                    });
                });
            });
        }); 
    });

    describe('Store two tokens and delete all of the users tokens', () => {
        it('it sould not be validated', (done) => {
            tokenstorage.storeToken('username','123',function(err){
                tokenstorage.storeToken('username','124',function(err){
                    tokenstorage.deleteTokensOfUser('username',function(err){
                        tokenstorage.validateToken('username','123',function(result){
                            expect(result).to.be.equal(false);
                            tokenstorage.validateToken('username','124',function(result){
                                expect(result).to.be.equal(false);
                                done();
                            });
                        });
                    });
                });
            });
        }); 
    });
});