
# TODO: Prefer module-specific suites and reporters over the globally installed versions.
#       Use the versions provided by 'lotus-runner/node_modules' when not even a global install exists.

clearRequire = require "clear-require"
assertType = require "assertType"
Benchmark = require "benchmark"
Type = require "Type"
path = require "path"
fs = require "fsx"

type = Type "TestRunner"

type.defineArgs ->

  types:
    suite: String
    reporter: String
    bench: Boolean

  defaults:
    suite: "lotus-jasmine"
    reporter: "lotus-jasmine/reporter"
    bench: no

type.defineFrozenValues

  suite: (options) ->
    try suite = require options.suite
    catch error
      log.moat 1
      log.yellow "Warning: "
      log.white "The '#{options.suite}' testing suite threw an error!"
      log.moat 0
      log.gray error.stack
      log.moat 1
    return suite

  reporter: (options) ->
    return unless options.reporter
    try reporter = require options.reporter
    catch error
      log.moat 1
      log.yellow "Warning: "
      log.white "The '#{options.reporter}' test reporter threw an error!"
      log.moat 0
      log.gray error.stack
      log.moat 1
    return reporter

type.initInstance (options) ->

  # TODO: Maybe remove this? Use 'devDependencies' instead.
  global.emptyFunction = require "emptyFunction"

  global.Benchmark =
    if options.bench then Benchmark
    else null

  @suite.load { @reporter }

type.defineMethods

  start: (specs) ->
    assertType specs, Array

    specs.sort (a, b) ->
      a.localeCompare b

    @_loadPaths specs
    .then (paths) ->
      paths.forEach (spec) ->

        # Reload the module for this spec.
        clearRequire spec

        try require spec
        catch error
          log.moat 1
          log.white "Failed to load test: "
          log.red spec
          log.moat 0
          log.gray error.stack
          log.moat 1

    .then => @suite.start()

  _loadPaths: (specs) ->
    assertType specs, Array

    paths = []

    Promise.all specs, (spec) ->
      assertType spec, String

      unless path.isAbsolute spec
        parent =
          if spec[0] is "."
          then process.cwd()
          else lotus.path
        spec = path.resolve parent, spec

      unless fs.isDir spec
        paths.push spec
        return

      files = fs.readDir spec
      for file in files
        file = path.join spec, file
        paths.push file if fs.isFile file
      return

    .then -> paths

module.exports = Runner = type.build()
