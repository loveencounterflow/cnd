

############################################################################################################
# njs_util                  = require 'util'
# njs_path                  = require 'path'
# njs_fs                    = require 'fs'
#...........................................................................................................
# CND                       = require './main'
# rpr                       = CND.rpr
# badge                     = 'CND/BLOOM'
# log                       = CND.get_logger 'plain',     badge
# debug                     = CND.get_logger 'debug',     badge
# warn                      = CND.get_logger 'warn',      badge
# help                      = CND.get_logger 'help',      badge
# urge                      = CND.get_logger 'urge',      badge
# whisper                   = CND.get_logger 'whisper',   badge
# echo                      = CND.echo.bind CND
# ƒ                         = CND.format_number.bind CND


#-----------------------------------------------------------------------------------------------------------
@new_filter = ( settings ) ->
  R =
    '@isa':             'CND/BLOOM/scaling-bloom'
    '%self':            null
    size:               settings?[ 'size'         ] ? 1e4
    confidence:         settings?[ 'confidence'   ] ? 0.9
    tightening:         settings?[ 'tightening'   ] ? 0.9
    scaling:            settings?[ 'scaling'      ] ? 2
  #.........................................................................................................
  _settings =
    initial_capacity:   R[ 'size' ]
    scaling:            R[ 'scaling' ]
    ratio:              R[ 'tightening' ]
  #.........................................................................................................
  R[ '%self' ] = new ( require 'bloem' ).ScalingBloem ( 1 - R[ 'confidence' ] ), _settings
  return R

#-----------------------------------------------------------------------------------------------------------
@add          = ( me, key     ) -> me[ '%self' ].add key
@has          = ( me, key     ) -> me[ '%self' ].has key
@as_buffer    = ( me          ) -> new Buffer JSON.stringify me

#-----------------------------------------------------------------------------------------------------------
@from_buffer  = ( bloom_bfr  ) ->
  R = JSON.parse bloom_bfr.toString()
  R[ '%self'] = ( require 'bloem' ).ScalingBloem.destringify R[ '%self' ]
  return R

#-----------------------------------------------------------------------------------------------------------
@report = ( me, entry_count, false_positive_count ) =>
  CND           = require './main'
  rpr           = CND.rpr
  badge         = 'CND/BLOOM'
  whisper       = CND.get_logger 'whisper',   badge
  ƒ             = CND.format_number
  filters       = me[ '%self' ][ 'filters' ]
  filter_size   = 0
  filter_size  += filter[ 'filter' ][ 'bitfield' ][ 'buffer' ].length for filter in filters
  whisper "scalable Bloom filter:"
  whisper "filter size:               #{ƒ filter_size} bytes"
  whisper "initial capacity:          #{ƒ me[ 'size' ]} keys"
  whisper "scaling:                   #{me[ 'scaling' ]}"
  whisper "tightening:                #{me[ 'tightening' ]}"
  whisper "nominal confidence:        #{me[ 'confidence' ].toFixed 4}"
  #.........................................................................................................
  if entry_count?
    whisper "entries:                   #{ƒ entry_count}"
  #.........................................................................................................
  if false_positive_count?
    whisper "misses:                    #{ƒ false_positive_count}"
  #.........................................................................................................
  if entry_count? and false_positive_count? and entry_count > 0
    whisper "actual confidence:         #{( 1 - false_positive_count / entry_count ).toFixed 4}"
  #.........................................................................................................
  return null

