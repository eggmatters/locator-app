var fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis'),
    Promise = require('bluebird');

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));
const minutes = 1000 * 30;

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
          lastCalled = this.client.get(this.syncQueue);
      console.log("LastCalled: ", lastCalled);
      console.log("now: ", now);
      console.log("timeElapsed: ", now - lastCalled);
      timeElapsed = (lastCalled) ? now - lastCalled : 1;
      this.client.get(this.syncQueue, function (err, reply) {
         console.log("APITA NOW");
         console.log(reply);
      });
      console.log("Synch Queue ", (timeElapsed));
      if (timeElapsed > minutes) {
         console.log("done");
         return;
      }

      this.client.set(this.syncQueue, now);
      this.publishQueueMessage();
      this.asyncPublishQueueRetry()
         .then( function(self) {
            self.synchronizedPublish();
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
                  self.publishQueueMessage();
                  resolve(self);
               }).bind(self),
               5000);
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