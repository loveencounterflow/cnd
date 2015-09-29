
############################################################################################################
CND                       = require './main'
# rpr                       = CND.rpr
# urge                      = CND.get_logger 'urge',      badge
# echo                      = CND.echo.bind CND


#-----------------------------------------------------------------------------------------------------------
is_decorated_sym  = Symbol 'is_decorated'
parent_sym        = Symbol 'parent'
get_m_sym         = Symbol 'get_m'
m_sym             = Symbol 'm'

#-----------------------------------------------------------------------------------------------------------
@new_tree = ->
  return { '~isa': 'CND/interval-tree', '%self': ( require 'functional-red-black-tree' )(), }

#-----------------------------------------------------------------------------------------------------------
@add_interval = ( me, interval )  ->
  me[ '%self' ] = me[ '%self' ].insert interval[ 0 ], interval
  return me

#-----------------------------------------------------------------------------------------------------------
get_m = ->
  return ( R = @[ m_sym ] ) if R?
  left_m  = @[ 'left'  ]?[ get_m_sym ]() ? -Infinity
  right_m = @[ 'right' ]?[ get_m_sym ]() ? -Infinity
  return @[ m_sym ] = Math.max left_m, right_m, @[ 'value' ][ 1 ]

#-----------------------------------------------------------------------------------------------------------
@_decorate = ( node ) ->
  return null if node[ is_decorated_sym  ]
  node[ is_decorated_sym  ] = true
  node[ get_m_sym     ] = get_m
  if ( left_node = node[ 'left' ] )?
    left_node[ parent_sym ]    = node
    left_node[ get_m_sym  ]    = get_m
    @_decorate left_node
  if ( right_node = node[ 'right' ] )?
    right_node[ parent_sym ]   = node
    right_node[ get_m_sym  ]   = get_m
    @_decorate right_node
  return null

#-----------------------------------------------------------------------------------------------------------
@find = ( me, probe ) ->
  root  = me[ '%self' ][ 'root' ]
  @_decorate root
  probe = [ probe, probe, ] unless CND.isa_list probe
  return @_find root, probe, []

#-----------------------------------------------------------------------------------------------------------
@_find = ( node, probe, R ) ->
  [ probe_lo, probe_hi, ] = probe
  [  node_lo,  node_hi, ] = node[ 'value' ]
  unless probe_lo > node_hi or probe_hi < node_lo
    R.push node
  left_node   = node[ 'left' ]
  right_node  = node[ 'right' ]
  return R if ( not left_node? ) and ( not right_node? )
  return @_find right_node, probe, R if not node[ 'left' ]?
  return @_find right_node, probe, R if left_node[ get_m_sym ]() < probe_lo
  return @_find  left_node, probe, R

#-----------------------------------------------------------------------------------------------------------
@_demo = ->
  badge = 'CND/INTERVALTREE/demo'
  help  = CND.get_logger 'help',      badge
  urge  = CND.get_logger 'urge',      badge
  show  = ( node ) ->
    this_key    = node[ 'key' ]
    this_value  = node[ 'value' ]
    this_m      = node[ get_m_sym ]()
    help this_key, this_value, this_m
    show left_node  if (  left_node = node[ 'left'  ] )?
    show right_node if ( right_node = node[ 'right' ] )?
    return null
  tree      = @new_tree()
  intervals = [
    [ 3, 7, 'A', ]
    [ 5, 7, 'B', ]
    [ 8, 12, 'C', ]
    [ 2, 14, 'D', ]
    [ 4, 4, 'E', ]
    ]
  @add_interval tree, interval for interval in intervals
  @_decorate tree[ '%self' ][ 'root' ]
  show tree[ '%self' ][ 'root' ]
  for n in [ 0 .. 15 ]
    help n
    for node in @find tree, n
      urge '  ', node[ 'key' ], node[ 'value' ]
  return null

############################################################################################################
unless module.parent?
  CND.dir @
  @_demo()
