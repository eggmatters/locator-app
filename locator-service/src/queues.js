var fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis'),
    events  = require('events');

const config = yaml.load(fs.readFileSync('./config/config.yml', 'utf8'));
class QueueEvents extends events {};

var Queues = function() {

   this.client = redis.createClient({
      socket: {
         host: config.redis.ip,
         port: 6379
      }
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
   this.client.connect().catch((err) => {
     console.log("RedisClient Connect Error:", err);
   });
};

Queues.prototype = {
  /**
   *
   * @returns {RedisClientType}
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
     return this.client.set(syncQueue, message, { EX: timeToLive, NX: true }).then((resp) => {
       console.log("Response from sync queue? (should be 'OK'):", resp);
       self.queueEvents.emit(self.events.sync_queue_set);
     }).catch((err) => {
       console.log("SetSyncQueue Error", err);
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
     return this.client.publish(messageQueue, message).then(() => {
       self.queueEvents.emit(self.events.published_to_queue);
     }).catch((err) => {
       console.log(err);
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
     return this.client.set(messageQueue, message).then(() => {
       self.queueEvents.emit(self.events.data_queue_set);
     }).catch((err) => {
       console.log(err);
     });
   },

   /**
    * [description]
    * @emits this.events.sync_queue_expired
    */
   isQueueExpired: function(queue) {
     var self = this;
     return this.client.exists(queue).then((resp) => {
       if (resp <= 0) {
         self.queueEvents.emit(self.events.sync_queue_expired);
       }
     }).catch(() => {
       self.queueEvents.emit(self.events.sync_queue_expired);
     });
   },

   pushQueueMessage: async function(messageQueue, message) {
      var messageId = await this.client.incr(messageQueue);
      var payload = {
         'message': message,
         'id': messageId.toString()
      };
      await this.client.hSet(messageQueue + ':' + messageId, payload);
      await this.client.lPush('queue:' + messageQueue, messageId.toString());
   },

   fetchMessages: async function(messageQueue) {
      var messages = [];
      var result = await this.client.blPop('queue:' + messageQueue, 0);
      if (result) {
         messages.push(await this.client.hGetAll(messageQueue + ':' + result.element));
      }
      return messages;
   }
};


module.exports = Queues;
