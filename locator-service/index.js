var  service = require('./src/service'),
      queues = require('./src/queues'),
      yaml   = require('js-yaml'),
      fs     = require('fs'),
      http   = require('http');


const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8')),
      client = (new queues()).getClient(),
      port = 8080;

const requestHandler = (request, response) => {
   let body = [],
       routeNumber = {};
   request.on('data', (chunk) => {
      body.push(chunk);
   }).on('end', () => {
      body = Buffer.concat(body).toString();
      routeNumber = JSON.parse(body);
      processRequest(routeNumber.route);
   });
   response.end('Publishing to queue.');
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});

function processRequest(routeNumber) {
   const routesQueue = config.redis.routes_queue + routeNumber,
         locationsQueue = config.redis.locations_queue + routeNumber,
         getRoutes = function () {
            return service.getRoutes(routeNumber);
         }.bind(routeNumber);

   var queueManager = new queues(routesQueue, locationsQueue, getRoutes);
   queueManager.synchronizedPublish();
}
