

- [cnd](#cnd)
	- [CND TSort](#cnd-tsort)

> **Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*


# cnd

a grab-bag NodeJS package mainly for functionalities that used to live in
coffeenode-trm, coffeenode-bitsnpieces, and coffeenode-types


## CND TSort

CND TSort implements a simple tool to perform the often-needed requirement of
doing a [topological sorting](http://en.wikipedia.org/wiki/Topological_sorting)
over an [DAG](http://en.wikipedia.org/wiki/Directed_acyclic_graph) (directed acyclic graph).
It is an adaption of the [npm: tsort](https://github.com/eknkc/tsort) module.

Here is the basic usage: you instantiate a graph by saying e.g.

```coffee
CND       = require 'cnd'
TS        = CND.TSORT
settings  =
  strict:   yes
  prefixes: [ 'f|', 'g|', ]
graph     = TS.new_graph settings
```

The `settings` object itself and its members are optional. The `strict` setting
(true by default) will check for the well-formedness on the graph each time a
relationship is entered; this means you get early errors at the cost of
decreased performance. We come back to the `prefixes` later; the default is not
to use prefixes.

Topological sorting is all about finding a total, linear ordering of actions,
values, objects or whatever from a series of statements about the relative
ordering of pairs of such objects. This is used in many fields, for example in
package management, project management, programming language grammars and so on.

So let's say you have a todo list:

```coffee
'buy books'
'buy food'
'buy food'
'cook'
'do some reading'
'eat'
'fetch money'
'go home'
'go to bank'
'go to exam'
'go to market'
```

Now you don't have money, foods or books at home right now, but you want to eat,
do some reading, and fo to the exam after that, so clearly there's a certain
order of events that would make more sense than other orderings. It's hard to see
how you can organize your day when you look at the entire list, but given any
two jobs, it's often easy to see which one should preced the other one.

Once we have instantiated a graph `g`, we can add dual relationships piecemeal,
the convention being that we imagine arrows or links pointing from preconditions
'down' to consequences, which is why the corresponding method is named
`link_down`. Calling `TS.link_down g, 'buy food', 'cook'` means: 'Add a link to
graph `g` to indicate that before I can `'cook'`, I have to `'by food'` first',
and so on. It is customary to symbolically write `'buy food' > 'cook'` to
indicate the dependency.

In case the graph has been instantiated with a `strict: yes` setting, CND TSort
will validate the graph for each single new relationship; as a side effect, a
list of entries is produced and returned that reflects one of the possible
linearization of that satisfies all requirements so far. For the purpose of
demonstration, we can take advantage of that list and print it out; we can see
that the ordering of jobs will sometimes take a dramatic turn when new
requirements are added. Let's try that for some obvious dependencies:

```coffee
console.log ( TS.link_down g, 'buy food',          'cook'                ).join ' > '
console.log ( TS.link_down g, 'fetch money',       'buy food'            ).join ' > '
console.log ( TS.link_down g, 'do some reading',   'go to exam'          ).join ' > '
console.log ( TS.link_down g, 'cook',              'eat'                 ).join ' > '
console.log ( TS.link_down g, 'go to bank',        'fetch money'         ).join ' > '
console.log ( TS.link_down g, 'fetch money',       'buy books'           ).join ' > '
console.log ( TS.link_down g, 'buy books',         'do some reading'     ).join ' > '
console.log ( TS.link_down g, 'go to market',      'buy food'            ).join ' > '
```
The output from the above will be (re-arranged for readability):

```coffee
                                          buy food > cook
             fetch money >                buy food > cook
             fetch money >                buy food > cook >             do some reading > go to exam
             fetch money >                buy food > cook >             do some reading > go to exam > eat
go to bank > fetch money >                buy food > cook >             do some reading > go to exam > eat
go to bank > fetch money >                buy food > cook >             do some reading > go to exam > eat > buy books
go to bank > fetch money >                buy food > cook > buy books > do some reading > go to exam > eat
go to bank > fetch money > go to market > buy food > cook > buy books > do some reading > go to exam > eat
```
Observe how the requirement `'fetch money' > 'buy books'` made `'buy books'`
appear at the very end of the list, and how only the additonal requirement `'buy
books' > 'do some reading'` managed to put the horse before the cart, as it
were. It looks like like we're not quite done here yet, as we have to leave
house after cooking and go to the exam with an empty stomach according to the
current linearization, so some dependencies are still missing:

```coffee
console.log ( TS.link_down g, 'buy food',          'go home'             ).join ' > '
console.log ( TS.link_down g, 'buy books',         'go home'             ).join ' > '
console.log ( TS.link_down g, 'go home',           'cook'                ).join ' > '
console.log ( TS.link_down g, 'eat',               'go to exam'          ).join ' > '
```

This makes the order of events more reasonable with each step:

```coffee
go to bank > fetch money > go to market > buy food > cook > buy books > do some reading > go to exam > eat > go home
go to bank > fetch money > go to market > buy food > cook > buy books > do some reading > go to exam > eat > go home
go to bank > fetch money > go to market > buy food > buy books > go home > cook > do some reading > go to exam > eat
go to bank > fetch money > go to market > buy food > buy books > go home > cook > do some reading > eat > go to exam
```
The takeaway up to this point is that although you may have already entered all
relevant activities, it may or or may not be the case that the relationships
define a unique ordering—TSort will always give you *some* ordering, but not
necessarily the only one. TSort remains silent about that.

Furthermore, each new requirement may introduce an incompatible constraint. It
is by no means unreasonable as such to require that we want to eat before going
to the bank, but should we call `TS.link_down g, 'eat', 'go to bank'` at this
point in time, TSort (if set to `strict`) will throw an error, complaining that
it has `detected cycle involving node 'buy food'`. Had we put that clause first,
the error would have resulted from some other clause.




```coffee
```

```coffee
```

@new_graph = ( settings ) ->
  settings ?= {}
  strict    = settings[ 'strict'    ] ? yes
  prefixes  = settings[ 'prefixes'  ] ? null
  R =
    '~isa':     'CND/tsort-graph'
    'ps-by-cs': {}
    'strict':   strict
    'prefixes': prefixes

@link_down = ( me, precedence, consequence ) ->
@link_up = ( me, consequence, precedence ) -> @link_down me, precedence, consequence
@link = ( me, f, r, g ) ->
@sort = ( me ) ->



```coffee

CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'scratch'
debug                     = CND.get_logger 'debug',     badge
help                      = CND.get_logger 'help',      badge


test_tsort = ->
  TS = CND.TSORT
  settings =
    strict:   yes
    prefixes: [ 'f|', 'g|', ]
  graph = TS.new_graph settings

  # TS.link_down graph, 'id', '$'
  # TS.link_up graph, '$', 'id'
  # TS.link graph, '$', '>', 'id'
  # debug '©TJLyH', TS.link graph, '$', '<', 'id'
  # debug '©TJLyH', TS.link graph, 'id', '<', '$'
  # help TS.sort graph
  TS.link graph, 'id', '-', 'id'
  TS.link graph, 'id', '>', '+'
  TS.link graph, 'id', '>', '*'
  TS.link graph, 'id', '>', '$'
  TS.link graph, '+', '<', 'id'
  TS.link graph, '+', '>', '+'
  TS.link graph, '+', '<', '*'
  TS.link graph, '+', '>', '$'
  TS.link graph, '*', '<', 'id'
  TS.link graph, '*', '>', '+'
  TS.link graph, '*', '>', '*'
  TS.link graph, '*', '>', '$'
  TS.link graph, '$', '<', 'id'
  TS.link graph, '$', '<', '+'
  TS.link graph, '$', '<', '*'
  TS.link graph, '$', '-', '$'
  debug '©DE1h1', graph

  help nodes = TS.sort graph
  matcher = [ 'f|id', 'g|id', 'f|*', 'g|*', 'f|+', 'g|+', 'g|$', 'f|$' ]
  unless CND.equals nodes, matcher
    throw new Error """is: #{rpr nodes}
      expected:  #{rpr matcher}"""
  try
    TS.link graph, '$', '>', '$'
    TS.link graph, '$', '<', '$'
  catch error
    { message } = error
    if /^detected cycle involving node/.test message
      warn error
    else
      throw error

test_tsort()
```





