const express = require('express'),
    bodyParser = require('body-parser'),
    Queues  = require('../queues'),
    session = require('../session');

var locations = express.Router();

locations.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
locations.use(bodyParser.json()); // for parsing application/json

// Shared, process-wide redis connections. Subscribing per-request opened a
// new connection and a new subscription every time the same route was
// requested; these are created once and reused for every request instead.
var subscribeQueue = new Queues();
var dataQueue = new Queues();
var subscribeClient = subscribeQueue.getClient();
var dataClient = dataQueue.getClient();

// Routes that already have an active redis subscription. Guarantees only
// one subscription (and therefore one queue message per publish) exists
// for a given route, no matter how many requests/sessions ask for it.
var subscribedRoutes = new Set();

// sessionId -> Set of routes that session has already triggered a
// subscription attempt for, so repeat requests from the same session are
// a no-op instead of re-running the subscribe logic.
var sessionRouteSubscriptions = new Map();

/**
 * Ensures exactly one redis subscription exists for the given route.
 * On each published message, emits the route's current data only to
 * sockets that joined that route's room (see app.js), instead of
 * broadcasting to every connected client.
 */
function ensureRouteSubscription(routeNumber, io) {
  if (subscribedRoutes.has(routeNumber)) {
    return;
  }
  subscribedRoutes.add(routeNumber);

  var data = dataQueue.getDataQueue() + routeNumber,
      subscribe = subscribeQueue.getSubscribeQueue() + routeNumber;

  subscribeClient.subscribe(subscribe, (publish_message, channel) => {
    console.log("Got subsribed publish_message: ", publish_message, channel);
    dataClient.get(data).then((resp) => {
      io.to(routeNumber).emit('locations', JSON.parse(resp));
    }).catch((err) => {
      console.log("Returned error:", err);
    });
  }).catch((err) => {
    subscribedRoutes.delete(routeNumber);
    console.log("Subscribe error:", err);
  });
}

locations.post('/fetch', (req, resp) => {
  var routeNumber = String(req.body.bus_number),
      io = resp.io,
      sessionId = session.getOrCreateSessionId(req, resp);

  var sessionRoutes = sessionRouteSubscriptions.get(sessionId);
  if (!sessionRoutes) {
    sessionRoutes = new Set();
    sessionRouteSubscriptions.set(sessionId, sessionRoutes);
  }
  if (!sessionRoutes.has(routeNumber)) {
    sessionRoutes.add(routeNumber);
    ensureRouteSubscription(routeNumber, io);
  }

  httpPushRequest({route: routeNumber}).then( (response) => {
    return resp.render('locations', { routes: response, routeNumber: routeNumber, sessionId: sessionId });
  }).catch(function (err) {
     console.log(err);
     return resp.render('locations', { routes: "\"nodata\"", routeNumber: routeNumber, sessionId: sessionId });
  });
});


locations.route('/').get(function (req, res) {
   res.render('locations');
});

module.exports = locations;

function httpPushRequest(payload) {
   var url = 'http://locator-service:8080';

   return fetch(url, {
      method: 'POST',
      headers: {
         'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
   }).then((response) => response.text());
}
