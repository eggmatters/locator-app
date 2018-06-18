var request = require('request-promise'),
    fs      = require('fs'),
    yaml    = require('js-yaml');
    redis   = require('redis');
    Promise = require('bluebird');

//Promise.promisifyAll(redis.RedisClient.prototype);
//Promise.promisifyAll(redis.Multi.prototype);

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));

const client = redis.createClient({
   'scheme': 'tcp',
   'host': config.redis.ip,
   'port': 6379
});

var Routes = function() {

   let url = config.api.base + 'routes/';

   function getRoutes(busNumber) {
      url += busNumber + '/appID/' + config.api.app_id;
      return request(url).then(function (response) {
         return response;
      });
   }

   function putQueueItems(queueItems, queueId) {

      client.on("error", function (err) {
         console.log("Error " + err);
      });

      var queueName = config.redis.outgoing_queue;
      var messageId = client.incr('all:' + queueName);
      var message = {
         'id': messageId,
         'message': queueItems
      };
      client.hmset('message-' + queueName + ':' + messageId, message);
      client.lpush('queue:message-' + queueName, messageId);
   }

   function fetchQueueItems() {

   }

   return {
      getRoutes: getRoutes,
      putQueueItems: putQueueItems
   };
}();

module.exports = Routes;