
var express = require('express');
var routes  = require('./src/routes')
var app     = express();
var port    = 3000;

//Site setup, rendering engine, middleware & routes:
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(routes);

app.get('/', function(req, res){
    res.render('index');
});

app.listen(port, function(){
  console.log('Locator application started on port: ', port);
});