var express = require('express');
var bodyParser = require('body-parser');
var aws = require('./config').aws;
var knox = require('knox');
var knoxClient = knox.createClient({
  key: process.env.ACCESSKEYID,
  secret: process.env.SECRETACCESSKEY,
  bucket: process.env.BUCKET
});
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/', function(req, res) {
  var theKey = Object.keys(req.body)[0];
  var obj = JSON.parse(theKey + req.body[theKey]);
  var img = decodeURIComponent(obj.image);
  var buf = new Buffer(img.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  var key = obj.key;
  var filename = key + '.jpg';
  var request = knoxClient.put(filename, {
    'Content-Length': buf.length,
    'Content-Type':'image/jpeg',
    'Content-Encoding': 'base64'
  });
  request.on('response', function(response) {
    if(response.statusCode === 200) {
      console.log('saved to %s', request.url);
      res.send(request.url);
    } else {
      console.log('error %d', req.statusCode);
      res.send();
    }
  });
  request.end(buf);
});
var server = app.listen(process.env.PORT || 3000, function() {
  console.log('Server running at http://localhost:' + server.address().port);
});
