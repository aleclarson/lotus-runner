
# TODO: Run tests during 'build' phase.

module.exports =
  loadCommands: -> require "./cli"
  globalDependencies: ["lotus-watch"]
