## generic-middleware

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


### API


#### Middleware()

- @constructor

Exported by "generic-middleware" module


#### Middleware#use(fn)

- @param {`Function`} fn - function to inject into the stack


#### Middleware#useAfter(after, fn)

- @param {`Function`?} [after] - function in the stack to follow (if null, add to the tail)
- @param {`Function`} fn - function to inject into the stack


#### Middleware#useBefore(before, fn)

- @param {`Function`?} [before] - function in the stack to precede (if null, add to the head)
- @param {`Function`} fn - function to inject into the stack


### License

[MIT](http://alessioalex.mit-license.org/)
