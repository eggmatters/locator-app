var fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis'),
    events  = require('events');
    Promise = require('bluebird');

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));
class QueueEvents extends events {};

var Queues = function() {

   this.client = redis.createClient({
      'scheme': 'tcp',
      'host': config.redis.ip,
      'port': 6379
   });
   this.queueEvents = new QueueEvents();

   this.events = {
      published_to_queue: 'published-to-queue',
      data_queue_set: 'data-queue-set',
      sync_queue_set: 'sync-queue-set',
      sync_queue_expired: 'sync-queue-expired',
      sync_queue_error: 'sync-queue-error'
   };
   this.client.on("error", function (err) {
     console.log("RedisClient Error:", err);
   });
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
    * Returns events object keyvalue pairs
    * @returns {Object}
    */
   getEvents: function() {
     return this.events
   },
   /**
    * Sets a route with supplied message & expiration (ttl)
    * @param  {String} message
    * @param  {integer} timeToLive     [description]
    * @return {string|Boolean}         [description]
    */
   setSyncQueue: function(syncQueue, message, timeToLive) {
     var self = this;
     this.client.set(syncQueue, message, 'EX', timeToLive, 'NX', (err, resp) => {
       if (err) {
         console.log("SetSyncQueue Error", err);
         return;
       }
       console.log("Response from sync queue? (should be 'OK'):", resp);
       self.queueEvents.emit(self.events.sync_queue_set);
     });
   },
   /**
    * wraps a call to redis PUBLISH
    * @see https://redis.io/commands/publish
    *
    * @emits this.events.published_to_queue
    *
    * @param  {string} messageQueue [description]
    * @param  {string} message      [description]
    */
   publishQueueMessage: function(messageQueue, message) {
     var self = this;
     return new Promise(function(resolve, reject) {
       self.client.publish(messageQueue, message, (err, resp) => {
         if (err) {
           console.log(err);
           reject(err);
         }
         self.queueEvents.emit(self.events.published_to_queue);
         resolve();
       });
     });
   },

   /**
    * Sets message data on queue
    * @param  {string} messageQueue [description]
    * @param  {string} message      [description]
    * @emits this.events.data_queue_set
    * @return {Promise}
    */
   setQueueData: function(messageQueue, message) {
     var self = this;
     return new Promise(function (resolve, reject) {
       self.client.set(messageQueue, message, (err, resp) => {
         if (err) {
           console.log(err);
           reject(err);
         }
         self.queueEvents.emit(self.events.data_queue_set);
         resolve();
       });
     });
   },

   /**
    * [description]
    * @emits this.events.sync_queue_expired
    */
   isQueueExpired: function(queue) {
     var self = this;
     this.client.exists(queue, (err, resp) => {
       if (err || resp <= 0) {
         self.queueEvents.emit(self.events.sync_queue_expired);
       }
     })
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
