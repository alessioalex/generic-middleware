## general-middleware

Express-like generic middleware that you can use for anything.

[![build status](https://secure.travis-ci.org/alessioalex/generic-middleware.png)](http://travis-ci.org/alessioalex/generic-middleware)

### Example

```js
var middleware = require('generic-middleware');
var http = require('http');
var app = middleware();

app.use(function logRequest(req, res, next) {
  console.log('%s %s', req.method, req.url);

  if (req.url === '/') {
    return setTimeout(function() { next(); }, 5000);
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
```

For more examples checkout the `examples/` folder.

### How does it work?

You attach middleware by using `app.use()`, which has the same signature as Connect middleware (param1, param2, ... callback).
When `app()` is called, its arguments will be remembered and passed onto the middleware functions,
along with a callback that is used to determine when the next middleware should be called.

For more info checkout the tests and examples.

### License

[MIT](http://alessioalex.mit-license.org/)
