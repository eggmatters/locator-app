var fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis'),
    events  = require('events');
    Promise = require('bluebird');

class QueueEvents extends events {};
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
   this.queueEvents = new QueueEvents();

   this.events = {
      sync_queue_continue: "sync-queue-continue",
      sync_queue_stop: "sync-queue-stop",
      sync_queue_error: "sync-queue-error"
   };
};

Queues.prototype = {
   getClient: function() {
      return this.client;
   },

   getEventHandler: function() {
      return this.queueEvents;
   },

   synchronizedPublish: function(initial) {
      this.getSyncQueue();
      var self = this;
      this.queueEvents.once(this.events.sync_queue_continue, function () {
         if (initial) {
            self.publishQueueMessage();
            console.log("Published initial queue Message");
         }
         self.asyncPublishQueueRetry()
         .then( function(self) {
            self.synchronizedPublish();
         }).catch( function (ex) {
            return ex;
         });
      });
   },

   getSyncQueue: function() {
      var now = Date.now(),
          fiveMinutes = 5 * minutes,
          self = this;
      this.client.get(this.syncQueue, function (err, lastCalled) {
         if (err) {
            console.log(err);
            self.queueEvents.emit(self.events.sync_queue_error, err);
         }
         var timeElapsed = now - lastCalled;

         if (timeElapsed >= fiveMinutes && lastCalled !== null) {
            console.log("emitting stop");
            self.queueEvents.emit(self.events.sync_queue_stop);
         } else {
            self.queueEvents.emit(self.events.sync_queue_continue);
         }
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

   }
};


module.exports = Queues;