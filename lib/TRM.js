(function() {
  //###########################################################################################################
  var _inspect, badge, color_code, color_name, effect_name, effect_names, effect_off, effect_on, get_timestamp, inspect_settings, isa_text, lines_from_stdout, rainbow_color_names, rainbow_idx, ref, rpr, rpr_settings, σ_cnd;

  this.constants = require('./TRM-CONSTANTS');

  this.separator = ' ';

  this.depth_of_inspect = 20;

  badge = 'TRM';

  this.ANSI = require('./TRM-VT100-ANALYZER');

  σ_cnd = Symbol.for('cnd');

  _inspect = (require('util')).inspect;

  isa_text = function(x) {
    return (typeof x) === 'string';
  };

  //-----------------------------------------------------------------------------------------------------------
  rpr_settings = {
    depth: 2e308,
    maxArrayLength: 2e308,
    breakLength: 2e308,
    compact: true,
    colors: false
  };

  this.rpr = rpr = function(...P) {
    var x;
    return ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = P.length; i < len; i++) {
        x = P[i];
        results.push(_inspect(x, rpr_settings));
      }
      return results;
    })()).join(' ');
  };

  //-----------------------------------------------------------------------------------------------------------
  inspect_settings = {
    depth: 2e308,
    maxArrayLength: 2e308,
    breakLength: 2e308,
    compact: false,
    colors: true
  };

  this.inspect = function(...P) {
    var x;
    return ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = P.length; i < len; i++) {
        x = P[i];
        results.push(_inspect(x, inspect_settings));
      }
      return results;
    })()).join(' ');
  };

  //-----------------------------------------------------------------------------------------------------------
  this.get_output_method = function(target, options) {
    return (...P) => {
      return target.write(this.pen(...P));
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  this.pen = function(...P) {
    /* Given any number of arguments, return a text representing the arguments as seen fit for output
     commands like `log`, `echo`, and the colors. */
    return (this._pen(...P)).concat('\n');
  };

  //-----------------------------------------------------------------------------------------------------------
  this._pen = function(...P) {
    /* ... */
    var R, p;
    R = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = P.length; i < len; i++) {
        p = P[i];
        results.push(isa_text(p) ? p : this.rpr(p));
      }
      return results;
    }).call(this);
    return R.join(this.separator);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.log = this.get_output_method(process.stderr);

  this.echo = this.get_output_method(process.stdout);

  //===========================================================================================================
  // KEY CAPTURING
  //-----------------------------------------------------------------------------------------------------------
  this.listen_to_keys = function(handler) {
    var R, help, last_key_was_ctrl_c;
    if (handler.__TRM__listen_to_keys__is_registered) {
      /* thx to http://stackoverflow.com/a/12506613/256361 */
      //.........................................................................................................
      /* try not to bind handler to same handler more than once: */
      return null;
    }
    Object.defineProperty(handler, '__TRM__listen_to_keys__is_registered', {
      value: true,
      enumerable: false
    });
    help = this.get_logger('help', badge);
    last_key_was_ctrl_c = false;
    R = process.openStdin();
    R.setRawMode(true);
    R.setEncoding('utf-8');
    R.resume();
    //.........................................................................................................
    R.on('data', (key) => {
      var response;
      response = handler(key);
      if (key === '\u0003') {
        if (last_key_was_ctrl_c) {
          process.exit();
        }
        last_key_was_ctrl_c = true;
        return help("press ctrl-C again to exit");
      } else {
        return last_key_was_ctrl_c = false;
      }
    });
    //.........................................................................................................
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.ask = function(prompt, handler) {
    /* https://github.com/Jarred-Sumner/bun v0.1.2 will try to resolve statically `require()` calls inside of
     functions and fail for `readline`; putting the module name in a variable makes it skip that step: */
    var hide_for_bun, rl;
    hide_for_bun = 'readline';
    rl = (require(hide_for_bun)).createInterface({
      input: process.stdin,
      output: process.stdout
    });
    if (!/\s+$/.test(prompt)) {
      //.........................................................................................................
      prompt += ' ';
    }
    return rl.question(this.cyan(prompt), function(answer) {
      rl.close();
      return handler(null, answer);
    });
  };

  // #===========================================================================================================
  // # SHELL COMMANDS
  // #-----------------------------------------------------------------------------------------------------------
  // @execute = ( command, handler ) ->
  //   unless handler?
  //     ### https://github.com/gvarsanyi/sync-exec ###
  //     exec = require 'sync-exec'
  //     #...........................................................................................................
  //     { stdout
  //       stderr
  //       status } = exec 'ls'
  //     throw new Error stderr if stderr? and stderr.length > 0
  //     return lines_from_stdout stdout
  //   #.........................................................................................................
  //   ( require 'child_process' ).exec O[ 'on-change' ], ( error, stdout, stderr ) =>
  //     return handler error if error?
  //     return handler new Error stderr if stderr? and stderr.length isnt 0
  //     handler null, lines_from_stdout stdout
  //   #.........................................................................................................
  //   return null

  //-----------------------------------------------------------------------------------------------------------
  lines_from_stdout = function(stdout) {
    var R;
    R = stdout.split('\n');
    if (R[R.length - 1].length === 0) {
      R.length -= 1;
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.spawn = function(command, parameters, handler) {
    var R;
    R = (require('child_process')).spawn(command, parameters, {
      stdio: 'inherit'
    });
    R.on('close', handler);
    //.........................................................................................................
    return R;
  };

  //===========================================================================================================
  // COLORS & EFFECTS
  //-----------------------------------------------------------------------------------------------------------
  this.clear_line_right = this.constants.clear_line_right;

  this.clear_line_left = this.constants.clear_line_left;

  this.clear_line = this.constants.clear_line;

  this.clear_below = this.constants.clear_below;

  this.clear_above = this.constants.clear_above;

  this.clear = this.constants.clear;

  //-----------------------------------------------------------------------------------------------------------
  this.goto = function(line_nr = 1, column_nr = 1) {
    return `\x1b[${line_nr};${column_nr}H`;
  };

  this.goto_column = function(column_nr = 1) {
    return `\x1b[${column_nr}G`;
  };

  //...........................................................................................................
  this.up = function(count = 1) {
    return `\x1b[${count}A`;
  };

  this.down = function(count = 1) {
    return `\x1b[${count}B`;
  };

  this.right = function(count = 1) {
    return `\x1b[${count}C`;
  };

  this.left = function(count = 1) {
    return `\x1b[${count}D`;
  };

  //...........................................................................................................
  this.move = function(line_count, column_count) {
    return (line_count < 0 ? this.up(line_count) : this.down(line_count)) + (column_count < 0 ? this.left(column_count) : this.right(column_count));
  };

  //-----------------------------------------------------------------------------------------------------------
  this.ring_bell = function() {
    return process.stdout.write("\x07");
  };

  //-----------------------------------------------------------------------------------------------------------
  effect_names = {
    blink: 1,
    bold: 1,
    reverse: 1,
    underline: 1
  };

//...........................................................................................................
  for (effect_name in effect_names) {
    effect_on = this.constants[effect_name];
    effect_off = this.constants['no_' + effect_name];
    ((effect_name, effect_on, effect_off) => {
      return this[effect_name] = (...P) => {
        var R, i, idx, last_idx, len, p;
        R = [effect_on];
        last_idx = P.length - 1;
        for (idx = i = 0, len = P.length; i < len; idx = ++i) {
          p = P[idx];
          R.push(isa_text(p) ? p : this.rpr(p));
          if (idx !== last_idx) {
            R.push(effect_on);
            R.push(this.separator);
          }
        }
        R.push(effect_off);
        return R.join('');
      };
    })(effect_name, effect_on, effect_off);
  }

  ref = this.constants['colors'];
  //...........................................................................................................
  for (color_name in ref) {
    color_code = ref[color_name];
    ((color_name, color_code) => {
      return this[color_name] = (...P) => {
        var R, i, idx, last_idx, len, p;
        R = [color_code];
        last_idx = P.length - 1;
        for (idx = i = 0, len = P.length; i < len; idx = ++i) {
          p = P[idx];
          R.push(isa_text(p) ? p : this.rpr(p));
          if (idx !== last_idx) {
            R.push(color_code);
            R.push(this.separator);
          }
        }
        R.push(this.constants['reset']);
        return R.join('');
      };
    })(color_name, color_code);
  }

  //-----------------------------------------------------------------------------------------------------------
  this.remove_colors = function(text) {
    // this one from http://regexlib.com/UserPatterns.aspx?authorId=f3ce5c3c-5970-48ed-9c4e-81583022a387
    // looks smarter but isn't JS-compatible:
    // return text.replace /(?s)(?:\e\[(?:(\d+);?)*([A-Za-z])(.*?))(?=\e\[|\z)/g, ''
    return text.replace(this.color_matcher, '');
  };

  //-----------------------------------------------------------------------------------------------------------
  this.color_matcher = /\x1b\[[^m]*m/g;

  // #-----------------------------------------------------------------------------------------------------------
  // $.length_of_ansi_text = ( text ) ->
  //   return ( text.replace /\x1b[^m]m/, '' ).length

  // #-----------------------------------------------------------------------------------------------------------
  // $.truth = ( P... ) ->
  //   return ( ( ( if p == true then green else if p == false then red else white ) p ) for p in P ).join ''

  //-----------------------------------------------------------------------------------------------------------
  // rainbow_color_names = """blue tan cyan sepia indigo steel brown red olive lime crimson green plum orange pink
  //                         gold yellow""".split /\s+/
  rainbow_color_names = `red orange yellow green blue pink`.split(/\s+/);

  rainbow_idx = -1;

  //-----------------------------------------------------------------------------------------------------------
  this.rainbow = function(...P) {
    rainbow_idx = (rainbow_idx + 1) % rainbow_color_names.length;
    return this[rainbow_color_names[rainbow_idx]](...P);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.route = function(...P) {
    return this.lime(this.underline(...P));
  };

  //-----------------------------------------------------------------------------------------------------------
  this.truth = function(...P) {
    var p;
    return ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = P.length; i < len; i++) {
        p = P[i];
        results.push(p ? this.green(`✔  ${this._pen(p)}`) : this.red(`✗  ${this._pen(p)}`));
      }
      return results;
    }).call(this)).join('');
  };

  //-----------------------------------------------------------------------------------------------------------
  this.get_logger = function(category, badge = null) {
    var R, colorize, pointer, prefix;
    //.........................................................................................................
    switch (category) {
      //.......................................................................................................
      case 'plain':
        colorize = null;
        pointer = this.grey(' ▶ ');
        break;
      //.......................................................................................................
      case 'info':
        colorize = this.BLUE.bind(this);
        pointer = this.grey(' ▶ ');
        break;
      //.......................................................................................................
      case 'whisper':
        colorize = this.grey.bind(this);
        pointer = this.grey(' ▶ ');
        break;
      //.......................................................................................................
      case 'urge':
        colorize = this.orange.bind(this);
        pointer = this.bold(this.RED(' ? '));
        break;
      //.......................................................................................................
      case 'praise':
        colorize = this.GREEN.bind(this);
        pointer = this.GREEN(' ✔ ');
        break;
      //.......................................................................................................
      case 'debug':
        colorize = this.pink.bind(this);
        pointer = this.grey(' ⚙ ');
        break;
      //.......................................................................................................
      case 'alert':
        colorize = this.RED.bind(this);
        pointer = this.blink(this.RED(' ⚠ '));
        break;
      //.......................................................................................................
      case 'warn':
        colorize = this.RED.bind(this);
        pointer = this.bold(this.RED(' ! '));
        break;
      //.......................................................................................................
      case 'help':
        colorize = this.lime.bind(this);
        pointer = this.gold(' ☛ ');
        break;
      default:
        //.......................................................................................................
        throw new Error(`unknown logger category ${rpr(category)}`);
    }
    //.........................................................................................................
    prefix = badge != null ? (this.grey(badge)).concat(' ', pointer) : pointer;
    //.........................................................................................................
    if (colorize != null) {
      R = (...P) => {
        return this.log((this.grey(get_timestamp())) + ' ' + prefix, colorize(...P));
      };
    } else {
      R = (...P) => {
        return this.log((this.grey(get_timestamp())) + ' ' + prefix, ...P);
      };
    }
    //.........................................................................................................
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  get_timestamp = function() {
    var m, s, t1;
    t1 = Math.floor((Date.now() - global[σ_cnd].t0) / 1000);
    s = t1 % 60;
    s = '' + s;
    if (s.length < 2) {
      s = '0' + s;
    }
    m = (Math.floor(t1 / 60)) % 100;
    m = '' + m;
    if (m.length < 2) {
      m = '0' + m;
    }
    return `${m}:${s}`;
  };

  //===========================================================================================================
  // EXTRACTING COLORS / CONVERTING COLORS TO HTML
  //-----------------------------------------------------------------------------------------------------------
  /* TAINT naming unstable, to be renamed */
  // @as_html = @ANSI.as_html.bind @ANSI
  // @get_css_source = @ANSI.get_css_source.bind @ANSI
  // @analyze = @ANSI.analyze.bind @ANSI

  //-----------------------------------------------------------------------------------------------------------
  this.clean = function(text) {
    var R, chunk, is_ansicode;
    is_ansicode = true;
    R = [];
    return ((function() {
      var i, len, ref1, results;
      ref1 = this.analyze(text);
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        chunk = ref1[i];
        if ((is_ansicode = !is_ansicode)) {
          //.........................................................................................................
          results.push(chunk);
        }
      }
      return results;
    }).call(this)).join('');
  };

  //===========================================================================================================
  // VALUE REPORTING
  // #-----------------------------------------------------------------------------------------------------------
  // @_prototype_of_object = Object.getPrototypeOf new Object()

  //-----------------------------------------------------------------------------------------------------------
  this._dir_options = {
    'skip-list-idxs': true,
    'skip-object': true
  };

  //-----------------------------------------------------------------------------------------------------------
  this._marker_by_type = {
    'function': '()'
  };

  // #-----------------------------------------------------------------------------------------------------------
  // @dir = ( P... ) ->
  //   switch arity = P.length
  //     when 0
  //       throw new Error "called TRM.dir without arguments"
  //     when 1
  //       x = P[ 0 ]
  //     else
  //       x = P[ P.length - 1 ]
  //       @log @rainbow p for p, idx in P when idx < P.length - 1
  //   width = if process.stdout.isTTY then process.stdout.columns else 108
  //   r     = ( @rpr x ).replace /\n\s*/g, ' '
  //   r     = r[ .. Math.max 5, width - 5 ].concat @grey ' ...' if r.length > width
  //   @log '\n'.concat ( @lime r ), '\n', ( ( @_dir x ).join @grey ' ' ), '\n'

  // #-----------------------------------------------------------------------------------------------------------
  // @_dir = ( x ) ->
  //   R = []
  //   for [ role, p, type, names, ] in @_get_prototypes_types_and_property_names x, []
  //     R.push @grey '('.concat role, ')'
  //     R.push @orange type
  //     for name in names
  //       marker = @_marker_from_type type_of ( Object.getOwnPropertyDescriptor p, name )[ 'value' ]
  //       R.push ( @cyan name ).concat @grey marker
  //   return R

  //-----------------------------------------------------------------------------------------------------------
  this._is_list_idx = function(idx_txt, length) {
    var ref1;
    if (!/^[0-9]+$/.test(idx_txt)) {
      return false;
    }
    return (0 <= (ref1 = parseInt(idx_txt)) && ref1 < length);
  };

  //-----------------------------------------------------------------------------------------------------------
  this._marker_from_type = function(type) {
    var ref1;
    return (ref1 = this._marker_by_type[type]) != null ? ref1 : '|'.concat(type);
  };

  // #-----------------------------------------------------------------------------------------------------------
// @_get_prototypes_types_and_property_names = ( x, types_and_names ) ->
//   types                     = require './types'
//   { isa
//     type_of }               = @types
//   #.........................................................................................................
//   role = if types_and_names.length is 0 then 'type' else 'prototype'
//   unless x?
//     types_and_names.push [ role, x, ( type_of x ), [], ]
//     return types_and_names
//   #.........................................................................................................
//   try
//     names           = Object.getOwnPropertyNames x
//     prototype       = Object.getPrototypeOf x
//   catch error
//     throw error unless error[ 'message' ] is 'Object.getOwnPropertyNames called on non-object'
//     x_              = new Object x
//     names           = Object.getOwnPropertyNames x_
//     prototype       = Object.getPrototypeOf x_
//   #.........................................................................................................
//   try
//     length = x.length
//     if length?
//       names = ( name for name in names when not  @_is_list_idx name, x.length )
//   catch error
//     throw error unless error[ 'message' ].test /^Cannot read property 'length' of /
//   #.........................................................................................................
//   names.sort()
//   types_and_names.push [ role, x, ( type_of x ), names ]
//   #.........................................................................................................
//   if prototype? and not ( @_dir_options[ 'skip-object' ] and prototype is @_prototype_of_object )
//     @_get_prototypes_types_and_property_names prototype, types_and_names
//   #.........................................................................................................
//   return types_and_names

}).call(this);

//# sourceMappingURL=TRM.js.map