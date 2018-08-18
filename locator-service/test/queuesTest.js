var expect  = require('chai').expect,
    assert  = require('chai').assert,
    queues  = require('../src/queues'),
    fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis'),
    sinon   = require('sinon');
    Promise = require('bluebird');
    events  = require('events');

var falsePromise = function() {
   return new Promise( function(resolve, reject) {
      resolve({ message: "TEST MESSAGE" });
   });
};

describe ( 'queues module test', () => {
   let testQueue;
   before( () => {
      sinon.stub(redis, 'createClient').returns({});
      testQueue = new queues('syncQueue','messageQueue' );
   });

   it ("Should create a Redis Client", () => {
      expect(testQueue.getClient()).to.be.an('object');
   });

   it ("Should return an Events instance", () => {
      expect(testQueue.getEventHandler()).to.be.an('object');
   });

});

