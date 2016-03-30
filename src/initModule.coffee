
WeakMap = require "weak-map"
combine = require "combine"
Path = require "path"
has = require "has"
mm = require "minimatch"

Runner = require "./runner"

callFunction = (fn) -> fn()

optionDefaults =
  src: "js/src/**/*.js"
  spec: "js/spec/**/*.js"
  suite: "lotus-jasmine"
  reporter: "lotus-jasmine/reporter"

module.exports = (module, options) ->

  options = combine {}, optionDefaults, options

  specWatcher = watchFiles module, options.spec, (file, event) =>
    return if event is "unlink"
    runSpec file, options

  .then (files) =>
    initFiles "spec", files

  srcWatcher = watchFiles module, options.src, (file, event) =>
    return if event is "unlink"
    runAffectedSpecs file, options

  .then (files) =>
    initFiles "src", files

  Q.all [
    specWatcher
    srcWatcher
  ]

watchFiles = (module, pattern, eventHandler) ->

  # Watch the module for file changes.
  lotus.Module.watch module.path + "/" + pattern, eventHandler

  # Crawl the module for its files.
  module.crawl pattern

initFiles = callFunction ->

  getSourcePath = (path, module) ->
    ext = Path.extname path
    name = Path.basename path, ext
    dir = Path.basename Path.dirname path
    Path.join module.path, dir, name + ".coffee"

  return (dirname, files) ->
    Q.all sync.map files, (file) =>
      file.dirname = dirname
      file.source = getSourcePath file.path, file.module
      file.load()

runSpec = (file, options) ->
  Runner(options)
    .start(file.path)
    .done()

runAffectedSpecs = (file, options) ->

  specs = gatherAffectedSpecs file
  return if specs.length is 0

  Q.all sync.map specs, (spec) ->

    log.moat 1
    log "Testing "
    log.yellow Path.relative lotus.path, spec
    log.moat 1

    runner = Runner options

    runner.start spec

  .done()

gatherAffectedSpecs = callFunction ->

  gather = (file, specs, memory) ->
    sync.each file.dependers, (file) ->
      return if memory.map.has file
      memory.map.set file, yes
      memory.array.push file
      if file.dirname is "spec" then specs.push file.path
      else gather file, specs, memory

  return (file, specs = []) ->
    memory = array: [], map: WeakMap()
    gather file, specs, memory
    sync.each memory.array, (file) ->
      memory.map.remove file
    specs
