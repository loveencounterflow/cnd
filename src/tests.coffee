


############################################################################################################
# njs_util                  = require 'util'
njs_path                  = require 'path'
# njs_fs                    = require 'fs'
#...........................................................................................................
TRM                       = require './TRM'
rpr                       = TRM.rpr.bind TRM
badge                     = 'BITSNPIECES/test'
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
# eq = ( P... ) =>
#   whisper P
#   # throw new Error "not equal: \n#{( ( rpr p ) for p in P ).join '\n'}" unless CND.equals P...
#   unless CND.equals P...
#     warn "not equal: \n#{( ( rpr p ) for p in P ).join '\n'}"
#     return 1
#   return 0

# #-----------------------------------------------------------------------------------------------------------
# @_test = ->
#   error_count = 0
#   for name, method of @
#     continue if name.startsWith '_'
#     whisper name
#     try
#       method()
#     catch error
#       # throw error
#       error_count += +1
#       warn error[ 'message' ]
#   help "tests completed successfully" if error_count is 0
#   process.exit error_count

#-----------------------------------------------------------------------------------------------------------
@[ 'test type_of' ] = ( T ) ->
  T.eq ( CND.type_of new WeakMap()            ), 'weakmap'
  T.eq ( CND.type_of new Map()                ), 'map'
  T.eq ( CND.type_of new Set()                ), 'set'
  T.eq ( CND.type_of new Date()               ), 'date'
  T.eq ( CND.type_of new Error()              ), 'error'
  T.eq ( CND.type_of []                       ), 'list'
  T.eq ( CND.type_of true                     ), 'boolean'
  T.eq ( CND.type_of false                    ), 'boolean'
  T.eq ( CND.type_of ( -> )                   ), 'function'
  T.eq ( CND.type_of ( -> yield 123 )()       ), 'generator'
  T.eq ( CND.type_of null                     ), 'null'
  T.eq ( CND.type_of 'helo'                   ), 'text'
  T.eq ( CND.type_of undefined                ), 'undefined'
  T.eq ( CND.type_of arguments                ), 'arguments'
  T.eq ( CND.type_of global                   ), 'global'
  T.eq ( CND.type_of /^xxx$/g                 ), 'regex'
  T.eq ( CND.type_of {}                       ), 'pod'
  T.eq ( CND.type_of NaN                      ), 'nan'
  T.eq ( CND.type_of 1 / 0                    ), 'infinity'
  T.eq ( CND.type_of -1 / 0                   ), 'infinity'
  T.eq ( CND.type_of 12345                    ), 'number'
  T.eq ( CND.type_of new Buffer 'helo'        ), 'buffer'
  T.eq ( CND.type_of new ArrayBuffer 42       ), 'arraybuffer'
  return null

#-----------------------------------------------------------------------------------------------------------
@[ 'test size_of' ] = ( T ) ->
  # debug ( new Buffer '𣁬', ), ( '𣁬'.codePointAt 0 ).toString 16
  # debug ( new Buffer '𡉜', ), ( '𡉜'.codePointAt 0 ).toString 16
  # debug ( new Buffer '𠑹', ), ( '𠑹'.codePointAt 0 ).toString 16
  # debug ( new Buffer '𠅁', ), ( '𠅁'.codePointAt 0 ).toString 16
  T.eq ( CND.size_of [ 1, 2, 3, 4, ]                                    ), 4
  T.eq ( CND.size_of new Buffer [ 1, 2, 3, 4, ]                         ), 4
  T.eq ( CND.size_of '𣁬𡉜𠑹𠅁'                                             ), 2 * ( Array.from '𣁬𡉜𠑹𠅁' ).length
  T.eq ( CND.size_of '𣁬𡉜𠑹𠅁', count: 'codepoints'                        ), ( Array.from '𣁬𡉜𠑹𠅁' ).length
  T.eq ( CND.size_of '𣁬𡉜𠑹𠅁', count: 'codeunits'                         ), 2 * ( Array.from '𣁬𡉜𠑹𠅁' ).length
  T.eq ( CND.size_of '𣁬𡉜𠑹𠅁', count: 'bytes'                             ), ( new Buffer '𣁬𡉜𠑹𠅁', 'utf-8' ).length
  T.eq ( CND.size_of 'abcdefghijklmnopqrstuvwxyz'                       ), 26
  T.eq ( CND.size_of 'abcdefghijklmnopqrstuvwxyz', count: 'codepoints'  ), 26
  T.eq ( CND.size_of 'abcdefghijklmnopqrstuvwxyz', count: 'codeunits'   ), 26
  T.eq ( CND.size_of 'abcdefghijklmnopqrstuvwxyz', count: 'bytes'       ), 26
  T.eq ( CND.size_of 'ä'                                                ), 1
  T.eq ( CND.size_of 'ä', count: 'codepoints'                           ), 1
  T.eq ( CND.size_of 'ä', count: 'codeunits'                            ), 1
  T.eq ( CND.size_of 'ä', count: 'bytes'                                ), 2
  T.eq ( CND.size_of new Map [ [ 'foo', 42, ], [ 'bar', 108, ], ]       ), 2
  T.eq ( CND.size_of new Set [ 'foo', 42, 'bar', 108, ]                 ), 4
  T.eq ( CND.size_of { 'foo': 42, 'bar': 108, 'baz': 3, }                           ), 3
  T.eq ( CND.size_of { '~isa': 'XYZ/yadda', 'foo': 42, 'bar': 108, 'baz': 3, }      ), 4

