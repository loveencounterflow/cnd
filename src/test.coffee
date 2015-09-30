


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
ITREE                     = CND.INTERVALTREE


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
find = ( tree, probe ) ->
  return ( interval[ 2 ] for interval in ITREE.find tree, probe ).join ','

#-----------------------------------------------------------------------------------------------------------
show  = ( node ) ->
  this_key    = node[ 'key' ]
  this_value  = node[ 'value' ]
  this_m      = ITREE._get_m node
  help this_value, this_m, '->', ( ITREE._get_parent node )?[ 'value' ] ? './.'
  show left_node  if (  left_node = node[ 'left'  ] )?
  show right_node if ( right_node = node[ 'right' ] )?
  return null

#-----------------------------------------------------------------------------------------------------------
@[ '_test interval tree 1' ] = ->
  search = ->
    for n in [ 0 .. 15 ]
      help n
      for node in ITREE.find tree, n
        urge '  ', node[ 'key' ], node[ 'value' ]
  tree      = ITREE.new_tree()
  intervals = [
    [ 1, 3, 'A', ]
    [ 2, 14, 'B', ]
    [ 3, 7, 'C', ]
    [ 4, 4, 'D', ]
    [ 5, 7, 'E', ]
    [ 8, 12, 'F1', ]
    # [ 8, 12, 'F2', ]
    [ 8, 22, 'G', ]
    [ 10, 13, 'H', ]
    ]
  ITREE.add_interval tree, interval for interval in intervals
  ITREE._decorate tree[ '%self' ][ 'root' ]
  # search()
  show tree[ '%self' ][ 'root' ]
  error_count = 0
  error_count += eq ( find tree, 0 ), ''
  error_count += eq ( find tree, 1 ), 'A'
  error_count += eq ( find tree, 2 ), 'B,A'
  error_count += eq ( find tree, 3 ), 'B,A,C'
  error_count += eq ( find tree, 4 ), 'D,B,C'
  error_count += eq ( find tree, 5 ), 'B,C,E'
  error_count += eq ( find tree, 6 ), 'B,C,E'
  error_count += eq ( find tree, 7 ), 'B,C,E'
  error_count += eq ( find tree, 8 ), 'B,F1,F2,G'
  error_count += eq ( find tree, 9 ), 'B,F1,F2,G'
  error_count += eq ( find tree, 10 ), 'B,F1,F2,G,H'
  error_count += eq ( find tree, 11 ), 'B,F1,F2,G,H'
  error_count += eq ( find tree, 12 ), 'B,F1,F2,G,H'
  error_count += eq ( find tree, 13 ), 'B,G,H'
  error_count += eq ( find tree, 14 ), 'B,G'
  error_count += eq ( find tree, 15 ), 'G'
  error_count += eq ( find tree, 16 ), 'G'
  error_count += eq ( find tree, 17 ), 'G'
  error_count += eq ( find tree, 18 ), 'G'
  # debug rpr find tree, 0
  # debug rpr find tree, 1
  # debug rpr find tree, 2
  # debug rpr find tree, 3
  # debug rpr find tree, 4
  # debug rpr find tree, 5
  # debug rpr find tree, 6
  # debug rpr find tree, 7
  # debug rpr find tree, 8
  # debug rpr find tree, 9
  # debug rpr find tree, 10
  # debug rpr find tree, 11
  # debug rpr find tree, 12
  # debug rpr find tree, 13
  # debug rpr find tree, 14
  # debug rpr find tree, 15
  # debug rpr find tree, 16
  # debug rpr find tree, 17
  # debug rpr find tree, 18
  # ITREE.add_interval tree, [ 10, 13, 'FF' ]
  # search()
  throw Error "there were #{error_count} errors" unless error_count is 0
  return null

#-----------------------------------------------------------------------------------------------------------
@[ 'test interval tree 2' ] = ->
  tree      = ITREE.new_tree()
  intervals = [
    [ 17, 19, 'A', ]
    [  5,  8, 'B', ]
    [ 21, 24, 'C', ]
    [  4,  8, 'D', ]
    [ 15, 18, 'E', ]
    [  7, 10, 'F', ]
    [ 16, 22, 'G', ]
    ]
  ITREE.add_interval tree, interval for interval in intervals
  ITREE._decorate tree[ '%self' ][ 'root' ]
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


# ############################################################################################################
# unless module.parent?
#   cl_options  = {}
#   docopt      = ( require 'coffeenode-docopt' ).docopt
#   version     = ( require '../package.json' )[ 'version' ]
#   filename    = ( require 'path' ).basename __filename
#   usage       = """
#   Usage: node #{filename} [options] [<hints>]...

#   Options:
#     -l, --long-errors       Show error messages with stacks.
#     -h, --help
#     -v, --version
#   """
#   # @cl_options = docopt usage, version: ( require '../package.json' )[ 'version' ]
#   # @main()
#   #.........................................................................................................
#   settings = docopt usage, version: version, help: ( left, collected ) ->
#     urge left
#     help collected
#     help '\n' + usage
#   # debug settings
#   #.........................................................................................................
#   if settings?
#     if settings[ 'fresh'          ] then cli_options[ 'erase-db'      ] = true
#     #.........................................................................................................
#     options[ 'cli' ] = cli_options
#     @main()


# test_tsort = ->
#   TS = CND.TSORT
#   settings =
#     strict:   yes
#     prefixes: [ 'f|', 'g|', ]
#   graph = TS.new_graph settings

#   # TS.link_down graph, 'id', '$'
#   # TS.link_up graph, '$', 'id'
#   # TS.link graph, '$', '>', 'id'
#   # debug '©TJLyH', TS.link graph, '$', '<', 'id'
#   # debug '©TJLyH', TS.link graph, 'id', '<', '$'
#   # help TS.sort graph
#   TS.link graph, 'id', '-', 'id'
#   TS.link graph, 'id', '>', '+'
#   TS.link graph, 'id', '>', '*'
#   TS.link graph, 'id', '>', '$'
#   TS.link graph, '+', '<', 'id'
#   TS.link graph, '+', '>', '+'
#   TS.link graph, '+', '<', '*'
#   TS.link graph, '+', '>', '$'
#   TS.link graph, '*', '<', 'id'
#   TS.link graph, '*', '>', '+'
#   TS.link graph, '*', '>', '*'
#   TS.link graph, '*', '>', '$'
#   TS.link graph, '$', '<', 'id'
#   TS.link graph, '$', '<', '+'
#   TS.link graph, '$', '<', '*'
#   TS.link graph, '$', '-', '$'
#   debug '©DE1h1', graph

#   help nodes = TS.sort graph
#   matcher = [ 'f|id', 'g|id', 'f|*', 'g|*', 'f|+', 'g|+', 'g|$', 'f|$' ]
#   unless CND.equals nodes, matcher
#     throw new Error """is: #{rpr nodes}
#       expected:  #{rpr matcher}"""
# #   # add graph, '$', '-', '$'
# #   try
# #     TS.link_dual graph, '$', '>', '$'
# #     TS.link_dual graph, '$', '<', '$'
# #   catch error
# #     { message } = error
# #     if /^detected cycle involving node/.test message
# #       warn error
# #     else
# #       throw error
# #   # help nodes = TS.sort graph
# test_tsort()

# # `for ( var chr of 'ab𠀀cd' ) { debug( chr ); };`
