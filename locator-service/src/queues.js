var fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis'),
    Promise = require('bluebird');

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));
const minutes = 1000 * 60;

var Queues = function(syncQueue, messageQueue, messageFn) {

   this.syncQueue = syncQueue;
   this.messageQueue = messageQueue;
   this.messageFn = messageFn;
   this.client = redis.createClient({
      'scheme': 'tcp',
      'host': config.redis.ip,
      'port': 6379
   });
};

Queues.prototype = {
   getClient: function() {
      return this.client;
   },

   synchronizedPublish: function() {
      var now = Date.now(),
          fiveMinutes = 5 * minutes,
          lastCalled = this.client.get(this.syncQueue) || now - fiveMinutes;
          timeElapsed = now - lastCalled;

      if (timeElapsed < (5 * minutes)) {
         console.log("done");
         return;
      }
      console.log("Synch Queue");
      this.client.set(this.syncQueue, now);
      this.publishQueueMessage();
      this.asyncPublishQueueRetry()
         .then( function() {
            this.synchonizedPublish();
         }).catch( function (ex) {
            return ex;
         });
   },

   asyncPublishQueueRetry: function() {
      var self = this;
      return new Promise(function(resolve, reject) {
         try {
            setTimeout(
               ( function() {
                  console.log("Async Publish");
                  self.publishQueueMessage();
               }).bind(self),
               5000)
            resolve();
         } catch(ex) {
            reject(ex);
         }
      });
   },

   publishQueueMessage: function() {
      var self = this;
      this.messageFn().then( function (res) {
         self.client.publish(self.messageQueue, JSON.stringify(res));
      });
   },

   pushQueueMessage: function(messageQueue, message) {
      var messageId = this.client.incr(messageQueue);
      var payload = {
         'message': message,
         'id': messageId
      };
      this.client.hmset(messageQueue + ':' + messageId, payload);
      this.client.lpush('queue:' + messageQueue, messageId);
   },

   fetchMessages: function(messageQueue) {
      var messages = [];
      var messageIds = this.blpop('queue:' + messageQueue, 0) || [];

      messageIds.forEach( (messageId) => {
         messages.push(this.hgetall(messageQueue + ':' + messageId));
      });

   },
};


module.exports = Queues;