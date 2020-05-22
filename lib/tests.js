(function() {
  //###########################################################################################################
  // njs_util                  = require 'util'
  var CND, TRM, alert, badge, debug, echo, help, info, log, njs_path, praise, rpr, test, urge, warn, whisper;

  njs_path = require('path');

  // njs_fs                    = require 'fs'
  //...........................................................................................................
  TRM = require('./TRM');

  rpr = TRM.rpr.bind(TRM);

  badge = 'CND/test';

  log = TRM.get_logger('plain', badge);

  info = TRM.get_logger('info', badge);

  whisper = TRM.get_logger('whisper', badge);

  alert = TRM.get_logger('alert', badge);

  debug = TRM.get_logger('debug', badge);

  warn = TRM.get_logger('warn', badge);

  help = TRM.get_logger('help', badge);

  urge = TRM.get_logger('urge', badge);

  praise = TRM.get_logger('praise', badge);

  echo = TRM.echo.bind(TRM);

  //...........................................................................................................
  CND = require('./main');

  test = require('guy-test');

  //-----------------------------------------------------------------------------------------------------------
  this["is_subset"] = function(T) {
    T.eq(false, CND.is_subset(Array.from('abcde'), Array.from('abcd')));
    T.eq(false, CND.is_subset(Array.from('abcx'), Array.from('abcd')));
    T.eq(false, CND.is_subset(Array.from('abcd'), []));
    T.eq(true, CND.is_subset(Array.from('abcd'), Array.from('abcd')));
    T.eq(true, CND.is_subset(Array.from('abc'), Array.from('abcd')));
    T.eq(true, CND.is_subset([], Array.from('abcd')));
    T.eq(true, CND.is_subset([], Array.from([])));
    T.eq(false, CND.is_subset(new Set('abcde'), new Set('abcd')));
    T.eq(false, CND.is_subset(new Set('abcx'), new Set('abcd')));
    T.eq(false, CND.is_subset(new Set('abcx'), new Set()));
    T.eq(true, CND.is_subset(new Set('abcd'), new Set('abcd')));
    T.eq(true, CND.is_subset(new Set('abc'), new Set('abcd')));
    T.eq(true, CND.is_subset(new Set(), new Set('abcd')));
    T.eq(true, CND.is_subset(new Set(), new Set()));
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["deep_copy"] = function(T) {
    /* TAINT set comparison doesn't work */
    var i, len, probe, probes, result;
    probes = [
      [
        'foo',
        42,
        [
          'bar',
          (function() {
            return 'xxx';
          })
        ],
        {
          q: 'Q',
          s: 'S'
        }
      ]
    ];
// probe   = [ 'foo', 42, [ 'bar', ( -> 'xxx' ), ], ( new Set Array.from 'abc' ), ]
// matcher = [ 'foo', 42, [ 'bar', ( -> 'xxx' ), ], ( new Set Array.from 'abc' ), ]
    for (i = 0, len = probes.length; i < len; i++) {
      probe = probes[i];
      result = CND.deep_copy(probe);
      T.eq(result, probe);
      T.ok(result !== probe);
    }
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["logging with timestamps"] = function(T, done) {
    var my_badge, my_help, my_info;
    my_badge = 'BITSNPIECES/test';
    my_info = TRM.get_logger('info', badge);
    my_help = TRM.get_logger('help', badge);
    my_info('helo');
    my_help('world');
    return done();
  };

  //-----------------------------------------------------------------------------------------------------------
  this["path methods"] = function(T, done) {
    T.eq(CND.here_abspath('/foo/bar', '/baz/coo'), '/baz/coo');
    T.eq(CND.cwd_abspath('/foo/bar', '/baz/coo'), '/baz/coo');
    T.eq(CND.here_abspath('/baz/coo'), '/baz/coo');
    T.eq(CND.cwd_abspath('/baz/coo'), '/baz/coo');
    T.eq(CND.here_abspath('/foo/bar', 'baz/coo'), '/foo/bar/baz/coo');
    T.eq(CND.cwd_abspath('/foo/bar', 'baz/coo'), '/foo/bar/baz/coo');
    // T.eq ( CND.here_abspath  'baz/coo'                    ), '/....../cnd/baz/coo'
    // T.eq ( CND.cwd_abspath   'baz/coo'                    ), '/....../cnd/baz/coo'
    // T.eq ( CND.here_abspath  __dirname, 'baz/coo', 'x.js' ), '/....../cnd/lib/baz/coo/x.js'
    return done();
  };

  //-----------------------------------------------------------------------------------------------------------
  this["format_number"] = function(T, done) {
    T.eq(CND.format_number(42), '42');
    T.eq(CND.format_number(42000), '42,000');
    T.eq(CND.format_number(42000.1234), '42,000.123');
    T.eq(CND.format_number(42.1234e6), '42,123,400');
    return done();
  };

  //-----------------------------------------------------------------------------------------------------------
  this["rpr"] = function(T, done) {
    echo(rpr(42));
    echo(rpr(42_000_000_000));
    echo(rpr({
      foo: 'bar',
      bar: [true, null, void 0]
    }));
    info(rpr(42));
    info(rpr(42_000_000_000));
    info(rpr({
      foo: 'bar',
      bar: [true, null, void 0]
    }));
    T.eq(rpr(42), `42`);
    T.eq(rpr(42_000_000_000), `42000000000`);
    /* TAINT should have underscores */    T.eq(rpr({
      foo: 'bar',
      bar: [true, null, void 0]
    }), `{ foo: 'bar', bar: [ true, null, undefined ] }`);
    return done();
  };

  //###########################################################################################################
  if (module.parent == null) {
    test(this, {
      'timeout': 2500
    });
  }

  // test @[ "path methods" ]
// test @[ "rpr" ]

}).call(this);
