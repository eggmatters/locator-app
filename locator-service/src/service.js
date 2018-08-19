var request = require('request-promise'),
    fs      = require('fs'),
    yaml    = require('js-yaml'),
    queues  = require('../src/queues'),
    Promise = require('bluebird');

//Promise.promisifyAll(redis.RedisClient.prototype);
//Promise.promisifyAll(redis.Multi.prototype);

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));
const url = config.api.base + 'routes/';

/**
 * Calls api to retrieve routes and puts data on queues.
 *
 * @param {string} route
 */
BusFinderService = function(route) {
   this.route = route;
   this.syncQueue = config.redis.routes_queue + route;
   this.routesQueue = config.redis.locations_queue + route;
   this.queues = new queues();
   this.queueEvents = this.queues.getEvents();
   this.queueEventHandler = this.queues.getEventHandler();
};


BusFinderService.prototype = {
  initiateQueuesWithRetry: function(timeToLive, retryTimeout) {
     let routeHandler;
     this.sendMessage(this.syncQueue, timeToLive);
     this.queueEventHandler.on(this.queueEvents.sync_queue_set, () => {
       routeHandler = this.publishRoutesQueue(retryTimeout);
     });
     this.queueEventHandler.on(this.queueEvents.sync_queue_expired, () => {
       console.log("Clearing publish queue");
       clearInterval(routeHandler);
     })
  },

  publishRoutesQueue: function(retryTimeout) {
    var self = this;
    var routesPublish = setInterval( function() {
       console.log("IN TIMEOUT");
       self.queues.isQueuExpiredSet(self.syncQueue);
       self.sendMessage(self.routesQueue);
    }, retryTimeout);
    return routesPublish;
  },
	/**
    * makes an API call to fetch the routes.
    * @returns {Promise}
    */
   getRoutes: function() {
      var appUrl = url + this.route + '/appID/' + config.api.app_id;
      var rv = request.get(appUrl);
      return rv;
   },

   /**
    * [description]
    * @param  {string} queue               [description]
    * @param  {routeNumber} [timeToLive=false;] [description]
    */
   sendMessage: function(queue, timeToLive = false) {
     var self = this;
     this.getRoutes().then( function(resolve, reject) {
       if (reject) {
         console.log("Received error from API call: ", reject);
         return;
       }
       var message = (typeof resolve === 'string') ? resolve : JSON.stringify(resolve);
       if (timeToLive) {
         self.queues.setSyncQueue(self.syncQueue, message, timeToLive);
         return;
       }
       self.queues.publishQueueMessage(self.routesQueue, message);
     });
   },


   queueDebug: function() {
     this.queueEventHandler.on(this.queueEvents.sync_queue_expired, () => {
       console.log("queue expired");
     });
     this.queueEventHandler.on(this.queueEvents.sync_queue_set, () => {
       console.log("sync queue is now set");
     });
     this.queueEventHandler.on(this.queueEvents.published_to_queue, () => {
       console.log("published to the queue");
     });

   }
};

module.exports = BusFinderService;
