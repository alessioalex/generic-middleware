/* eslint-disable no-console, func-names, no-unused-vars */
'use strict';

var Middleware = require('../../');
var sinon = require('sinon');
var test = require('tape');

test('functional', function(q) {
  var clock = sinon.useFakeTimers();

  q.test('it should not have race conditions', function(t) {
    var app = Middleware();
    var opts1 = [{
      id: 2,
      timeout: 1000
    }, {
      id: 1,
      timeout: 5000
    }];
    var opts2 = [];

    app.use(function(opts, next) {
      setTimeout(function() {
        next();
      }, opts.timeout);
    });

    app.use(function(opts, next) {
      opts2.push(opts);

      if (opts2.length === 2) {
        t.deepEqual(opts1, opts2);

        clock.restore();
        t.end();
      }
    });

    app(opts1[0]);
    app(opts1[1]);

    clock.tick(6000);
  });

  q.test('it should work properly with #setParams', function(t) {
    var app = Middleware();
    var count = 0;

    app.setParams('foo', 'bar');

    app.use(function errorHandler1(err, e, f, next) {
      count++;
      t.equal(count, 3);
      next(err);
    });

    app.use(function errorHandler2(err, g, h, next) {
      count++;
      t.equal(count, 4);
      t.end();
    });

    app.use(function(a, b, next) {
      count++;
      t.equal(count, 1);
      next();
    });

    app.use(function(c, d, next) {
      count++;
      t.equal(count, 2);
      next(new Error('go to error handler'));
    });

    app(1, 2);
  });
});
