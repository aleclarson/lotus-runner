
syncFs = require "io/sync"
globby = require "globby"
Path = require "path"

Runner = require "./runner"

module.exports = (options) ->

  { bench, suite, reporter, extensions } = options

  bench ?= no

  specDir = options._.shift()
  specDir ?= "."

  unless Path.isAbsolute specDir
    parentDir = if specDir[0] is "." then process.cwd() else lotus.path
    specDir = Path.resolve parentDir, specDir

  tryToReadDir = (dir) ->
    return no unless syncFs.isDir dir
    files = globby.sync "*.js", { cwd: dir, matchBase: yes }
    files.map (path) -> Path.resolve dir, path

  if syncFs.isDir specDir
    specs = tryToReadDir specDir + "/js/spec"
    specs = tryToReadDir specDir + "/spec" unless specs
    specs = tryToReadDir specDir unless specs
  else if syncFs.isFile specDir
    specs = [ specDir ]
  else
    log.moat 1
    log.red "Error: "
    log.white "'#{specDir}' does not exist!"
    log.moat 1
    process.exit()

  specRegex = /\.js$/
  specs = specs.filter (spec) ->
    specRegex.test spec

  if specs.length is 0
    log.moat 1
    log.red "Error: "
    log.white "No tests were found."
    log.moat 1
    process.exit()

  runner = Runner {
    bench
    suite
    reporter
    extensions
  }

  runner
    .start specs
    .done()
