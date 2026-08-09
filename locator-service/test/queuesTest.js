var expect  = require('chai').expect,
    assert  = require('chai').assert,
    queues  = require('../src/queues'),
    redis   = require('redis'),
    sinon   = require('sinon');

describe ( 'queues module test', () => {
   let testQueue;
   before( () => {
      sinon.stub(redis, 'createClient').returns({
         on: () => {},
         connect: () => Promise.resolve()
      });
      testQueue = new queues('syncQueue','messageQueue' );
   });

   after( () => {
      redis.createClient.restore();
   });

   it ("Should create a Redis Client", () => {
      expect(testQueue.getClient()).to.be.an('object');
   });

   it ("Should return an Events instance", () => {
      expect(testQueue.getEventHandler()).to.be.an('object');
   });

});
