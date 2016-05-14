
clearRequire = require "clear-require"
Path = require "path"
Q = require "q"

Runner = require "./runner"

module.exports = (mod, options) ->

  options.suite ?= "lotus-jasmine"
  options.reporter ?= "lotus-jasmine/reporter"

  mod.load [ "config" ]

  .then ->

    unless mod.specDest
      log.moat 1
      log.yellow "Warning: "
      log.white mod.name
      log.moat 0
      log.gray.dim "A valid 'specDest' must exist before 'lotus-runner' can work!"
      log.moat 1
      return

    return Q.all [
      watchSpecs mod, options
      watchSrc mod
    ]

watchSpecs = (mod, options) ->
  pattern = mod.specDest + "/**/*.js"
  mod.watch pattern, change: (file) ->
    specListeners.change file, options

watchSrc = (mod) ->
  patterns = []
  patterns[0] = "*.js"
  patterns[1] = mod.dest + "/**/*.js"
  mod.watch patterns, srcListeners

specListeners =

  change: (file, options) ->
    clearRequire file.path
    Runner options
      .start [ file.path ]
      .done()

srcListeners =

  change: (file) ->
    clearRequire file.path
