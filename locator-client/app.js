
var express = require('express'),
    routes  = require('./src/routes'),
    app     = express(),
    http    = require('http').Server(app),
    io      = require('socket.io')(http);

var port    = 3000;

// Join each socket to a room named after the route it's displaying, so
// 'locations' updates only reach clients watching that specific route
// instead of being broadcast to every connected client.
io.on('connection', function(socket) {
   var route = socket.handshake.query.route;
   if (route) {
      socket.join(route);
   }
});

//Site setup, rendering engine, middleware & routes:
app.use(express.static('public'));
//Expose io via middleware (?)
app.use(function(req, resp, next) {
   resp.io = io;
   next();
});
app.set('view engine', 'ejs');
app.use(routes);

app.get('/', function(req, res){
    res.render('index');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
