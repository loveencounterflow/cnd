(function() {
  //###########################################################################################################
  var CND, NumberFormat, PATH, njs_fs, njs_path, njs_util, rpr;

  njs_path = require('path');

  njs_fs = require('fs');

  njs_util = require('util');

  rpr = njs_util.inspect;

  CND = require('./main');

  PATH = require('path');

  ({NumberFormat} = require('jsx-number-format'));

  this.flatten = function(x, depth = 2e308) {
    return x.flat(depth);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.jr = JSON.stringify;

  this.assign = Object.assign;

  //-----------------------------------------------------------------------------------------------------------
  this.here_abspath = function(dirname, ...P) {
    return PATH.resolve(dirname, ...P);
  };

  this.cwd_abspath = function(...P) {
    return PATH.resolve(process.cwd(), ...P);
  };

  this.cwd_relpath = function(...P) {
    return PATH.relative(process.cwd(), ...P);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.deep_copy = function(...P) {
    return (require('./universal-copy'))(...P);
  };

  //-----------------------------------------------------------------------------------------------------------
  // number_formatter = new Intl.NumberFormat 'en-US'
  // @format_number = ( x ) -> number_formatter.format x
  this.format_number = function(n) {
    var R;
    R = NumberFormat(n, 3);
    return R.replace(/\.000/, '');
  };

  //-----------------------------------------------------------------------------------------------------------
  this.escape_regex = function(text) {
    /* Given a `text`, return the same with all regular expression metacharacters properly escaped. Escaped
     characters are `[]{}()*+?-.,\^$|#` plus whitespace. */
    //.........................................................................................................
    return text.replace(/[-[\]{}()*+?.,\\\/^$|#\s]/g, "\\$&");
  };

  //-----------------------------------------------------------------------------------------------------------
  this.escape_html = function(text) {
    /* Given a `text`, return the same with all characters critical in HTML (`&`, `<`, `>`) properly
     escaped. */
    var R;
    R = text;
    R = R.replace(/&/g, '&amp;');
    R = R.replace(/</g, '&lt;');
    R = R.replace(/>/g, '&gt;');
    //.........................................................................................................
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.find_all = function(text, matcher) {
    var flags, ref;
    /* `CND.find_all` expects a `text` and a `matcher` (which must be a RegExp object); it returns a
    (possibly empty) list of all matching parts in the text. If `matcher` does not have the `g` (global) flag
    set, a new RegExp object will be cloned behind the scenes, so passsing in a regular expression with `g`
    turned on may improve performance.

    With thanks to http://www.2ality.com/2013/08/regexp-g.html,
    http://www.2ality.com/2011/04/javascript-overview-of-regular.html.
    */
    if (!((Object.prototype.toString.call(matcher === '[object RegExp]')) && matcher.global)) {
      flags = matcher.multiline ? 'gm' : 'g';
      if (matcher.ignoreCase) {
        flags += 'i';
      }
      if (matcher.sticky) {
        flags += 'y';
      }
      matcher = new RegExp(matcher.source, flags);
    }
    if (!matcher.global) {
      throw new Error("matcher must be a RegExp object with global flag set");
    }
    matcher.lastIndex = 0;
    return (ref = text.match(matcher)) != null ? ref : [];
  };

  //===========================================================================================================
  // UNSORTING
  //-----------------------------------------------------------------------------------------------------------
  this.shuffle = function(list, ratio = 1) {
    var this_idx;
    if ((this_idx = list.length) < 2) {
      /* Shuffles the elements of a list randomly. After the call, the elements of will be—most of the time—
      be reordered (but this is not guaranteed, as there is a realistic probability for recurrence of orderings
      with short lists).

      This is an implementation of the renowned Fisher-Yates algorithm, but with a twist: You may pass in a
      `ratio` as second argument (which should be a float in the range `0 <= ratio <= 1`); if set to a value
      less than one, a random number will be used to decide whether or not to perform a given step in the
      shuffling process, so lists shuffled with zero-ish ratios will show less disorder than lists shuffled with
      a one-ish ratio.

      Implementation gleaned from http://stackoverflow.com/a/962890/256361. */
      //.........................................................................................................
      return list;
    }
    return this._shuffle(list, ratio, Math.random, this.random_integer.bind(this));
  };

  //-----------------------------------------------------------------------------------------------------------
  this.get_shuffle = function(seed_0 = 0, seed_1 = 1) {
    /* This method works similar to `get_rnd`; it accepts two `seed`s which are used to produce random number
     generators and returns a predictable shuffling function that accepts arguments like Bits'N'Pieces
     `shuffle`. */
    var random_integer, rnd;
    rnd = this.get_rnd(seed_0);
    random_integer = this.get_rnd_int(seed_1);
    return (list, ratio = 1) => {
      return this._shuffle(list, ratio, rnd, random_integer);
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  this._shuffle = function(list, ratio, rnd, random_integer) {
    var that_idx, this_idx;
    if ((this_idx = list.length) < 2) {
      //.........................................................................................................
      return list;
    }
    while (true) {
      //.........................................................................................................
      this_idx += -1;
      if (this_idx < 1) {
        return list;
      }
      if (ratio >= 1 || rnd() <= ratio) {
        // return list if this_idx < 1
        that_idx = random_integer(0, this_idx);
        [list[that_idx], list[this_idx]] = [list[this_idx], list[that_idx]];
      }
    }
    //.........................................................................................................
    return list;
  };

  //===========================================================================================================
  // RANDOM NUMBERS
  //-----------------------------------------------------------------------------------------------------------
  /* see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number */
  this.MIN_SAFE_INTEGER = -(2 ** 53) - 1;

  this.MAX_SAFE_INTEGER = +(2 ** 53) - 1;

  //-----------------------------------------------------------------------------------------------------------
  this.random_number = function(min = 0, max = 1) {
    /* Return a random number between min (inclusive) and max (exclusive).
     From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
     via http://stackoverflow.com/a/1527820/256361. */
    return Math.random() * (max - min) + min;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.integer_from_normal_float = function(x, min = 0, max = 2) {
    /* Given a 'normal' float `x` so that `0 <= x < 1`, return an integer `n` so that `min <= n < min`. */
    return (Math.floor(x * (max - min))) + min;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.random_integer = function(min = 0, max = 2) {
    /* Return a random integer between min (inclusive) and max (exclusive).
     From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
     via http://stackoverflow.com/a/1527820/256361. */
    return this.integer_from_normal_float(Math.random(), min, max);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.get_rnd_int = function(seed = 1, delta = 1) {
    /* Like `get_rnd`, but returns a predictable random integer generator. */
    var rnd;
    rnd = this.get_rnd(seed, delta);
    return (min = 0, max = 1) => {
      return this.integer_from_normal_float(rnd(), min, max);
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  this.get_rnd = function(seed = 1, delta = 1) {
    var R;
    /* This method returns a simple deterministic pseudo-random number generator—basically like
    `Math.random`, but (1) very probably with a much worse distribution of results, and (2) with predictable
    series of numbers, which is good for some testing scenarios. You may seed this method by passing in a
    `seed` and a `delta`, both of which must be non-zero numbers; the ensuing series of calls to the returned
    method will then always result in the same series of numbers. Here is a usage example that also shows how
    to reset the generator:

        CND = require 'cnd'
        rnd = CND.get_rnd() # or, say, `rnd = CND.get_rnd 123, 0.5`
        log rnd() for idx in [ 0 .. 5 ]
        log()
        rnd.reset()
        log rnd() for idx in [ 0 .. 5 ]

    Please note that there are no strong guarantees made about the quality of the generated values except the
    (1) deterministic repeatability, (2) boundedness, and (3) 'apparent randomness'. Do **not** use this for
    cryptographic purposes. */
    //.........................................................................................................
    R = function() {
      var x;
      R._idx += 1;
      x = (Math.sin(R._s)) * 10000;
      R._s += R._delta;
      return x - Math.floor(x);
    };
    //.........................................................................................................
    R.reset = function(seed, delta) {
      /* Reset the generator. After calling `rnd.reset` (or `rnd.seed` with the same arguments), ensuing calls
         to `rnd` will always result in the same sequence of pseudo-random numbers. */
      if (seed == null) {
        seed = this._seed;
      }
      if (delta == null) {
        delta = this._delta;
      }
      //.......................................................................................................
      if (!((typeof seed) === 'number' && (Number.isFinite(seed)))) {
        throw new Error(`^3397^ expected a number, got ${rpr(seed)}`);
      }
      if (!((typeof delta) === 'number' && (Number.isFinite(delta)))) {
        throw new Error(`^3398^ expected a number, got ${rpr(delta)}`);
      }
      if (seed === 0) {
        //.......................................................................................................
        throw new Error("seed should not be zero");
      }
      if (delta === 0) {
        throw new Error("delta should not be zero");
      }
      //.......................................................................................................
      R._s = seed;
      R._seed = seed;
      R._delta = delta;
      R._idx = -1;
      return null;
    };
    //.........................................................................................................
    R.reset(seed, delta);
    //.........................................................................................................
    return R;
  };

  //===========================================================================================================
  // PODs
  //-----------------------------------------------------------------------------------------------------------
  this.pluck = function(x, name, fallback) {
    var R;
    /* Given some object `x`, a `name` and a `fallback`, return the value of `x[ name ]`, or, if it does not
     exist, `fallback`. When the method returns, `x[ name ]` has been deleted. */
    if (x[name] != null) {
      R = x[name];
      delete x[name];
    } else {
      R = fallback;
    }
    return R;
  };

  //===========================================================================================================
  // ROUTES
  //-----------------------------------------------------------------------------------------------------------
  this.get_parent_routes = function(route) {
    var R;
    R = [];
    while (true) {
      //.........................................................................................................
      R.push(route);
      if (route.length === 0 || route === '/') {
        break;
      }
      route = njs_path.dirname(route);
    }
    //.........................................................................................................
    return R;
  };

  //===========================================================================================================
  // CALLER LOCATION
  //-----------------------------------------------------------------------------------------------------------
  this.get_V8_CallSite_objects = function(error = null) {
    /* Save original Error.prepareStackTrace */
    var R, prepareStackTrace_original;
    prepareStackTrace_original = Error.prepareStackTrace;
    //.........................................................................................................
    Error.prepareStackTrace = function(ignored, stack) {
      return stack;
    };
    if (error == null) {
      error = new Error();
    }
    R = error.stack;
    //.........................................................................................................
    /* Restore original Error.prepareStackTrace */
    Error.prepareStackTrace = prepareStackTrace_original;
    //.........................................................................................................
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.get_caller_info_stack = function(delta = 0, error = null, limit = 2e308, include_source = false) {
    var R, call_sites, cs, entry, i, idx, len;
    if (error == null) {
      /* Return a list of PODs representing information about the call stack; newest items will be closer
      to the start ('top') of the list.

      `delta` represents the call distance of the site the inquirer is interested about, relative to the
      *inquirer*; this will be `0` if that is the very line where the call originated from, `1` in case another
      function is called to collect this information, and so on.

      A custom error will be produced and analyzed (with a suitably adjusted value for `delta`) in case no
      `error` has been given. Often, one will want to use this facility to see what the source for a caught
      error looks like; in that case, just pass in the caught `error` object along with a `delta` of (typically)
      `0` (because the error really originated where the problem occurred).

      It is further possible to cut down on the amount of data returned by setting `limit` to a smallish
      number; entries too close (with a stack index smaller than `delta`) or too far from the interesting
      point will be omitted.

      When `include_source` is `true`, an attempt will be made to open each source file, read its contents,
      split it into lines, and include the indicated line in the respective entry. Note that this is currently
      done in a very stupid, blocking, and non-memoizing way, so try not to do that if your stack trace is
      hundreds of lines long and includes megabyte-sized sources.

      Also see `get_caller_info`, which should be handy if you do not need an entire stack but just a single
      targetted entry.

      Have a look at https://github.com/loveencounterflow/guy-test to see how to use the BNP caller info
      methods to copy with error locations in an asynchronous world.  */
      //.........................................................................................................
      delta += +2;
    }
    call_sites = this.get_V8_CallSite_objects(error);
    R = [];
//.........................................................................................................
    for (idx = i = 0, len = call_sites.length; i < len; idx = ++i) {
      cs = call_sites[idx];
      if ((delta != null) && idx < delta) {
        continue;
      }
      if (R.length >= limit) {
        break;
      }
      entry = {
        'function-name': cs.getFunctionName(),
        'method-name': cs.getMethodName(),
        'route': cs.getFileName(),
        'line-nr': cs.getLineNumber(),
        'column-nr': cs.getColumnNumber()
      };
      if (include_source) {
        entry['source'] = this._source_line_from_caller_info(entry);
      }
      R.push(entry);
    }
    //.........................................................................................................
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.get_caller_info = function(delta = 0, error = null, include_source = false) {
    var R;
    R = null;
    while (delta >= 0 && (R == null)) {
      R = (this.get_caller_info_stack(delta, error, 1, include_source))[0];
      delta += -1;
    }
    // console.log '©3cc0i', rpr R
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._source_line_from_caller_info = function(info) {
    var R, error, line_nr, route, source_lines;
    route = info['route'];
    line_nr = info['line-nr'];
    try {
      source_lines = (njs_fs.readFileSync(route, {
        encoding: 'utf-8'
      })).split(/\r?\n/);
      R = source_lines[line_nr - 1];
    } catch (error1) {
      error = error1;
      R = null;
    }
    return R;
  };

  //===========================================================================================================
  // ID CREATION
  //-----------------------------------------------------------------------------------------------------------
  this.create_id = function(values, length) {
    var value;
    /* Given a number of `values` and a `length`, return an ID with `length` hexadecimal digits (`[0-9a-f]`)
     that deterministically depends on the input but can probably not reverse-engeneered to yield the input
     values. This is in no way meant to be cryptographically strong, just arbitrary enough so that we have a
     convenient method to derive an ID with little chance of overlap given different inputs. **Note** It is
     certainly possible to use this method (or `id_from_text`) to create a hash from a password to be stored in
     a DB. Don't do this. Use `bcrypt` or similar best-practices for password storage. Again, the intent of
     the BITSNPIECES ID utilities is *not* to be 'crypto-safe'; its intent is to give you a tool for generating
     repetition-free IDs. */
    return this.id_from_text(((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = values.length; i < len; i++) {
        value = values[i];
        results.push(rpr(value));
      }
      return results;
    })()).join('-'), length);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.create_random_id = function(values, length) {
    /* Like `create_id`, but with an extra random factor built in that should exclude that two identical
     outputs are ever returned for any two identical inputs. Under the assumption that two calls to this
     method are highly unlikely two produce an identical pair `( 1 * new Date(), Math.random() )` (which could
     only happen if `Math.random()` returned the same number again *within the same clock millisecond*), and
     assuming you are using a reasonable value for `length` (i.e., say, `7 < length < 20`), you should never
     see the same ID twice. */
    values.push(1 * new Date() * Math.random());
    return this.create_id(values, length);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.get_create_rnd_id = function(seed, delta) {
    var R;
    /* Given an optional `seed` and `delta`, returns a function that will create pseudo-random IDs similar to
    the ones `create_random_id` returns; however, the Bits'n'Pieces `get_rnd` method is used to obtain a
    repeatable random number generator so that ID sequences are repeatable. The underlying PRNG is exposed as
    `fn.rnd`, so `fn.rnd.reset` may be used to start over.

    **Use Case Example**: The below code demonstrates the interesting properties of the method returned by
    `get_create_rnd_id`: **(1)** we can seed the PRNG with numbers of our choice, so we get a chance to create
    IDs that are unlikely to be repeated by other people using the same software, even when later inputs (such
    as the email adresses shown here) happen to be the same. **(2)** Calling the ID generator with three
    diffferent user-specific inputs, we get three different IDs, as expected. **(3)** Repeating the ID
    generation calls with the *same* arguments will yield *different* IDs. **(4)** After calling
    `create_rnd_id.rnd.reset()` and feeding `create_rnd_id` with the *same* user-specific inputs, we can still
    see the identical *same* IDs generated—which is great for testing.

        create_rnd_id = CND.get_create_rnd_id 1234, 87.23

     * three different user IDs:
        log create_rnd_id [ 'foo@example.com' ], 12
        log create_rnd_id [ 'alice@nosuchname.com' ], 12
        log create_rnd_id [ 'tim@cern.ch' ], 12

     * the same repeated, but yielding random other IDs:
        log()
        log create_rnd_id [ 'foo@example.com' ], 12
        log create_rnd_id [ 'alice@nosuchname.com' ], 12
        log create_rnd_id [ 'tim@cern.ch' ], 12

     * the same repeated, but yielding the same IDs as in the first run:
        log()
        create_rnd_id.rnd.reset()
        log create_rnd_id [ 'foo@example.com' ], 12
        log create_rnd_id [ 'alice@nosuchname.com' ], 12
        log create_rnd_id [ 'tim@cern.ch' ], 12

    The output you should see is

        c40f774fce65
        9d44f31f9a55
        1b26e6e3e736

        a0e11f616685
        d7242f6935c7
        976f26d1b25b

        c40f774fce65
        9d44f31f9a55
        1b26e6e3e736

    Note the last three IDs exactly match the first three IDs. The upshot of this is that we get reasonably
    hard-to-guess, yet on-demand replayable IDs. Apart from weaknesses in the PRNG itself (for which see the
    caveats in the description to `get_rnd`), the obvious way to cheat the system is by making it so that
    a given piece of case-specific data is fed into the ID generator as the n-th call a second time. In
    theory, we could make it so that each call constributes to the state change inside of `create_rnd_id`;
    a replay would then need to provide all of the case-specific pieces of data a second time, in the right
    order.  */
    //.........................................................................................................
    R = (values, length) => {
      values.push(R.rnd());
      return this.create_id(values, length);
    };
    //.........................................................................................................
    R.rnd = this.get_rnd(seed, delta);
    //.........................................................................................................
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.id_from_text = function(text, length) {
    /* Given a `text` and a `length`, return an ID with `length` hexadecimal digits (`[0-9a-f]`)—this is like
     `create_id`, but working on a text rather than a number of arbitrary values. The hash algorithm currently
     used is SHA-1, which returns 40 hex digits; it should be good enough for the task at hand and has the
     advantage of being widely implemented. */
    /* TAINT should be a user option, or take 'good' algorithm universally available */
    var R;
    R = (((require('crypto')).createHash('sha1')).update(text, 'utf-8')).digest('hex');
    if (length != null) {
      return R.slice(0, length);
    } else {
      return R;
    }
  };

  //-----------------------------------------------------------------------------------------------------------
  this.id_from_route = function(route, length, handler) {
    var R, content;
    if (handler != null) {
      /* Like `id_from_text`, but accepting a file route instead of a text. */
      throw new Error("asynchronous `id_from_route` not yet supported");
    }
    content = njs_fs.readFileSync(route);
    R = (((require('crypto')).createHash('sha1')).update(content)).digest('hex');
    if (length != null) {
      return R.slice(0, length);
    } else {
      return R;
    }
  };

  //===========================================================================================================
  // APP INFO
  //-----------------------------------------------------------------------------------------------------------
  this.get_app_home = function(routes = null) {
    var error, i, len, route;
    njs_fs = require('fs');
    if (routes == null) {
      routes = require['main']['paths'];
    }
//.........................................................................................................
    for (i = 0, len = routes.length; i < len; i++) {
      route = routes[i];
      try {
        if ((njs_fs.statSync(route)).isDirectory()) {
          return njs_path.dirname(route);
        }
      } catch (error1) {
        //.......................................................................................................
        error = error1;
        if (error['code'] === 'ENOENT') {
          /* silently ignore missing routes: */
          continue;
        }
        throw error;
      }
    }
    //.........................................................................................................
    throw new Error(`unable to determine application home; tested routes: \n\n ${routes.join('\n ')}\n`);
  };

  //===========================================================================================================
  // FS ROUTES
  //-----------------------------------------------------------------------------------------------------------
  this.swap_extension = function(route, extension) {
    var extname;
    if (extension[0] !== '.') {
      extension = '.' + extension;
    }
    extname = njs_path.extname(route);
    return route.slice(0, route.length - extname.length) + extension;
  };

  //===========================================================================================================
  // NETWORK
  //-----------------------------------------------------------------------------------------------------------
  this.get_local_ips = function() {
    /* thx to http://stackoverflow.com/a/10756441/256361 */
    var R, _, description, i, interface_, len, ref;
    R = [];
    ref = (require('os')).networkInterfaces();
    for (_ in ref) {
      interface_ = ref[_];
      for (i = 0, len = interface_.length; i < len; i++) {
        description = interface_[i];
        if (description['family'] === 'IPv4' && !description['internal']) {
          R.push(description['address']);
        }
      }
    }
    return R;
  };

  
// thx to https://github.com/xxorax/node-shell-escape/blob/master/shell-escape.js
this.shellescape = function shellescape(a) {
  var ret = [];

  a.forEach(function(s) {
    if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
      s = "'"+s.replace(/'/g,"'\\''")+"'";
      s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
        .replace(/\\'''/g, "\\'" ); // remove non-escaped single-quote if there are enclosed between 2 escaped
    }
    ret.push(s);
  });

  return ret.join(' ');
}
  //===========================================================================================================
  // ESCAPE FOR COMMAND LINE
  //-----------------------------------------------------------------------------------------------------------
;

}).call(this);

//# sourceMappingURL=BITSNPIECES.js.map