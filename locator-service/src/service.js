var request = require('request-promise'),
    fs      = require('fs'),
    yaml    = require('js-yaml'),
    Promise = require('bluebird');

//Promise.promisifyAll(redis.RedisClient.prototype);
//Promise.promisifyAll(redis.Multi.prototype);

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));

var Routes = function() {

   var url = config.api.base + 'routes/';

   function getRoutes(busNumber) {
      appUrl = url + busNumber + '/appID/' + config.api.app_id;
      console.log("Calling: ", appUrl);
      return request.get(appUrl).then(function (response) {
         return response;
      });
   }


   return {
      getRoutes: getRoutes,
   };
}();

module.exports = Routes;