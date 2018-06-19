var testHelper = require('./testHelper'),
    Promise    = require('bluebird'),
    chai       = require('chai'),
    chaiHttp   = require('chai-http'),
    assert     = require('chai').assert,
    expect     = require('chai').expect,
    should     = require('chai').should;
    sinon      = require('sinon');

chai.use(chaiHttp);

//Ensure that chai.request returns promises.
Promise.promisifyAll(chai.request);
function doSomething() {

}

describe("Locations tests", () => {
   it ('responds to / route', (done) => {
      var index = require('../src/routes/index');
      var app = testHelper.testServer('/', index);
      chai.request(app)
          .get('/')
          .end(function (err, res) {
              expect(res).to.have.status(200);
              done();
          });
  });
});
