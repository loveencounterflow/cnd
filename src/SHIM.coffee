


#-----------------------------------------------------------------------------------------------------------
@shim = ( keys... ) ->
  throw new Error "keys not yet implemented; use `shim()` instead" if keys.length > 0
  console.log require 'es6-shim'
  console.log require 'es7-shim'



