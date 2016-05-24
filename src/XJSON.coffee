

############################################################################################################
CND                       = require './main'
rpr                       = CND.rpr
# badge                     = 'scratch'
# log                       = CND.get_logger 'plain',     badge
# info                      = CND.get_logger 'info',      badge
# whisper                   = CND.get_logger 'whisper',   badge
# alert                     = CND.get_logger 'alert',     badge
# debug                     = CND.get_logger 'debug',     badge
# warn                      = CND.get_logger 'warn',      badge
# help                      = CND.get_logger 'help',      badge
# urge                      = CND.get_logger 'urge',      badge
# echo                      = CND.echo.bind CND
# rainbow                   = CND.rainbow.bind CND
# suspend                   = require 'coffeenode-suspend'
# step                      = suspend.step
# after                     = suspend.after
# eventually                = suspend.eventually
# immediately               = suspend.immediately
# every                     = suspend.every

#-----------------------------------------------------------------------------------------------------------
@replacer = ( key, value ) ->
  # return JSON.stringify value unless ( CND.type_of d ) is 'set'
  return value unless ( CND.type_of value ) is 'set'
  R =
    '~isa':   'set'
    '%self':  ( Array.from value )
  return R

#-----------------------------------------------------------------------------------------------------------
@reviver = ( key, value ) ->
  return value unless ( CND.isa_pod value ) and ( value[ '~isa' ] is 'set' )
  return new Set value[ '%self' ]

#-----------------------------------------------------------------------------------------------------------
@stringify = ( value, replacer, spaces ) ->
  replacer ?= @replacer
  return JSON.stringify value, replacer, spaces

#-----------------------------------------------------------------------------------------------------------
@parse = ( text, reviver ) ->
  reviver ?= @reviver
  return JSON.parse text, reviver

#-----------------------------------------------------------------------------------------------------------
@_demo = ->
  XJSON = @
  e = new Set 'xy'
  e.add new Set 'abc'
  d = [ 'A', 'B', e, ]
  help d
  # debug HOLLERITH.CODEC.encode d
  # debug HOLLERITH.CODEC.decode HOLLERITH.CODEC.encode d
  # help JSON.stringify d
  # help JSON.stringify d, @replacer
  # urge JSON.parse ( JSON.stringify d, @replacer ), @reviver
  info XJSON.stringify d
  info XJSON.parse XJSON.stringify d

#-----------------------------------------------------------------------------------------------------------
@replacer   = @replacer.bind  @
@reviver    = @reviver.bind   @
@stringify  = @stringify.bind @
@parse      = @parse.bind     @
@_demo      = @_demo.bind     @


############################################################################################################
unless module.parent?
  @_demo()


