
# TODO: Prefer module-specific suites and reporters over the globally installed versions.
#       Use the versions provided by 'lotus-runner/node_modules' when not even a global install exists.

assertType = require "assertType"
Benchmark = require "benchmark"
Promise = require "Promise"
asyncFs = require "io/async"
syncFs = require "io/sync"
isType = require "isType"
assert = require "assert"
Type = require "Type"
Path = require "path"
sync = require "sync"
log = require "log"

type = Type "Runner"

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
    assert suite, { options, reason: "Failed to load suite!" }
    return suite

  reporter: (options) ->
    return unless options.reporter
    try reporter = require options.reporter
    assert reporter, { options, reason: "Failed to load reporter!" }
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

    sync.each specs, (spec) ->

      assertType spec, String

      assert Path.isAbsolute(spec), "Spec path must be absolute!"

      delete require.cache[spec]

      try require spec
      catch error
        log.moat 1
        log.red "Failed to load test: "
        log.white spec
        log.moat 1
        throw error

    @suite.start()

  _loadPaths: (paths) ->
    assertType paths, Array
    specs = []
    Promise.map paths, (path, index) =>
      path = @_resolve path, index
      @_loadSpecs path, specs
    .then ->
      specs

  _resolve: (path, index) ->
    assertType path, String
    unless Path.isAbsolute path
      parent = if path[0] is "." then process.cwd() else lotus.path
      path = Path.resolve parent, Path.join path, @_specDir
    path

  _loadSpecs: (path, specs) ->

    asyncFs.isDir path
    .then (isDir) ->
      unless isDir
        specs.push path
        return

      asyncFs.readDir path
      .then (files) ->
        for file in files
          spec = Path.join path, file
          if syncFs.isFile spec
            specs.push spec
        return

module.exports = Runner = type.build()
