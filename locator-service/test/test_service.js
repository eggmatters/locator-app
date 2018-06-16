var expect     = require('chai').expect,
    assert     = require('chai').assert;
    service    = require("../src/service");

describe ('Service Application', () => {
   it('Should fetch json from a request', () => {
      service.getRoutes(76).then( (res, err) => {
         return expect(res).to.not.be.empty;
      });
   });
});
