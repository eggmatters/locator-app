var fs      = require('fs'),
    express = require('express'),
    yaml    = require('js-yaml'),
    request = require('request-promise'),
    bodyParser = require('body-parser');

const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));
var locations = express.Router();

locations.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
locations.use(bodyParser.json()); // for parsing application/json

locations.post('/fetch', function (req, resp) {
   var url = config.api.base + 'routes/' + req.body.bus_number + '/appID/' + config.api.app_id;
   request(url).then(function (response) {
      return resp.render('locations', { routes: JSON.stringify(response) });
   });
});

locations.route('/').get(function (req, res) {
   res.render('locations');
});


module.exports = locations;