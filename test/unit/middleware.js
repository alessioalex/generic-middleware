'use strict';

var proxyquire = require('proxyquire').noCallThru();
var test = require('tape');
var sinon = require('sinon');
var Middleware = require('../../lib/middleware');
var noop = function() {};

test('middleware', function(q) {
  q.test('it should return a new instance when called without `new`', function(t) {
    var md = Middleware();

    t.ok(md instanceof Middleware);
    t.end();
  });

  q.test('it should assign defaults on instantiation', function(t) {
    var md = Middleware();

    t.deepEqual(md._stack, []);
    t.ok(typeof md._errorHandler === 'function');
    t.end();
  });

  q.test('it should add an error handler when using an error as the first argument', function(t) {
    var Md = proxyquire('../../lib/middleware', {
      'get-parameter-names': function() { return ['err']; }
    });

    var md = new Md();
    md.addErrorHandler = sinon.spy();

    var handleErrors = function(err, foo, bar) { if (err) { /**/ } };
    md.use(handleErrors);

    t.ok(md.addErrorHandler.calledWith(handleErrors));
    t.end();
  });

  q.test('it should add the function to the stack if it does not have an error argument', function(t) {
    var Md = proxyquire('../../lib/middleware', {
      'get-parameter-names': function() { return ['no', 'error', 'here']; }
    });

    var md = new Md();
    var fn = function(foo, bar) {};
    md.use(fn);

    t.deepEqual(md._stack, [fn]);
    t.end();
  });

  q.test('#useAfter(null, fn) should add fn to tail', function(t) {
    var md = new Middleware();
    var first = function(foo, bar) {};
    var last = function(foo, bar) {};
    md.use(first);
    md.useAfter(null, last);

    t.deepEqual(md._stack, [first, last]);
    t.end();
  });

  q.test('#useAfter(afterFn, fn) should add fn ahead of beforeFn', function(t) {
    var md = new Middleware();
    var first = function(foo, bar) {};
    var last = function(foo, bar) {};
    var middle = function(foo, bar) {};
    md.use(first);
    md.use(last);
    md.useAfter(first, middle);

    t.deepEqual(md._stack, [first, middle, last]);
    t.end();
  });

  q.test('#useBefore(null, fn) should add fn to head', function(t) {
    var md = new Middleware();
    var fn = function(foo, bar) {};
    var first = function(foo, bar) {};
    md.use(fn);
    md.useBefore(null, first);

    t.deepEqual(md._stack, [first, fn]);
    t.end();
  });

  q.test('#useBefore(beforeFn, fn) should add fn ahead of beforeFn', function(t) {
    var md = new Middleware();
    var first = function(foo, bar) {};
    var last = function(foo, bar) {};
    var middle = function(foo, bar) {};
    md.use(first);
    md.use(last);
    md.useBefore(last, middle);

    t.deepEqual(md._stack, [first, middle, last]);
    t.end();
  });

  q.test('it should add the error handler', function(t) {
    var md = new Middleware();
    md.addErrorHandler(noop);

    t.equal(md._errorHandler, noop);
    t.end();
  });

  q.test('it should invoke handle on init', function(t) {
    var md = new Middleware();
    var handle = sinon.stub();

    md._handle = handle;
    md.init();

    t.ok(handle.calledOnce);
    t.end();
  });

  q.test('it should call the error handler', function(t) {
    var md = new Middleware();
    var err = new Error('oh noes');
    var handleErrors = sinon.spy();
    var args = ['foo', 'bar'];

    md._errorHandler = handleErrors;

    md._handle(err, 0, args);
    t.ok(handleErrors.calledWith(err, args[0], args[1]));

    t.end();
  });

  q.test('it should call the next function in the stack', function(t) {
    var md = new Middleware();
    var callStackFn = sinon.spy();
    var index = 1;
    var args = ['foo', 'bar'];

    md._stack = [noop, noop, noop];
    md._callStackFn = callStackFn;

    md._handle(null, index, args);
    var calledWith = callStackFn.args[0];
    // handle pushes a callback function alongside the regular args
    var mdArgs = calledWith[1].slice(0, calledWith[1].length - 1);

    t.equal(calledWith[0], index);
    t.deepEqual(mdArgs, args);

    t.end();
  });

  q.test('it should stop after the last fn in the stack', function(t) {
    var md = new Middleware();
    var fn1 = sinon.stub();
    var fn2 = sinon.stub();
    var args = ['foo', 'bar'];

    // mocking an array object with a bad length, for testing purposes
    md._stack = {
      '0': noop,
      '1': fn1,
      '2': fn2,
      length: 2
    };

    md._callStackFn(1, args);
    md._callStackFn(2, args);

    t.ok(fn1.calledOnce);
    t.ok(!fn2.calledOnce);

    t.end();
  });
});
