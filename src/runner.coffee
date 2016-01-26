
# TODO: Prefer module-specific suites and reporters over the globally installed versions.
#       Use the versions provided by 'lotus-runner/node_modules' when not even a global install exists.

lotus = require "lotus-require"

define = require "define"
log = require "lotus-log"
NamedFunction = require "named-function"
escapeStringRegexp = require "escape-string-regexp"
{ isAbsolute, dirname, join, resolve, sep } = require "path"
{ isType, isKind } = require "type-utils"
{ sync, async } = require "io"

Runner = NamedFunction "Runner", (options) ->

  unless this instanceof Runner
    return new Runner options

  options ?= {}

  if !isType options.suite, String
    throw TypeError "'options.suite' must be a String"

  if isType options.reporter, String
    options.reporter = module.optional options.reporter

  if !isType options.extensions, String
    options.extensions = "js"

  @suite = require options.suite
  @suite.name = @suite.path.slice 0, sepIndex = @suite.path.indexOf sep
  @suite.dir = dirname require.resolve @suite.name
  @suite.entry = join @suite.dir, @suite.path.slice sepIndex
  @suite.load options
  @extensions = RegExp ".*\\.(" + options.extensions + ")$", "i"
  @

define ->

  @options = writable: no, configurable: no

  @ module, exports: Runner

  @ Runner.prototype,

    start: (paths) ->

      if isType paths, String
        paths = [paths]

      if !isKind paths, Array
        throw TypeError "'paths' must be an Array or String"

      loadSpecPaths paths

      .then (specs) =>

        if specs.length is 0
          throw Error "No specs were found."

        specs.sort (a, b) ->
          a.localeCompare b

        sync.each specs, (spec) ->

          delete require.cache[spec]

          pwd = process.cwd()

          process.chdir dirname spec

          log.it "Loading spec: " + spec

          module.optional spec, (error) ->
            log.origin "lotus-runner"
            log "Failed while loading a spec: "
            log.red spec
            log.moat 1
            throw error

          process.chdir pwd

        global.log = log

        async.try =>

          @suite.start()

loadSpecPaths = (paths) ->

  async.reduce paths, [], (specs, path) ->

    if !isType path, String
      async.throw
        error: TypeError "'path' should be a String."
        format: repl: { path }

    path = resolve path

    async.isDir path

    .then (isDir) ->

      unless isDir
        specs.push path
        async.throw fatal: no

      async.readDir path

      .then (files) ->

        async.each files, (file) ->

          spec = join path, file

          # BUG: The asynchronous version never finishes here. [6/2/15]
          isFile = sync.isFile spec

          specs.push spec if isFile

          return

    .fail async.catch

    .then -> specs
