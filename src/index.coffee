
lotus = require "lotus-require"

{ join, dirname, basename, extname, relative } = require "path"
{ sync, async } = require "io"
{ log } = require "lotus-log"

WeakMap = require "weak-map"
has = require "has"
mm = require "minimatch"

Runner = require "./runner"

module.exports = (module, options) ->

  options =
    suite: if has options, "suite" then options.suite else "lotus-jasmine"
    reporter: if has options, "reporter" then options.reporter else "lotus-jasmine/reporter"
    extensions: options.extensions

  pattern = options.src or "js/src/**/*.js"
  _watch module, pattern, (file, event) ->
    return if event is "deleted"
    _runAffectedSpecs file, options
  .then (files) ->
    async.each files, (file) ->
      _initFile file, "src"

  pattern = options.spec or "js/spec/**/*.js"
  _watch module, pattern, (file, event) ->
    return if event is "deleted"
    _runSpec file, options
  .then (files) ->
    async.each files, (file) ->
      _initFile file, "spec"

##
## HELPERS
##

_watch = (module, pattern, eventHandler) ->
  Module.watch module.path + "/" + pattern, eventHandler
  module.watch pattern

_call = (fn) -> fn()

_initFile = (file, dirname) ->
  file.dirname = dirname
  file.source = _getFileSource file.path, file.module
  file.initialize()

_runSpec = (file, options) ->

  log.origin "lotus-runner"
  log "Testing "
  log.yellow relative lotus.path, file.path
  log.moat 1

  runner = Runner options

  runner.start file.path

  .done()

_runAffectedSpecs = (file, options) ->

  specs = _gatherAffectedSpecs file

  if specs.length is 0
    # log.origin "lotus-runner"
    # log "No specs require "
    # log.yellow relative lotus.path, file.path
    # log.moat 1
    return

  async.each specs, (spec) ->

    log.origin "lotus-runner"
    log "Testing "
    log.yellow relative lotus.path, spec
    log.moat 1

    runner = Runner options

    runner.start spec

  .done()

_gatherAffectedSpecs = _call ->

  gather = (file, specs, memory) ->
    sync.each file.dependers, (file) ->
      return if memory.map.has file
      memory.map.set file, yes
      memory.array.push file
      if file.dirname is "spec" then specs.push file.path
      else gather file, specs, memory

  (file, specs) ->
    specs ?= []
    memory = array: [], map: WeakMap()
    gather file, specs, memory
    sync.each memory.array, (file) ->
      memory.map.remove file
    specs

_getFileSource = (path, module) ->
  ext = extname path
  name = basename path, ext
  dir = basename dirname path
  join module.path, dir, name + ".coffee"
