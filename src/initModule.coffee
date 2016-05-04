
clearRequire = require "clear-require"
WeakMap = require "weak-map"
combine = require "combine"
Path = require "path"

Runner = require "./runner"

callFunction = (fn) -> fn()

optionDefaults =
  src: "js/src/**/*.js"
  spec: "js/spec/**/*.js"
  suite: "lotus-jasmine"
  reporter: "lotus-jasmine/reporter"

module.exports = (module, options) ->

  options = combine {}, optionDefaults, options

  crawlingSpec = module.crawl options.spec, (file, event) ->
    return if event is "unlink"
    clearRequire file.path
    runSpec file, options

  .then (files) ->
    initFiles "spec", files

  crawlingSrc = module.crawl options.src, (file, event) ->
    return if event is "unlink"
    clearRequire file.path
    # runAffectedSpecs file, options

  # .then (files) =>
  #   initFiles "src", files

  Q.all [
    crawlingSpec
    crawlingSrc
  ]

initFiles = callFunction ->

  getSourcePath = (path, module) ->
    ext = Path.extname path
    name = Path.basename path, ext
    dir = Path.basename Path.dirname path
    Path.join module.path, dir, name + ".coffee"

  return (dirname, files) ->
    Q.all sync.map files, (file) ->
      file.dirname = dirname
      file.source = getSourcePath file.path, file.module
      file.load()

runSpec = (file, options) ->
  Runner options
    .start [ file.path ]
    .done()

# runAffectedSpecs = (file, options) ->
#   specs = gatherAffectedSpecs file
#   return if specs.length is 0
#   sync.each specs, runSpec

# gatherAffectedSpecs = callFunction ->
#
#   gather = (file, specs, memory) ->
#     sync.each file.dependers, (file) ->
#       return if memory.map.has file
#       memory.map.set file, yes
#       memory.array.push file
#       if file.dirname is "spec" then specs.push file.path
#       else gather file, specs, memory
#
#   return (file, specs = []) ->
#     memory = array: [], map: WeakMap()
#     gather file, specs, memory
#     sync.each memory.array, (file) ->
#       memory.map.remove file
#     specs
