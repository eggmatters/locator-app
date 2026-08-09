const express = require('express'),
    bodyParser = require('body-parser'),
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

   subscribeClient.subscribe(subscribe, (publish_message, channel) => {
     console.log("Got subsribed publish_message: ", publish_message, channel);
     dataClient.get(data).then((resp) => {
       io.emit('locations', JSON.parse(resp));
     }).catch((err) => {
       console.log("Returned error:", err);
     });
   });

   httpPushRequest({route: routeNumber}).then( (response) => {
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
   //have to be linked to
   var url = 'http://172.18.0.3:8080';

   return fetch(url, {
      method: 'POST',
      headers: {
         'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
   }).then((response) => response.text());
}
