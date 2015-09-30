
############################################################################################################
CND                       = require './main'
# rpr                       = CND.rpr
# urge                      = CND.get_logger 'urge',      badge
# echo                      = CND.echo.bind CND


#-----------------------------------------------------------------------------------------------------------
is_decorated_sym  = Symbol 'is_decorated'
is_clean_sym      = Symbol 'is_clean'
parent_sym        = Symbol 'parent'
get_m_sym         = Symbol 'get_m'
m_sym             = Symbol 'm'
intersections_sym = Symbol 'intersections'

#-----------------------------------------------------------------------------------------------------------
@new_tree = ->
  return { '~isa': 'CND/interval-tree', '%self': ( require 'functional-red-black-tree' )(), }

#-----------------------------------------------------------------------------------------------------------
@add_interval = ( me, interval )  ->
  me[ '%self' ]                           = me[ '%self' ].insert interval[ 0 ], interval
  me[ '%self' ][ 'root' ][ is_clean_sym ] = false
  return me

#-----------------------------------------------------------------------------------------------------------
get_m = ->
  return ( R = @[ m_sym ] ) if R?
  left_m  = @[ 'left'  ]?[ get_m_sym ]() ? -Infinity
  right_m = @[ 'right' ]?[ get_m_sym ]() ? -Infinity
  return @[ m_sym ] = Math.max left_m, right_m, @[ 'value' ][ 1 ]

#-----------------------------------------------------------------------------------------------------------
@_get_m = ( node ) -> node[ get_m_sym ]()

#-----------------------------------------------------------------------------------------------------------
@_get_parent = ( node ) -> node[ parent_sym ]

#-----------------------------------------------------------------------------------------------------------
@_decorate = ( node ) ->
  ### TAINT single signalling symbol is enough ###
  return null if node[ is_decorated_sym  ] and node[ is_clean_sym ]
  console.log 'decorate'
  node[ get_m_sym     ] = get_m
  node[ m_sym         ] = null
  if ( left_node = node[ 'left' ] )?
    left_node[ parent_sym ]    = node
    @_decorate left_node
  if ( right_node = node[ 'right' ] )?
    right_node[ parent_sym ]   = node
    @_decorate right_node
  node[ is_clean_sym      ] = true
  node[ is_decorated_sym  ] = true
  return null

#-----------------------------------------------------------------------------------------------------------
@find = ( me, probe ) ->
  root          = me[ '%self' ][ 'root' ]
  probe         = [ probe, probe, ] unless CND.isa_list probe
  R             = new Set()
  # intersections = new Set()
  @_decorate root
  @_find root, probe, R
  # for node in Array.from R.keys()
  #   ( ( require './TRM' ).get_logger 'debug' ) @find me, node[ 'value' ][ 0 .. 1 ]
  #   intersections = @_get_
  return ( node[ 'value' ] for node in Array.from R.keys() )

#-----------------------------------------------------------------------------------------------------------
@_find = ( node, probe, R ) ->
  [ probe_lo, probe_hi, ] = probe
  [  node_lo,  node_hi, ] = node[ 'value' ]
  unless probe_lo > node_hi or probe_hi < node_lo
    R.add node
    ( ( require './TRM' ).get_logger 'help' ) node[ 'value' ][ 2 ]
  else
    ( ( require './TRM' ).get_logger 'warn' ) node[ 'value' ][ 2 ]
  left_node   = node[ 'left' ]
  right_node  = node[ 'right' ]
  return R if ( not left_node? ) and ( not right_node? )
  return @_find right_node, probe, R if not node[ 'left' ]?
  return @_find right_node, probe, R if right_node? and left_node[ get_m_sym ]() < probe_lo
  return @_find  left_node, probe, R if left_node?
  return R

#-----------------------------------------------------------------------------------------------------------
@_demo = ->
  badge = 'CND/INTERVALTREE/demo'
  help  = CND.get_logger 'help',      badge
  urge  = CND.get_logger 'urge',      badge
  ITREE = @
  show  = ( node ) ->
    this_key    = node[ 'key' ]
    this_value  = node[ 'value' ]
    this_m      = node[ get_m_sym ]()
    help this_key, this_value, this_m
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
  show tree[ '%self' ][ 'root' ]
  search()
  ITREE.add_interval tree, [ 10, 13, 'FF' ]
  search()
  return null

############################################################################################################
unless module.parent?
  CND.dir @
  @_demo()
