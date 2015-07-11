// Generated by CoffeeScript 1.9.1
(function() {
  this.new_filter = function(settings) {
    var R, _settings, ref, ref1, ref2, ref3;
    R = {
      '@isa': 'CND/BLOOM/scaling-bloom',
      '%self': null,
      size: (ref = settings != null ? settings['size'] : void 0) != null ? ref : 1e4,
      confidence: (ref1 = settings != null ? settings['confidence'] : void 0) != null ? ref1 : 0.9,
      tightening: (ref2 = settings != null ? settings['tightening'] : void 0) != null ? ref2 : 0.9,
      scaling: (ref3 = settings != null ? settings['scaling'] : void 0) != null ? ref3 : 2
    };
    _settings = {
      initial_capacity: R['size'],
      scaling: R['scaling'],
      ratio: R['tightening']
    };
    R['%self'] = new (require('bloem')).ScalingBloem(1 - R['confidence'], _settings);
    return R;
  };

  this.add = function(me, key) {
    return me['%self'].add(key);
  };

  this.has = function(me, key) {
    return me['%self'].has(key);
  };

  this.as_buffer = function(me) {
    return new Buffer(JSON.stringify(me));
  };

  this.from_buffer = function(bloom_bfr) {
    var R;
    R = JSON.parse(bloom_bfr.toString());
    R['%self'] = (require('bloem')).ScalingBloem.destringify(R['%self']);
    return R;
  };

  this.report = (function(_this) {
    return function(me, entry_count, false_positive_count) {
      var CND, badge, filter, filter_size, filters, i, len, rpr, whisper, ƒ;
      CND = require('./main');
      rpr = CND.rpr;
      badge = 'CND/BLOOM';
      whisper = CND.get_logger('whisper', badge);
      ƒ = CND.format_number;
      filters = me['%self']['filters'];
      filter_size = 0;
      for (i = 0, len = filters.length; i < len; i++) {
        filter = filters[i];
        filter_size += filter['filter']['bitfield']['buffer'].length;
      }
      whisper("scalable Bloom filter:");
      whisper("filter size:               " + (ƒ(filter_size)) + " bytes");
      whisper("initial capacity:          " + (ƒ(me['size'])) + " keys");
      whisper("scaling:                   " + me['scaling']);
      whisper("tightening:                " + me['tightening']);
      whisper("nominal confidence:        " + (me['confidence'].toFixed(4)));
      if (entry_count != null) {
        whisper("entries:                   " + (ƒ(entry_count)));
      }
      if (false_positive_count != null) {
        whisper("misses:                    " + (ƒ(false_positive_count)));
      }
      if ((entry_count != null) && (false_positive_count != null) && entry_count > 0) {
        whisper("actual confidence:         " + ((1 - false_positive_count / entry_count).toFixed(4)));
      }
      return null;
    };
  })(this);

}).call(this);