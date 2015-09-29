


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
# $new                      = require './new'
# LOADER                    = require './LOADER'
assert                    = require 'assert'
#...........................................................................................................
# docopt                    = ( require 'docopt' ).docopt
CND                       = require './main'
# # ESCODEGEN                 = require 'escodegen'
# # escodegen_options         = ( require '../options' )[ 'escodegen' ]
# @new                      = require './new'
# #...........................................................................................................
# @cl_options               = null

#-----------------------------------------------------------------------------------------------------------
eq = ( P... ) =>
  whisper P
  throw new Error "not equal: \n#{( ( rpr p ) for p in P ).join '\n'}" unless CND.equals P...

#-----------------------------------------------------------------------------------------------------------
# throws = assert.throws.bind assert

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
@[ 'test interval tree' ] = ->
  ITREE = CND.INTERVALTREE
  show  = ( node ) ->
    this_key    = node[ 'key' ]
    this_value  = node[ 'value' ]
    this_m      = ITREE._get_m node
    help this_value, this_m, '->', ( ITREE._get_parent node )?[ 'value' ] ? './.'
    show left_node  if (  left_node = node[ 'left'  ] )?
    show right_node if ( right_node = node[ 'right' ] )?
    return null
  search = ->
    for n in [ 0 .. 15 ]
      help n
      for node in ITREE.find tree, n
        urge '  ', node[ 'key' ], node[ 'value' ]
  tree      = ITREE.new_tree()
  intervals = [
    [ 3, 7, 'A', ]
    [ 5, 7, 'B', ]
    [ 8, 12, 'C1', ]
    [ 8, 12, 'C2', ]
    [ 2, 14, 'D', ]
    [ 4, 4, 'E', ]
    [ 10, 13, 'F', ]
    [ 8, 22, 'G', ]
    [ 1, 3, 'H', ]
    ]
  ITREE.add_interval tree, interval for interval in intervals
  ITREE._decorate tree[ '%self' ][ 'root' ]
  # search()
  show tree[ '%self' ][ 'root' ]
  eq ( ITREE.find tree, 0 ), []
  eq ( ITREE.find tree, 1 ), [[1,3,"H"]]
  eq ( ITREE.find tree, 2 ), [[2,14,"D"],[1,3,"H"]]
  eq ( ITREE.find tree, 3 ), [[3,7,"A"],[2,14,"D"],[1,3,"H"]]
  eq ( ITREE.find tree, 4 ), [[3,7,"A"],[2,14,"D"]]
  eq ( ITREE.find tree, 5 ), [[5,7,"B"],[3,7,"A"],[2,14,"D"]]
  eq ( ITREE.find tree, 6 ), [[5,7,"B"],[3,7,"A"],[2,14,"D"]]
  eq ( ITREE.find tree, 7 ), [[5,7,"B"],[3,7,"A"],[2,14,"D"]]
  eq ( ITREE.find tree, 8 ), [[2,14,"D"],[8,22,"G"]]
  eq ( ITREE.find tree, 9 ), [[2,14,"D"],[8,22,"G"]]
  eq ( ITREE.find tree, 10 ), [[2,14,"D"],[8,22,"G"]]
  eq ( ITREE.find tree, 11 ), [[2,14,"D"],[8,22,"G"]]
  eq ( ITREE.find tree, 12 ), [[2,14,"D"],[8,22,"G"]]
  eq ( ITREE.find tree, 13 ), [[2,14,"D"],[8,22,"G"]]
  eq ( ITREE.find tree, 14 ), [[2,14,"D"],[8,22,"G"]]
  eq ( ITREE.find tree, 15 ), [[8,22,"G"]]
  eq ( ITREE.find tree, 16 ), [[8,22,"G"]]
  eq ( ITREE.find tree, 17 ), [[8,22,"G"]]
  eq ( ITREE.find tree, 18 ), [[8,22,"G"]]
  # ITREE.add_interval tree, [ 10, 13, 'FF' ]
  # search()
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
