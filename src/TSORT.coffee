

### Adapted from https://github.com/eknkc/tsort ###

#-----------------------------------------------------------------------------------------------------------
CND                       = require './main'


#-----------------------------------------------------------------------------------------------------------
@new_graph = ( settings ) ->
  settings ?= {}
  strict    = settings[ 'strict'    ] ? yes
  prefixes  = settings[ 'prefixes'  ] ? null
  R =
    '~isa':     'CND/tsort-graph'
    'ps-by-cs': {}
    'strict':   strict
    'prefixes': prefixes
  return R

#-----------------------------------------------------------------------------------------------------------
@link_down = ( me, precedence, consequence ) ->
  ### TAINT check for trivial errors such as precedence == consequence ###
  me[ 'ps-by-cs' ][ precedence ]?= []
  ( me[ 'ps-by-cs' ][ consequence ]?= [] ).push precedence
  return @_sort me

#-----------------------------------------------------------------------------------------------------------
@link_up = ( me, consequence, precedence ) -> @link_down me, precedence, consequence

#-----------------------------------------------------------------------------------------------------------
@link = ( me, f, r, g ) ->
  if ( prefixes = me[ 'prefixes' ] )?
    f   = "#{prefixes[ 0 ]}#{f}"
    g   = "#{prefixes[ 1 ]}#{g}"
  switch r
    when '>' then @link_down me, f, g
    when '<' then @link_down me, g, f
    when '-' then return me
    else throw new Error "expected one of '<', '>', '-', got #{CND.rpr r}"
  return @_sort me

#-----------------------------------------------------------------------------------------------------------
@_visit = ( me, results, marks, name ) ->
  throw new Error "detected cycle involving node #{CND.rpr name}" if marks[ name ] is 'temp'
  return null if marks[ name ]?
  #.......................................................................................................
  marks[ name ] = 'temp'
  #.......................................................................................................
  for sub_name in me[ 'ps-by-cs' ][ name ]
    @_visit me, results, marks, sub_name
  #.......................................................................................................
  marks[ name ] = 'ok'
  results.push name
  return null

#-----------------------------------------------------------------------------------------------------------
@_sort = ( me ) ->
  return if me[ 'strict' ] then ( @sort me ) else null

#-----------------------------------------------------------------------------------------------------------
@sort = ( me ) ->
  ### As given in http://en.wikipedia.org/wiki/Topological_sorting ###
  precedences = Object.keys me[ 'ps-by-cs' ]
  R     = []
  marks = {}
  #.........................................................................................................
  for precedence in precedences
    @_visit me, R, marks, precedence unless marks[ precedence ]?
  #.........................................................................................................
  return R


