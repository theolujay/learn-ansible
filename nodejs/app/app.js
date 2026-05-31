import express from 'express';
var app = express();

app.get('/', function(req, res){
    res.send('Hello World!');
});

app.listen(80);
console.log('Expres server started successfully');