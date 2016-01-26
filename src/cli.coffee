
require "lotus-require"

{ sync, async } = require "io"
minimist = require "minimist"
combine = require "combine"

defaults =
  _: null
  suite: "lotus-jasmine"
  reporter: "lotus-jasmine/reporter"

argv = process.argv.slice 3

options = combine {}, defaults, minimist argv

sync.each argv, (arg, index) ->
  if arg[0..1] is "--"
    switch arg.slice 2
      when "suite"
        suite = argv[index + 1]
        options.suite = suite if typeof suite is "string"
      when "reporter"
        reporter = argv[index + 1]
        options.reporter = reporter if typeof reporter is "string"

sync.each options, (value, key) ->
  return if defaults.hasOwnProperty key
  async.throw
    error: Error "'#{key}' is not a valid option"
    code: "INVALID_OPTION"
    format: -> simple: yes

specs = options._

if specs.length is 0
  async.throw
    error: Error "No specs were found."
    code: "NO_SPECS_FOUND"
    format: simple: yes

delete options._

Runner = require "./runner"

runner = Runner options

runner.start(specs).done()
