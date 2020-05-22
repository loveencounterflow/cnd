


############################################################################################################
# njs_util                  = require 'util'
njs_path                  = require 'path'
# njs_fs                    = require 'fs'
#...........................................................................................................
TRM                       = require './TRM'
rpr                       = TRM.rpr.bind TRM
badge                     = 'CND/test'
log                       = TRM.get_logger 'plain',     badge
info                      = TRM.get_logger 'info',      badge
whisper                   = TRM.get_logger 'whisper',   badge
alert                     = TRM.get_logger 'alert',     badge
debug                     = TRM.get_logger 'debug',     badge
warn                      = TRM.get_logger 'warn',      badge
help                      = TRM.get_logger 'help',      badge
urge                      = TRM.get_logger 'urge',      badge
praise                    = TRM.get_logger 'praise',    badge
echo                      = TRM.echo.bind TRM
#...........................................................................................................
CND                       = require './main'
test                      = require 'guy-test'


# #-----------------------------------------------------------------------------------------------------------
# @[ "is_subset" ] = ( T ) ->
#   T.eq false, CND.is_subset ( Array.from 'abcde' ), ( Array.from 'abcd' )
#   T.eq false, CND.is_subset ( Array.from 'abcx'  ), ( Array.from 'abcd' )
#   T.eq false, CND.is_subset ( Array.from 'abcd'  ), ( []                )
#   T.eq true,  CND.is_subset ( Array.from 'abcd'  ), ( Array.from 'abcd' )
#   T.eq true,  CND.is_subset ( Array.from 'abc'   ), ( Array.from 'abcd' )
#   T.eq true,  CND.is_subset ( []                 ), ( Array.from 'abcd' )
#   T.eq true,  CND.is_subset ( []                 ), ( Array.from []     )
#   T.eq false, CND.is_subset ( new Set 'abcde'    ), ( new Set 'abcd'    )
#   T.eq false, CND.is_subset ( new Set 'abcx'     ), ( new Set 'abcd'    )
#   T.eq false, CND.is_subset ( new Set 'abcx'     ), ( new Set()         )
#   T.eq true,  CND.is_subset ( new Set 'abcd'     ), ( new Set 'abcd'    )
#   T.eq true,  CND.is_subset ( new Set 'abc'      ), ( new Set 'abcd'    )
#   T.eq true,  CND.is_subset ( new Set()          ), ( new Set 'abcd'    )
#   T.eq true,  CND.is_subset ( new Set()          ), ( new Set()         )
#   #.........................................................................................................
#   return null

#-----------------------------------------------------------------------------------------------------------
@[ "deep_copy" ] = ( T ) ->
  ### TAINT set comparison doesn't work ###
  probes = [
    [ 'foo', 42, [ 'bar', ( -> 'xxx' ), ], { q: 'Q', s: 'S', }, ]
    ]
  # probe   = [ 'foo', 42, [ 'bar', ( -> 'xxx' ), ], ( new Set Array.from 'abc' ), ]
  # matcher = [ 'foo', 42, [ 'bar', ( -> 'xxx' ), ], ( new Set Array.from 'abc' ), ]
  for probe in probes
    result  = CND.deep_copy probe
    T.eq result, probe
    T.ok result isnt probe
  #.........................................................................................................
  return null



#-----------------------------------------------------------------------------------------------------------
@[ "logging with timestamps" ] = ( T, done ) ->
  my_badge                  = 'BITSNPIECES/test'
  my_info                   = TRM.get_logger 'info',      badge
  my_help                   = TRM.get_logger 'help',      badge
  my_info 'helo'
  my_help 'world'
  done()


#-----------------------------------------------------------------------------------------------------------
@[ "path methods" ] = ( T, done ) ->
  T.eq ( CND.here_abspath  '/foo/bar', '/baz/coo'       ), '/baz/coo'
  T.eq ( CND.cwd_abspath   '/foo/bar', '/baz/coo'       ), '/baz/coo'
  T.eq ( CND.here_abspath  '/baz/coo'                   ), '/baz/coo'
  T.eq ( CND.cwd_abspath   '/baz/coo'                   ), '/baz/coo'
  T.eq ( CND.here_abspath  '/foo/bar', 'baz/coo'        ), '/foo/bar/baz/coo'
  T.eq ( CND.cwd_abspath   '/foo/bar', 'baz/coo'        ), '/foo/bar/baz/coo'
  # T.eq ( CND.here_abspath  'baz/coo'                    ), '/....../cnd/baz/coo'
  # T.eq ( CND.cwd_abspath   'baz/coo'                    ), '/....../cnd/baz/coo'
  # T.eq ( CND.here_abspath  __dirname, 'baz/coo', 'x.js' ), '/....../cnd/lib/baz/coo/x.js'
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "format_number" ] = ( T, done ) ->
  T.eq ( CND.format_number 42         ), '42'
  T.eq ( CND.format_number 42000      ), '42,000'
  T.eq ( CND.format_number 42000.1234 ), '42,000.123'
  T.eq ( CND.format_number 42.1234e6  ), '42,123,400'
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "rpr" ] = ( T, done ) ->
  echo rpr 42
  echo rpr 42_000_000_000
  echo rpr { foo: 'bar', bar: [ true, null, undefined, ], }
  info rpr 42
  info rpr 42_000_000_000
  info rpr { foo: 'bar', bar: [ true, null, undefined, ], }
  T.eq ( rpr 42                                               ), """42"""
  T.eq ( rpr 42_000_000_000                                   ), """42000000000""" ### TAINT should have underscores ###
  T.eq ( rpr { foo: 'bar', bar: [ true, null, undefined, ], } ), """{ foo: 'bar', bar: [ true, null, undefined ] }"""
  done()







############################################################################################################
unless module.parent?
  test @, 'timeout': 2500
  # test @[ "path methods" ]
  # test @[ "rpr" ]





