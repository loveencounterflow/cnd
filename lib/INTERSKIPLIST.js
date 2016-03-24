// Generated by CoffeeScript 1.9.3
(function() {
  var CND,
    slice = [].slice;

  CND = require('./main');

  this["new"] = function(settings) {
    var R, substrate;
    if (settings != null) {
      throw new Error("settings not yet supported");
    }
    substrate = new (require('interval-skip-list'))();
    R = {
      '~isa': 'CND/interskiplist',
      '%self': substrate,
      'value-by-ids': {}
    };
    return R;
  };

  this.add_interval = function(me, lo, hi, id, value) {
    if (id == null) {
      throw new Error("need an ID");
    }
    if (value === void 0) {
      value = id;
    }
    me['%self'].insert(id, lo, hi);
    me['value-by-ids'][id] = value;
    return id;
  };

  this.find_any_ids = function() {
    var me, probes, ref;
    me = arguments[0], probes = 2 <= arguments.length ? slice.call(arguments, 1) : [];

    /* Note: `Intervalskiplist::findIntersecting` needs more than a single probe, so we fall back to
    `::findContaining` in case a single probe was given.
     */
    if (probes.length < 2) {
      return this.find_all_ids.apply(this, [me].concat(slice.call(probes)));
    }
    return (ref = me['%self']).findIntersecting.apply(ref, probes);
  };

  this.find_all_ids = function() {
    var me, probes, ref;
    me = arguments[0], probes = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return (ref = me['%self']).findContaining.apply(ref, probes);
  };

  this.find_any_intervals = function() {
    var id, interval_by_ids, me, probes;
    me = arguments[0], probes = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    interval_by_ids = me['%self']['intervalsByMarker'];
    return (function() {
      var i, len, ref, results;
      ref = this.find_any_ids(me, probes);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        id = ref[i];
        results.push(interval_by_ids[id]);
      }
      return results;
    }).call(this);
  };

  this.find_all_intervals = function() {
    var id, interval_by_ids, me, probes;
    me = arguments[0], probes = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    interval_by_ids = me['%self']['intervalsByMarker'];
    return (function() {
      var i, len, ref, results;
      ref = this.find_all_ids(me, probes);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        id = ref[i];
        results.push(interval_by_ids[id]);
      }
      return results;
    }).call(this);
  };

  this.find_any_values = function() {
    var id, me, probes, value_by_ids;
    me = arguments[0], probes = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    value_by_ids = me['value-by-ids'];
    return (function() {
      var i, len, ref, results;
      ref = this.find_any_ids(me, probes);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        id = ref[i];
        results.push(value_by_ids[id]);
      }
      return results;
    }).call(this);
  };

  this.find_all_values = function() {
    var id, me, probes, value_by_ids;
    me = arguments[0], probes = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    value_by_ids = me['value-by-ids'];
    return (function() {
      var i, len, ref, results;
      ref = this.find_all_ids(me, probes);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        id = ref[i];
        results.push(value_by_ids[id]);
      }
      return results;
    }).call(this);
  };

  this._demo = function() {
    var SL, badge, help, hi, i, id, intervals, j, len, lo, n, ref, show, skiplist, urge, value;
    badge = 'CND/INTERSKIPLIST/demo';
    help = CND.get_logger('help', badge);
    urge = CND.get_logger('urge', badge);
    SL = this;
    show = function(node) {
      var left_node, right_node, this_key, this_m, this_value;
      this_key = node['key'];
      this_value = node['value'];
      this_m = node[get_m_sym]();
      help(this_key, this_value, this_m);
      if ((left_node = node['left']) != null) {
        show(left_node);
      }
      if ((right_node = node['right']) != null) {
        show(right_node);
      }
      return null;
    };
    skiplist = SL["new"]();
    intervals = [[1, 3, 'A'], [2, 14, 'B'], [3, 7, 'C'], [4, 4, 'D'], [5, 7, 'E'], [8, 12, 'F1'], [8, 12, 'F2'], [8, 22, 'G'], [10, 13, 'H']];
    for (i = 0, len = intervals.length; i < len; i++) {
      ref = intervals[i], lo = ref[0], hi = ref[1], id = ref[2], value = ref[3];
      SL.add_interval(skiplist, lo, hi, id, value);
    }
    for (n = j = 0; j <= 15; n = ++j) {
      help(n, (SL.find_any_ids(skiplist, n)).join(','), SL.find_any_intervals(skiplist, n), SL.find_any_values(skiplist, n));
    }
    return null;
  };

  if (module.parent == null) {
    this._demo();
  }


  /*
  
  #-----------------------------------------------------------------------------------------------------------
  @[ '_test interval skiplist 1' ] = ->
    search = ->
      for n in [ 0 .. 15 ]
        help n
        for node in SL.find skiplist, n
          urge '  ', node[ 'key' ], node[ 'value' ]
    skiplist      = SL.new_tree()
    intervals = [
      [ 1, 3, 'A', ]
      [ 2, 14, 'B', ]
      [ 3, 7, 'C', ]
      [ 4, 4, 'D', ]
      [ 5, 7, 'E', ]
      [ 8, 12, 'F1', ]
       * [ 8, 12, 'F2', ]
      [ 8, 22, 'G', ]
      [ 10, 13, 'H', ]
      ]
    SL.add_interval skiplist, interval for interval in intervals
    SL._decorate skiplist[ '%self' ][ 'root' ]
     * search()
    show skiplist[ '%self' ][ 'root' ]
    error_count = 0
    error_count += eq ( find skiplist, 0 ), ''
    error_count += eq ( find skiplist, 1 ), 'A'
    error_count += eq ( find skiplist, 2 ), 'B,A'
    error_count += eq ( find skiplist, 3 ), 'B,A,C'
    error_count += eq ( find skiplist, 4 ), 'D,B,C'
    error_count += eq ( find skiplist, 5 ), 'B,C,E'
    error_count += eq ( find skiplist, 6 ), 'B,C,E'
    error_count += eq ( find skiplist, 7 ), 'B,C,E'
    error_count += eq ( find skiplist, 8 ), 'B,F1,F2,G'
    error_count += eq ( find skiplist, 9 ), 'B,F1,F2,G'
    error_count += eq ( find skiplist, 10 ), 'B,F1,F2,G,H'
    error_count += eq ( find skiplist, 11 ), 'B,F1,F2,G,H'
    error_count += eq ( find skiplist, 12 ), 'B,F1,F2,G,H'
    error_count += eq ( find skiplist, 13 ), 'B,G,H'
    error_count += eq ( find skiplist, 14 ), 'B,G'
    error_count += eq ( find skiplist, 15 ), 'G'
    error_count += eq ( find skiplist, 16 ), 'G'
    error_count += eq ( find skiplist, 17 ), 'G'
    error_count += eq ( find skiplist, 18 ), 'G'
     * debug rpr find skiplist, 0
     * debug rpr find skiplist, 1
     * debug rpr find skiplist, 2
     * debug rpr find skiplist, 3
     * debug rpr find skiplist, 4
     * debug rpr find skiplist, 5
     * debug rpr find skiplist, 6
     * debug rpr find skiplist, 7
     * debug rpr find skiplist, 8
     * debug rpr find skiplist, 9
     * debug rpr find skiplist, 10
     * debug rpr find skiplist, 11
     * debug rpr find skiplist, 12
     * debug rpr find skiplist, 13
     * debug rpr find skiplist, 14
     * debug rpr find skiplist, 15
     * debug rpr find skiplist, 16
     * debug rpr find skiplist, 17
     * debug rpr find skiplist, 18
     * SL.add_interval skiplist, [ 10, 13, 'FF' ]
     * search()
    throw Error "there were #{error_count} errors" unless error_count is 0
    return null
  
  #-----------------------------------------------------------------------------------------------------------
  @[ 'test interval skiplist 2' ] = ->
    skiplist      = SL.new_tree()
    intervals = [
      [ 17, 19, 'A', ]
      [  5,  8, 'B', ]
      [ 21, 24, 'C', ]
      [  4,  8, 'D', ]
      [ 15, 18, 'E', ]
      [  7, 10, 'F', ]
      [ 16, 22, 'G', ]
      ]
    SL.add_interval skiplist, interval for interval in intervals
    SL._decorate skiplist[ '%self' ][ 'root' ]
     * search()
    show skiplist[ '%self' ][ 'root' ]
    error_count = 0
     * error_count += eq ( find skiplist, 0 ), ''
     * debug rpr find skiplist, [ 23, 25,c ] # 'G,C'
    debug rpr find skiplist, [ 8, 9, ] # 'B,D,F'
    debug rpr find skiplist, [  5,  8, ]
    debug rpr find skiplist, [ 21, 24, ]
    debug rpr find skiplist, [  4,  8, ]
     * search()
    throw Error "there were #{error_count} errors" unless error_count is 0
    return null
   */

}).call(this);