
# TODO: Prefer module-specific suites and reporters over the globally installed versions.
#       Use the versions provided by 'lotus-runner/node_modules' when not even a global install exists.

{ assert, assertType, isType } = require "type-utils"

Benchmark = require "benchmark"
asyncFs = require "io/async"
syncFs = require "io/sync"
Type = require "Type"
Path = require "path"
sync = require "sync"
Q = require "q"

type = Type "Runner"

type.optionTypes =
  suite: String
  reporter: String.Maybe
  extensions: [ String, Array ]
  bench: Boolean

type.optionDefaults =
  suite: "lotus-jasmine"
  reporter: "lotus-jasmine/reporter"
  extensions: "js"
  bench: no

type.defineFrozenValues

  suite: (options) ->
    suite = module.optional options.suite
    assert suite, { options, reason: "Failed to load suite!" }
    suite.entry = lotus.resolve suite.path
    return suite

  reporter: (options) ->
    return unless options.reporter
    reporter = module.optional options.reporter
    assert reporter, { options, reason: "Failed to load reporter!" }
    return reporter

  extensions: ({ extensions }) ->
    extensions = extensions.join "|" if isType extensions, Array
    return RegExp ".*\\.(" + extensions + ")$", "i"

type.defineValues

  _specPath: (options) -> options.specPath

type.initInstance (options) ->

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

      log.moat 1
      log.white "test "
      log.cyan Path.relative lotus.path, spec
      log.moat 1

      module.optional spec, (error) ->
        log.moat 1
        log.red "Failed to load test: "
        log.white spec
        log.moat 1
        throw error

    @suite.start()

  _loadPaths: (paths) ->
    assertType paths, Array
    specs = []
    Q.all sync.map paths, (path, index) =>
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