#-----------------------------------------------------------------------------------------------------------
@[ 'XJSON' ] = ( T ) ->
  CND.XJSON = require './XJSON'
  e         = new Set 'xy'
  e.add new Set 'abc'
  d         = [ 'A', 'B', e, ]
  help d
  # debug HOLLERITH.CODEC.encode d
  # debug HOLLERITH.CODEC.decode HOLLERITH.CODEC.encode d
  # help JSON.stringify d
  # help JSON.stringify d, @replacer
  # urge JSON.parse ( JSON.stringify d, @replacer ), @reviver
  info CND.XJSON.stringify d
  info CND.XJSON.parse CND.XJSON.stringify d
  T.eq (     CND.XJSON.stringify d                 ), """["A","B",{"~isa":"set","%self":["x","y",{"~isa":"set","%self":["a","b","c"]}]}]"""
  ### TAINT doing string comparison here to avoid implicit test that T.eq deals with sets correctly ###
  T.eq ( rpr CND.XJSON.parse CND.XJSON.stringify d ), """[ 'A', 'B', Set { 'x', 'y', Set { 'a', 'b', 'c' } } ]"""

#-----------------------------------------------------------------------------------------------------------
@[ 'is_subset' ] = ( T ) ->
  T.eq false, CND.is_subset ( Array.from 'abcde' ), ( Array.from 'abcd' )
  T.eq false, CND.is_subset ( Array.from 'abcx'  ), ( Array.from 'abcd' )
  T.eq false, CND.is_subset ( Array.from 'abcd'  ), ( []                )
  T.eq true,  CND.is_subset ( Array.from 'abcd'  ), ( Array.from 'abcd' )
  T.eq true,  CND.is_subset ( Array.from 'abc'   ), ( Array.from 'abcd' )
  T.eq true,  CND.is_subset ( []                 ), ( Array.from 'abcd' )
  T.eq true,  CND.is_subset ( []                 ), ( Array.from []     )
  T.eq false, CND.is_subset ( new Set 'abcde'    ), ( new Set 'abcd'    )
  T.eq false, CND.is_subset ( new Set 'abcx'     ), ( new Set 'abcd'    )
  T.eq false, CND.is_subset ( new Set 'abcx'     ), ( new Set()         )
  T.eq true,  CND.is_subset ( new Set 'abcd'     ), ( new Set 'abcd'    )
  T.eq true,  CND.is_subset ( new Set 'abc'      ), ( new Set 'abcd'    )
  T.eq true,  CND.is_subset ( new Set()          ), ( new Set 'abcd'    )
  T.eq true,  CND.is_subset ( new Set()          ), ( new Set()         )


#===========================================================================================================
# MAIN
#-----------------------------------------------------------------------------------------------------------
@_main = ( handler ) ->
  test @, 'timeout': 2500

#-----------------------------------------------------------------------------------------------------------
@_prune = ->
  for name, value of @
    continue if name.startsWith '_'
    delete @[ name ] unless name in include
  return null

############################################################################################################
unless module.parent?
  include = [
    # 'test type_of'
    'XJSON'
    ]
  # @_prune()
  @_main()

