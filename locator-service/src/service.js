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
 * @returns {BusFinderService}
 */
BusFinderService = function(route) {
   this.route = route;
   this.syncQueue = config.redis.routes_queue + route;
   this.routesQueue = config.redis.locations_queue + route;
   this.queues = new queues(this.syncQueue, this.routesQueue);
   console.log("queues are: ", this.syncQueue, this.routesQueue)
};


BusFinderService.prototype = {
  initiateQueuesWithRetry: function(timeToLive, retryTimeout) {
     if (this.isRouteSet()) {
       console.log("no queues. queues are done");
       return;
     }
     console.log("Doing the thing");
     this.setRouteSyncQueue(Date.now(), timeToLive);
     this.publishAndSetQueue();
     var self = this;

     while(this.isRouteSet()) {
       try {
         setTimeout(( function() {
            console.log("IN TIMEOUT");
            self.publishQueueMessage();
            resolve(self);
         }).bind(self),
         retryTimeout);
       } catch(ex) {
          console.log("Error handling request:", ex);
       }
     }
     console.log("Done doing this thing. :(");
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
    * Sets a route with supplied message & expiration (ttl)
    * @param  {String} message
    * @param  {integer} ttl     [description]
    * @return {string|Boolean}         [description]
    */
   setRouteSyncQueue: function(message, ttl) {
     var meh = this.queues.getClient().set(this.syncQueue, message, 'EX', ttl, 'NX');
     console.log("Set returns:", meh);
     var resp = this.queues.getClient().get(this.syncQueue);
     console.log("Shoulda set the thing:", resp);
   },

   publishAndSetQueue: function() {
     var self = this;
     this.getRoutes().then( function(resolve, reject) {
       if (reject) {
         console.log("Received error from API call: ", reject);
         return;
       }
       var message = (typeof resolve === 'string') ? resolve : JSON.stringify(resolve);
       self.queues.setQueueMessage(message, message);
     });
   },
   /**
    * [description]
    * @return {Boolean} [description]
    */
   isRouteSet: function() {
     var dbg = this.queues.getClient();
     console.log("SYNCQUEREFS:", dbg.object('refcount', this.syncQueue));
     console.log("ROUTESQUEUE:", dbg.object('refcount', this.routesQueue));
     return this.queues.getClient().exists(this.syncQueue) > 0;
   },

   queueDebug: function() {
     var queueEventHandler = this.queues.getEventHandler();
     var queueEvents = this.queues.events;
     queueEventHandler.on(queueEvents.synced_and_published, () => {
       console.log("QueueEvent Synced and published");
     });
     queueEventHandler.on(queueEvents.published_to_queue, () => {
       console.log("published to queue");
     });

   }
};

module.exports = BusFinderService;
