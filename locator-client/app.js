
var express = require('express');
var app = express();
var port = 3000;

app.use(express.static('public'));

app.listen(port, function(){
  console.log('hello world');
});

app.get('/', function(req, res){
    res.send('Hello Express');
});