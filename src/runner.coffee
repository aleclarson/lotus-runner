
# TODO: Prefer module-specific suites and reporters over the globally installed versions.
#       Use the versions provided by 'lotus-runner/node_modules' when not even a global install exists.

Benchmark = require "benchmark"
Factory = require "factory"
combine = require "combine"
asyncFs = require "io/async"
syncFs = require "io/sync"
Path = require "path"
sync = require "sync"

module.exports =
Runner = Factory "Runner",

  optionTypes:
    suite: String
    reporter: [ String, Void ]
    extensions: [ String, Array ]
    bench: Boolean

  optionDefaults:
    suite: "lotus-jasmine"
    reporter: "lotus-jasmine/reporter"
    extensions: "js"
    bench: no

  initFrozenValues: (options) ->

    suite: @_initSuite options.suite

    reporter: @_initReporter options.reporter

    extensions: @_initExtensions options.extensions

  initValues: (options) ->

    _specPath: options.specPath

  init: (options) ->

    global.Benchmark =
      if options.bench then Benchmark
      else null

    @suite.load { @reporter }

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

  _initSuite: (modulePath) ->
    suite = module.optional modulePath
    if suite
      suite.entry = lotus.resolve suite.path
      return suite
    log.moat 1
    log.red "Unknown suite: "
    log.white modulePath
    log.moat 1
    process.exit()

  _initReporter: (modulePath) ->
    return unless modulePath
    reporter = module.optional modulePath
    return reporter if reporter
    log.moat 1
    log.red "Unknown reporter: "
    log.white modulePath
    log.moat 1
    process.exit()

  _initExtensions: (extensions) ->
    extensions = extensions.join "|" if isType extensions, Array
    return RegExp ".*\\.(" + extensions + ")$", "i"

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
