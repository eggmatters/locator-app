var fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis'),
    Promise = require('bluebird');

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));

var Queues = function() {

   this.client = redis.createClient({
      'scheme': 'tcp',
      'host': config.redis.ip,
      'port': 6379
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
