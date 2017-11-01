process.env.NODE_ENV = 'test'; //at the moment not needed

//provide an example JWT for test purpose
var authTokenExample = require('../config/database').authTokenExample;
var authTokenExampleNoAdmin = require('../config/database').authTokenExampleNoAdmin;
var authTokenExampleBenjaminFranklin = require('../config/database').authTokenExampleBenjaminFranklin;

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect
var should = chai.should();
chai.use(chaiHttp);

var tokenstorage = require('../helpers/tokenStorage');

//make sure token is found in database for test user
before((done) => {
    tokenstorage.storeToken('xyz',authTokenExample,function(){
        tokenstorage.storeToken('noAdmin',authTokenExampleNoAdmin,function(){
            done();
        })
    })   
});

after((done) => {
    tokenstorage.deleteTokensOfUser('xyz', function(){
        tokenstorage.deleteTokensOfUser('noAdmin', function(){
            done();
        })
    })
});