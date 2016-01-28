/* eslint-disable no-console, func-names, no-unused-vars */
'use strict';

var proxyquire = require('proxyquire').noCallThru();
var test = require('tape');
var sinon = require('sinon');

test('app', function(q) {
  var noop = function noop() {};
  var cls = noop;
  var init = sinon.stub();

  cls.prototype.a = noop;
  cls.prototype.b = noop;
  cls.prototype.c = noop;
  cls.prototype.init = init;

  var createApp = proxyquire('../../', {
    './lib/middleware': cls
  });

  // -----

  q.test('it should have middleware methods and setParams fn', function(t) {
    var app = createApp();
    t.deepEqual(Object.keys(app), ['a', 'b', 'c', 'init', 'setParams']);

    t.end();
  });

  q.test('it should call middleware.init when starting the app', function(t) {
    var app = createApp();
    app();

    t.ok(init.calledOnce);
    t.end();
  });
});
