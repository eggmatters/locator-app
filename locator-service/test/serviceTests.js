var expect     = require('chai').expect,
    assert     = require('chai').assert,
    service    = require("../src/service"),
    sinon      = require('sinon');

var falseResponse = function() {
   return Promise.resolve({
      text: () => Promise.resolve(JSON.stringify({ message: "TEST MESSAGE" }))
   });
};
describe ('Service Application', () => {
   let testService;
   before( () => {
      sinon.stub(global, 'fetch').returns(falseResponse());
      testService = new service(66);
   });

   after( () => {
      global.fetch.restore();
   });

   it('Should fetch json from a request', () => {
      testService.getRoutes().then( (res) => {
         return expect(res).to.not.be.empty;
      });
   });
});
