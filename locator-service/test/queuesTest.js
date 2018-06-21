var expect  = require('chai').expect,
    assert  = require('chai').assert,
    queues  = require('../src/queues'),
    fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis'),
    sinon   = require('sinon');


describe ( 'queues module test', () => {
   it ("Should create a Redis Client", () => {
      sinon.stub(redis, 'createClient').returns({});
      expect(queues.getClient()).to.be.an('object');
   });
});
