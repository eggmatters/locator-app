var path    = require('path');
var yaml    = require('js-yaml');
var Promise = require('bluebird');
var fs      = Promise.promisifyAll(require('fs'));


var TestHelper = function () {
   const config = yaml.safeLoad(fs.readFileSync('./config/config.yml', 'utf8'));

   /**
     * Establishes an Express application instance for segregated calls
     * for unit tests. Utilizes config-test.yml as source configuration
     *
     * testServer is configured to establish app routes on a one time basis,
     * Listening on port 3001 and destroys the service after each request.
     *
     * @param {module} endpoint - designated route module
     * @param {string} route - relative url path
     */
    var testServer = function(endpoint, route) {

        var express =    require('express'),
        bodyParser =     require('body-parser'),

        error = function (err, req, res, next) {
            console.log(err);
            res.sendStatus(401);
        };

        var app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended:true}));
        app.use(endpoint, route);
        app.use(error);
        app.set('view engine', 'ejs');
        app.get('/', function(req, res){
            res.render('index');
         });

        app.listen(3001, '127.0.0.1', function () {
            this.close(function() { });
        });

        return app;
    };

    return ({
       testServer: testServer
    })

}();

module.exports = TestHelper;