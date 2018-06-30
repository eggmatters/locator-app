var fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis');

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));

var Queues = function() {

   this.client = redis.createClient({
      'scheme': 'tcp',
      'host': config.redis.ip,
      'port': 6379
   });

   function pushQueueMessage(client, messageQueue, message) {
      var messageId = client.incr(messageQueue);
      var payload = {
         'message': message,
         'id': messageId
      };
      client.hmset(messageQueue + ':' + messageId, message);
      client.lpush('queue:' + messageQueue, messageId);
   }

   function fetchMessages(client, messageQueue) {
      var messages = [];
      var messageIds = client.blpop('queue:' + messageQueue, 0) || [];

      messageIds.forEach( (messageId) => {
         messages.push(client.hgetall(messageQueue + ':' + messageId));
      });

      return messages;
   }
};

Queues.prototype = {
   pushQueueMessage: function(messageQueue, message) {
      var messageId = client.incr(messageQueue);
      var payload = {
         'message': message,
         'id': messageId
      };
      this.client.hmset(messageQueue + ':' + messageId, message);
      this.client.lpush('queue:' + messageQueue, messageId);
   },

   fetchMessages: function(messageQueue) {
      var messages = [];
      var messageIds = this.blpop('queue:' + messageQueue, 0) || [];

      messageIds.forEach( (messageId) => {
         messages.push(this.hgetall(messageQueue + ':' + messageId));
      });

   },

   getClient() {
      return this.client;
   }
}

module.exports = Queues;