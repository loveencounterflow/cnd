(function() {
  //!/usr/bin/env node
  'use strict';
  var CND, FS, PATH, alert, badge, bold, cyan, debug, echo, gold, green, grey, help, info, isa_text, log, red, reverse, rpr, stackman, steel, urge, warn, whisper, white, yellow;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'nodexh';

  log = CND.get_logger('plain', badge);

  debug = CND.get_logger('debug', badge);

  info = CND.get_logger('info', badge);

  warn = CND.get_logger('warn', badge);

  alert = CND.get_logger('alert', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  stackman = (require('stackman'))();

  // require                   'longjohn'
  FS = require('fs');

  PATH = require('path');

  ({isa_text, red, green, steel, grey, cyan, bold, gold, reverse, white, yellow, reverse} = CND);

  //###########################################################################################################
  if (module === require.main) {
    (() => {
      return debug('^8733^', process.argv);
    })();
  }

}).call(this);
