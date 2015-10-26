/* eslint-disable no-console, func-names, no-unused-vars */
'use strict';

var middleware = require('../index');
var http = require('http');
var app = middleware();

app.use(function logRequest(req, res, next) {
  console.log('%s %s', req.method, req.url);

  if (req.url === '/') {
    // simulate async operation, such as reading from the db
    return setTimeout(function() {
      next();
    }, 1500);
  }

  next(new Error('Page Not Found'));
});

app.use(function stringifyHeaders(req, res, next) {
  res.end(JSON.stringify(req.headers, null, 2));
});

app.use(function handlerError(err, req, res, next) {
  if (/not found/ig.test(err.message)) {
    res.statusCode = 404;
    res.end('Page ' + req.url + ' was not found.');
  } else {
    res.statusCode = 500;
    res.end('something bad happened');
  }

  // support for multiple error handlers -> go on to the next one
  err.statusCode = res.statusCode;
  err.url = req.url;

  next(err);
});

app.use(function logError(err, req, res, next) {
  var errMsg = 'Error: %s | Status code %s | URL: %s';

  console.log(errMsg, err.message, err.statusCode, err.url);
});

http.createServer(app).listen(7777);
console.log('now visit http://localhost:7777');
