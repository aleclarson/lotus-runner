
exports.globalDependencies = [
  "lotus-watch"
]

exports.initCommands = ->

  test: -> require "./cli"

# exports.initModule = ->
#   require "./initModule"

# TODO: Run tests during 'build' phase.
