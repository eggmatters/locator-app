var routes = require('./src/service');

console.log("Starting locator-service");
routes.getRoutes('76').then( (res, err) => {
   console.log("Putting queue items");
   routes.putQueueItems(res);
});