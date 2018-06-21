var fs      = require('fs'),
    yaml    = require('js-yaml'),
    redis   = require('redis'),
    Promise = require('bluebird');

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));

var Queues = function() {

   function getRedisClient() {
      return redis.createClient({
         'scheme': 'tcp',
         'host': config.redis.ip,
         'port': 6379
      });
   }

   return {
      getClient: getRedisClient
   }
}();

module.exports = Queues;