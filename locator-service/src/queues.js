var fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis'),
    events  = require('events');
    Promise = require('bluebird');

class QueueEvents extends events {};
const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));
const minutes = 1000 * 60;

var Queues = function(syncQueue, messageQueue) {

   this.syncQueue = syncQueue;
   this.messageQueue = messageQueue;
   this.client = redis.createClient({
      'scheme': 'tcp',
      'host': config.redis.ip,
      'port': 6379
   });
   this.queueEvents = new QueueEvents();

   this.events = {
      published_to_queue: 'published-to-queue',
      synced_and_published: 'synced-and-published',
      sync_queue_continue: 'sync-queue-continue',
      sync_queue_stop: 'sync-queue-stop',
      sync_queue_error: 'sync-queue-error'
   };
};

Queues.prototype = {
  /**
   *
   * @returns {RedisClient}
   */
   getClient: function() {
      return this.client;
   },
   /**
    *
    * @returns {QueueEvents}
    */
   getEventHandler: function() {
      return this.queueEvents;
   },
   /**
    * @param {string} message
    */
   publishQueueMessage: function(message) {
      this.client.publish(this.messageQueue, message);
      this.queueEvents.emit(this.events.published_to_queue);
   },
   /**
    * @param {string} syncMessage
    * @param {string} publishMessage
    */
   setQueueMessage: function(syncMessage, publishMessage) {
      this.client.set(this.syncQueue, syncMessage);
      this.client.publish(this.messageQueue, publishMessage);
      this.queueEvents.emit(this.events.synced_and_published);
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
