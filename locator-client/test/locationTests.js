var testHelper = require('./testHelper'),
    chai       = require('chai'),
    chaiHttp   = require('chai-http'),
    assert     = require('chai').assert,
    expect     = require('chai').expect,
    should     = require('chai').should,
    sinon      = require('sinon');

chai.use(chaiHttp);

describe("Locations tests", (done) => {
   it('responds to /locator/fetch route', (done) => {
      var locations = require('../src/routes/locations');
      var app = testHelper.testServer('/', locations);
      sinon.stub(global, 'fetch').resolves({
         text: () => Promise.resolve(JSON.stringify({ routes: 'got here' }))
      });
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
         })
         .finally(function () {
            global.fetch.restore();
         });
   });
});
