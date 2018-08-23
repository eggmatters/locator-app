var  service = require('./src/service'),
      yaml   = require('js-yaml'),
      fs     = require('fs'),
      http   = require('http'),
      Promise = require('bluebird');

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8')),
      //client = (new queues()).getClient(),
      port = 8080,
      timeToLive = 300,
      retryTimeout = 5000;

const requestHandler = (request, response) => {
   let body = [],
       routeNumber = {};
   request.on('data', (chunk) => {
     body.push(chunk);
   }).on('end', () => {
      body = Buffer.concat(body).toString();
      var routeNumber = JSON.parse(body),
          routesService = new service(routeNumber.route),
          routesServiceQueues = routesService.getQueues();
      routesService.queueDebug();
      routesService.initiateQueuesWithRetry(60, 5000);
      routesServiceQueues.getEventHandler().on(routesServiceQueues.getEvents().sync_queue_set, () => {
        routesServiceQueues.getClient().get(config.redis.data_queue, function (err, resp) {
          console.log("Sending:", resp);
          response.end(resp);
        });
      });
   });
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});

function processRequest(routeNumber) {

};


processRequest(76);
