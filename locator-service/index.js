var routes = require('./src/service'),
    queues = require('./src/queues'),
    yaml   = require('js-yaml'),
    fs     = require('fs');
    http   = require('http');


const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));
const client = (new queues()).getClient();

const port = 8080;

const requestHandler = (request, response) => {
   let body = [];
   request.on('data', (chunk) => {
      console.log(chunk.toString());
      body.push(chunk);
   }).on('end', () => {
      //body = Buffer.concat(body).toString();
      console.log(body);
      client.publish(config.redis.locations_queue, "Message is: GOT HERE");
      // at this point, `body` has the entire request body stored in it as a string
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


