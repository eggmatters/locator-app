var  service = require('./src/service'),
      yaml   = require('js-yaml'),
      fs     = require('fs'),
      http   = require('http'),
      Promise = require('bluebird');

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8')),
      //client = (new queues()).getClient(),
      port = 8080,
      timeToLive = 300, //seconds for REDIS expiry
      retryTimeout = 5000; //millis for setInterval()

const requestHandler = (request, response) => {
   let body = [],
       routeNumber = {};
   request.on('data', (chunk) => {
     console.log("Got here!B");
     body.push(chunk);
   }).on('end', () => {
    try {
      body = Buffer.concat(body).toString();
      var routeNumber = JSON.parse(body),
          routesService = new service(routeNumber.route),
          routesServiceQueues = routesService.getQueues();
      routesService.queueDebug();
      routesService.initiateQueuesWithRetry(timeToLive, retryTimeout);
      routesServiceQueues.getEventHandler().on(routesServiceQueues.getEvents().data_queue_set, () => {
        routesServiceQueues.getClient().get(config.redis.data_queue + routeNumber.route, function (err, resp) {
          response.end(resp);
        });
      });
    } catch (e) {
      console.log(e);
      response.end();
    }
   });
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening locally on ${port}`);
});
