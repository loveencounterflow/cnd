
############################################################################################################
CND                       = require './main'
# rpr                       = CND.rpr
# urge                      = CND.get_logger 'urge',      badge
# echo                      = CND.echo.bind CND


#-----------------------------------------------------------------------------------------------------------
@new = ( settings ) ->
  throw new Error "settings not yet supported" if settings?
  substrate = new ( require 'interval-skip-list' )()
  R =
    '~isa':         'CND/interskiplist'
    '%self':        substrate
    'value-by-ids': {}
  return R

#-----------------------------------------------------------------------------------------------------------
@add_interval = ( me, lo, hi, id, value )  ->
  throw new Error "need an ID" unless id?
  value     = id if value is undefined
  me[ '%self' ].insert id, lo, hi
  me[ 'value-by-ids' ][ id ] = value
  return id

#-----------------------------------------------------------------------------------------------------------
@find_any_ids = ( me, probes... ) ->
  ### Note: `Intervalskiplist::findIntersecting` needs more than a single probe, so we fall back to
  `::findContaining` in case a single probe was given. ###
  return @find_all_ids me, probes... if probes.length < 2
  return me[ '%self' ].findIntersecting probes...

#-----------------------------------------------------------------------------------------------------------
@find_all_ids = ( me, probes... ) ->
  return me[ '%self' ].findContaining probes...

#-----------------------------------------------------------------------------------------------------------
@find_any_intervals = ( me, probes... ) ->
  interval_by_ids = me[ '%self' ][ 'intervalsByMarker' ]
  return ( interval_by_ids[ id ] for id in @find_any_ids me, probes )

#-----------------------------------------------------------------------------------------------------------
@find_all_intervals = ( me, probes... ) ->
  interval_by_ids = me[ '%self' ][ 'intervalsByMarker' ]
  return ( interval_by_ids[ id ] for id in @find_all_ids me, probes )

#-----------------------------------------------------------------------------------------------------------
@find_any_values = ( me, probes... ) ->
  value_by_ids = me[ 'value-by-ids' ]
  return ( value_by_ids[ id ] for id in @find_any_ids me, probes )

#-----------------------------------------------------------------------------------------------------------
@find_all_values = ( me, probes... ) ->
  value_by_ids = me[ 'value-by-ids' ]
  return ( value_by_ids[ id ] for id in @find_all_ids me, probes )

#-----------------------------------------------------------------------------------------------------------
@_demo = ->
  badge = 'CND/INTERSKIPLIST/demo'
  help  = CND.get_logger 'help',      badge
  urge  = CND.get_logger 'urge',      badge
  SL    = @
  show  = ( node ) ->
    this_key    = node[ 'key' ]
    this_value  = node[ 'value' ]
    this_m      = node[ get_m_sym ]()
    help this_key, this_value, this_m
    show left_node  if (  left_node = node[ 'left'  ] )?
    show right_node if ( right_node = node[ 'right' ] )?
    return null
  skiplist  = SL.new()
  # intervals = [
  #   [ 3, 7, 'A', ]
  #   [ 5, 7, 'B', ]
  #   [ 8, 12, 'C1', ]
  #   [ 8, 12, 'C2', ]
  #   [ 2, 14, 'D', null ]
  #   [ 4, 4, 'E', [ 'helo', ] ]
  #   [ 10, 13, 'F', ]
  #   [ 8, 22, 'G', ]
  #   [ 1, 3, 'H', ]
  #   ]
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
  for n in [ 0 .. 15 ]
    help n, \
      ( ( SL.find_any_ids skiplist, n ).join ',' ), \
      ( SL.find_any_intervals skiplist, n ), \
      ( SL.find_any_values skiplist, n )
  # show skiplist[ '%self' ][ 'root' ]
  # SL.add_interval skiplist, [ 10, 13, 'FF' ]
  return null

############################################################################################################
unless module.parent?
  @_demo()


###

#-----------------------------------------------------------------------------------------------------------
@[ '_test interval skiplist 1' ] = ->
  search = ->
    for n in [ 0 .. 15 ]
      help n
      for node in SL.find skiplist, n
        urge '  ', node[ 'key' ], node[ 'value' ]
  skiplist      = SL.new_tree()
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
  SL.add_interval skiplist, interval for interval in intervals
  SL._decorate skiplist[ '%self' ][ 'root' ]
  # search()
  show skiplist[ '%self' ][ 'root' ]
  error_count = 0
  error_count += eq ( find skiplist, 0 ), ''
  error_count += eq ( find skiplist, 1 ), 'A'
  error_count += eq ( find skiplist, 2 ), 'B,A'
  error_count += eq ( find skiplist, 3 ), 'B,A,C'
  error_count += eq ( find skiplist, 4 ), 'D,B,C'
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
@[ 'test interval skiplist 2' ] = ->
  skiplist      = SL.new_tree()
  intervals = [
    [ 17, 19, 'A', ]
    [  5,  8, 'B', ]
    [ 21, 24, 'C', ]
    [  4,  8, 'D', ]
    [ 15, 18, 'E', ]
    [  7, 10, 'F', ]
    [ 16, 22, 'G', ]
    ]
  SL.add_interval skiplist, interval for interval in intervals
  SL._decorate skiplist[ '%self' ][ 'root' ]
  # search()
  show skiplist[ '%self' ][ 'root' ]
  error_count = 0
  # error_count += eq ( find skiplist, 0 ), ''
  # debug rpr find skiplist, [ 23, 25,c ] # 'G,C'
  debug rpr find skiplist, [ 8, 9, ] # 'B,D,F'
  debug rpr find skiplist, [  5,  8, ]
  debug rpr find skiplist, [ 21, 24, ]
  debug rpr find skiplist, [  4,  8, ]
  # search()
  throw Error "there were #{error_count} errors" unless error_count is 0
  return null




###