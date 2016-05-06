
clearRequire = require "clear-require"
WeakMap = require "weak-map"
combine = require "combine"
Path = require "path"

Runner = require "./runner"

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

  Q.all [
    crawlingSpec
    crawlingSrc
  ]

getSourcePath = (path, module) ->
  ext = Path.extname path
  name = Path.basename path, ext
  dir = Path.basename Path.dirname path
  Path.join module.path, dir, name + ".coffee"

initFiles = (dirname, files) ->
  Q.all sync.map files, (file) ->
    file.dirname = dirname
    file.source = getSourcePath file.path, file.module

runSpec = (file, options) ->
  Runner options
    .start [ file.path ]
    .done()
