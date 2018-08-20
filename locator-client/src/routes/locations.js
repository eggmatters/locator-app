var fs      = require('fs'),
    express = require('express'),
    yaml    = require('js-yaml'),
    bodyParser = require('body-parser'),
    request = require('request-promise'),
    Queues  = require('../queues');

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));
const queue = new Queues();
var queueClient = queue.getClient();
var locations = express.Router();

locations.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
locations.use(bodyParser.json()); // for parsing application/json

locations.post('/fetch', function (req, resp) {
   var routeNumber = req.body.bus_number,
       locationsQueue = config.redis.locations_queue + routeNumber,
       io = resp.io;


   queueClient.on("message", function(channel, message) {
      io.emit('locations', JSON.parse(message));
   });

   queueClient.subscribe(locationsQueue);
   httpPushRequest({route: routeNumber});
   return resp.render('locations', { routes: "\"nodata\"" });
});


locations.route('/').get(function (req, res) {
   res.render('locations');
});

module.exports = locations;

function httpPushRequest(payload) {
   //have to be linked
   var url = 'http://172.21.0.3:8080';

   request({
      method: 'POST',
      url: url,
      header: {
         'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
   }).then(function () {

   }).catch(function (err) {
      console.log(err);
      //return resp.render('locations', { routes: "\"nodata\"" });
   });
}

function fetchQueueData() {

}
