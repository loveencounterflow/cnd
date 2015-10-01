


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
SL                        = CND.INTERSKIPLIST


#-----------------------------------------------------------------------------------------------------------
eq = ( P... ) =>
  whisper P
  # throw new Error "not equal: \n#{( ( rpr p ) for p in P ).join '\n'}" unless CND.equals P...
  unless CND.equals P...
    warn "not equal: \n#{( ( rpr p ) for p in P ).join '\n'}"
    return 1
  return 0

#-----------------------------------------------------------------------------------------------------------
@_test = ->
  error_count = 0
  for name, method of @
    continue if name.startsWith '_'
    whisper name
    try
      method()
    catch error
      # throw error
      error_count += +1
      warn error[ 'message' ]
  help "tests completed successfully" if error_count is 0
  process.exit error_count

#-----------------------------------------------------------------------------------------------------------
@[ 'test interval tree 1' ] = ->
  find      = ( skiplist, probe ) ->
    R = SL.find_any_ids skiplist, probe
    R.sort()
    return R.join ','
  skiplist  = SL.new()
  intervals = [
    [ 1, 3, 'A', ]
    [ 2, 14, 'B', ]
    [ 3, 7, 'C', ]
    [ 4, 4, 'D', ]
    [ 5, 7, 'E', ]
    [ 8, 12, 'F1', ]
    [ 8, 12, 'F2', ]
    [ 8, 22, 'G', ]
    [ 10, 13, 'H', ]
    ]
  for [ lo, hi, id, value, ] in intervals
    SL.add_interval skiplist, lo, hi, id, value
  # search()
  error_count = 0
  error_count += eq ( find skiplist, 0 ), ''
  error_count += eq ( find skiplist, 1 ), 'A'
  error_count += eq ( find skiplist, 2 ), 'A,B'
  error_count += eq ( find skiplist, 3 ), 'A,B,C'
  error_count += eq ( find skiplist, 4 ), 'B,C,D'
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
  # debug rpr find skiplist, 0
  # debug rpr find skiplist, 1
  # debug rpr find skiplist, 2
  # debug rpr find skiplist, 3
  # debug rpr find skiplist, 4
  # debug rpr find skiplist, 5
  # debug rpr find skiplist, 6
  # debug rpr find skiplist, 7
  # debug rpr find skiplist, 8
  # debug rpr find skiplist, 9
  # debug rpr find skiplist, 10
  # debug rpr find skiplist, 11
  # debug rpr find skiplist, 12
  # debug rpr find skiplist, 13
  # debug rpr find skiplist, 14
  # debug rpr find skiplist, 15
  # debug rpr find skiplist, 16
  # debug rpr find skiplist, 17
  # debug rpr find skiplist, 18
  # SL.add_interval skiplist, [ 10, 13, 'FF' ]
  # search()
  throw Error "there were #{error_count} errors" unless error_count is 0
  return null

#-----------------------------------------------------------------------------------------------------------
@[ '_test interval tree 2' ] = ->
  tree      = SL.new_tree()
  intervals = [
    [ 17, 19, 'A', ]
    [  5,  8, 'B', ]
    [ 21, 24, 'C', ]
    [  4,  8, 'D', ]
    [ 15, 18, 'E', ]
    [  7, 10, 'F', ]
    [ 16, 22, 'G', ]
    ]
  SL.add_interval tree, interval for interval in intervals
  SL._decorate tree[ '%self' ][ 'root' ]
  # search()
  show tree[ '%self' ][ 'root' ]
  error_count = 0
  # error_count += eq ( find tree, 0 ), ''
  # debug rpr find tree, [ 23, 25, ] # 'C'
  # debug rpr find tree, [ 12, 14, ] # ''
  # debug rpr find tree, [ 21, 23, ] # 'G,C'
  debug rpr find tree, [ 8, 9, ] # 'B,D,F'
  debug rpr find tree, [  5,  8, ]
  debug rpr find tree, [ 21, 24, ]
  debug rpr find tree, [  4,  8, ]
  # search()
  throw Error "there were #{error_count} errors" unless error_count is 0
  return null


############################################################################################################
unless module.parent?
  @_test()

