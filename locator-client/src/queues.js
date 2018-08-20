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
   this.syncQueue = config.redis.routes_queue;
   this.routesQueue = config.redis.locations_queue;
};

Queues.prototype = {
   getClient() {
      return this.client;
   }
}

module.exports = Queues;
