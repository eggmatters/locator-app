const express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request-promise'),
    Queues  = require('../queues');

var locations = express.Router();

locations.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
locations.use(bodyParser.json()); // for parsing application/json

locations.post('/fetch', (req, resp) => {
  const subscribeQueue = new Queues();
  const dataQueue = new Queues();
  var subscribeClient = subscribeQueue.getClient();
  var dataClient = dataQueue.getClient();
   var routeNumber = req.body.bus_number,
       data = dataQueue.getDataQueue() + routeNumber,
       subscribe = subscribeQueue.getSubscribeQueue() + routeNumber,
       io = resp.io;
   console.log("Data queue set", data);
   subscribeClient.on("message", (channel, publish_message) => {
     console.log("Got subsribed publish_message: ", publish_message, channel);
      dataClient.get(data, function(err, resp) {
        if (err) {
          console.log("Err fetched from the thing:", err);
          return;
        }
        console.log("Got subsribed data:", resp);
        io.emit('locations', JSON.parse(resp));
      });

   });

   subscribeClient.subscribe(subscribe);
   httpPushRequest({route: routeNumber}).then( (response) => {
     console.log("Got response:", response);
     return resp.render('locations', { routes: response });
   }).catch(function (err) {
      console.log(err);
      return resp.render('locations', { routes: "\"nodata\"" });
   });
});


locations.route('/').get(function (req, res) {
   res.render('locations');
});

module.exports = locations;

function httpPushRequest(payload) {
   //have to be linked
   var url = 'http://172.21.0.3:8080';

   return request({
      method: 'POST',
      url: url,
      header: {
         'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
   });
}
