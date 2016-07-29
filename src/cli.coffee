
assert = require "assert"

Runner = require "./runner"

module.exports = (args) ->

  moduleName = args._.shift() or "."

  lotus.Module.load moduleName

  .then (module) ->

    log.moat 1
    log.gray.dim "Testing: "
    log.green lotus.relative module.path
    log.moat 1

    module.load [ "config" ]

    .then ->

      try module.spec ?= "spec"

      assert module.spec, "Module named '#{module.name}' must define its `spec`!"

      # TODO: Make this more flexible.
      needsCoffee = module.hasPlugin "lotus-coffee"

      pattern = module.spec + "/**/*." + if needsCoffee then "coffee" else "js"

      module.crawl pattern

      .then (files) ->

        if files.length is 0
          log.moat 1
          log.red "Error: "
          log.white "No tests were found."
          log.moat 1
          return

        if needsCoffee
          require "coffee-script/register"

        runner = Runner
          bench: args.bench
          suite: args.suite
          reporter: args.reporter

        runner.start files.map (file) -> file.path
