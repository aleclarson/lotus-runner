
parseBool = require "parse-bool"
minimist = require "minimist"
combine = require "combine"
steal = require "steal"

validOptions =
  suite: 1
  reporter: 1
  extensions: 1
  bench: 1

options = minimist process.argv.slice 3

{ bench } = options
bench = parseBool bench if isType bench, String
options.bench = bench ?= no

specs = steal options, "_"
specs.push "." if specs.length is 0

sync.each options, (value, key) ->
  return if validOptions[key]
  log.moat 1
  log.red "Invalid option: "
  log.white key
  log.moat 1
  process.exit()

Runner = require "./runner"

runner = Runner options

runner.start(specs).done()
