


#-----------------------------------------------------------------------------------------------------------
@shim = ( keys... ) ->
  throw new Error "keys not yet implemented; use `shim()` instead" if keys.length > 0
  require 'es6-shim'
  # require 'es7-shim'



