var fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis');

const config = yaml.load(fs.readFileSync('./config/config.yaml', 'utf8'));

var Queues = function() {

   this.client = redis.createClient({
      socket: {
         host: config.redis.ip,
         port: 6379
      }
   });
   this.client.on("error", function (err) {
     console.log("RedisClient Error:", err);
   });
   this.client.connect().catch((err) => {
     console.log("RedisClient Connect Error:", err);
   });
   this.dataQueue = config.redis.data_queue;
   this.subscribe = config.redis.publish_queue;
};

Queues.prototype = {
  /**
   * [description]
   * @return {string} [description]
   */
   getClient: function() {
      return this.client;
   },
   /**
    * [description]
    * @return {string} [description]
    */
   getDataQueue: function() {
      return this.dataQueue;
   },
   /**
    * [description]
    * @return {string} [description]
    */
   getSubscribeQueue: function() {
     return this.subscribe;
   }
}

module.exports = Queues;
