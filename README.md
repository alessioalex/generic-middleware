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

// error handler auto-detection
// must use the same arguments as previous middleware and `err`
app.use(function handlerErrors(err, req, res, next) {
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

#### Middleware#setParams(..args)

- @param {`..String`|`[String]`} - either specify the params directly as function arguments or pass in an array (of strings)

### How does it work?

You attach middleware by using `app.use()`, which has the same signature as Connect middleware (param1, param2, ... callback).
When `app()` is called, its arguments will be remembered and passed onto the middleware functions,
along with a callback that is used to determine when the next middleware should be called.

The error handling logic looks at the number of function parameters used by `app.use()` to compare the
newly added function to the 1st one added to the stack, and if the number of params if higher then it must be
an error handler (think of `app.use(function(a, b, c) { /*...*/ })` vs `app.use(function(err, a, b, c) { /*...*/ })`).
What that means if that you shouldn't omit params even if you don't use them.

For more info checkout the tests and examples.

### FAQ

- When should I use `.useAfter()` or `.useBefore()`?

When you are releasing an app to be used by others and make some middleware publically accessible,
so that others can hook their custom stuff before and after a specific middleware function from your stack.

- My error handler is not being called, why is that?

Make sure you are defining the error handling function with the same arguments as the regular middleware plus the error param (as the 1st one).

- Can I use this module on the frontend as well?

Sure thing, it's really lightweight and has no external dependencies so far either.

### License

[MIT](http://alessioalex.mit-license.org/)
