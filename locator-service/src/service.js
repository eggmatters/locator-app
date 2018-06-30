var request = require('request-promise'),
    fs      = require('fs'),
    yaml    = require('js-yaml');
    redis   = require('redis');
    Promise = require('bluebird');

//Promise.promisifyAll(redis.RedisClient.prototype);
//Promise.promisifyAll(redis.Multi.prototype);

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));

var Routes = function() {

   let url = config.api.base + 'routes/';

   function getRoutes(busNumber) {
      url += busNumber + '/appID/' + config.api.app_id;
      return request.get(url).then(function (response) {
         return response;
      });
   }


   return {
      getRoutes: getRoutes,
   };
}();

module.exports = Routes;