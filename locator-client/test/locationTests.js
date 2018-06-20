var testHelper = require('./testHelper'),
    Promise    = require('bluebird'),
    chai       = require('chai'),
    chaiHttp   = require('chai-http'),
    assert     = require('chai').assert,
    expect     = require('chai').expect,
    should     = require('chai').should;
    sinon      = require('sinon');
    request    = require('request-promise');

chai.use(chaiHttp);

//Ensure that chai.request returns promises.
Promise.promisifyAll(chai.request);

describe("Locations tests", (done) => {
   it('responds to /locator/fetch route', (done) => {
      var locations = require('../src/routes/locations');
      var app = testHelper.testServer('/', locations);
      sinon.stub(request, 'get').resolves({routes: 'got here'});
      var payload = {bus_number: 1};
      chai.request(app)
         .post('/fetch')
         .send(payload)
         .then(function (res) {
            done();
            return Promise.resolve(res);
         })
         .catch(function (error) {
            done();
            return Promise.reject(error);
         })
         .then(function (res) {
            return expect(res).to.be.a("object");
         })
         .catch(function (e) {
            console.error(e);
            return assert.isNotOk("NotOk", e);
         });
   });
});
