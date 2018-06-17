var express = require('express');
var app = express();

var locations = express.Router();

locations.route('/render').post(function (req, res) {
   console.log("Got here");
   res.redirect('index');
});

locations.route('/').get(function (req, res) {
   res.render('locations');
});

module.exports = locations;