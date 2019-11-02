
var express = require('express'),
    routes  = require('./src/routes'),
    app     = express(),
    http    = require('http').Server(app),
    io      = require('socket.io')(http);

var port    = 3000;

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
