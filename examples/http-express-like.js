"use strict";

var middleware = require('../index');
var http = require('http');
var app = middleware();

app.use(function logRequest(req, res, next) {
  console.log('%s %s', req.method, req.url);

  if (req.url === '/') {
    return next();
  }

  next(new Error('Page Not Found'));
});

app.use(function stringifyHeaders(req, res, next) {
  res.end(JSON.stringify(req.headers, null, 2));
});

app.use(function handlerErrors(err, req, res) {
  if (/not found/ig.test(err.message)) {
    res.statusCode = 404;
    res.end('Page ' + req.url + ' was not found.');
  } else {
    res.statusCode = 500;
    res.end('something bad happened');
  }
});

http.createServer(app).listen(7777);
console.log('now visit http://localhost:7777');
