var request    = require('request-promise'),
    expect     = require('chai').expect,
    assert     = require('chai').assert;
    service    = require("../src/service"),
    sinon      = require('sinon'),
    redis      = require('redis');

var falsePromise = function() {
   return new Promise( function(resolve, reject) {
      resolve({ message: "TEST MESSAGE" });
   });
};
describe ('Service Application', () => {
   let testService;
   before( () => {
      sinon.stub(request, 'get').returns(falsePromise());
      testService = new service(66);
   });

   it('Should fetch json from a request', () => {
      testService.getRoutes().then( (res, err) => {
         return expect(res).to.not.be.empty;
      });
   });
});
