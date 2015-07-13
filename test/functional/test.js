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
});
