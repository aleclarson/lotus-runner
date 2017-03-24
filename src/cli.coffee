
path = require "path"

Runner = require "./runner"

exports.test = (args) ->

  modName = args._.shift() or "."
  mod = lotus.modules.load modName

  log.moat 1
  log.gray.dim "Testing: "
  log.green lotus.relative mod.path
  log.moat 1

  mod.load ["config"]
  .then ->

    try mod.spec ?= "spec"
    unless mod.spec
      throw Error "Module named '#{mod.name}' must define its `spec`!"

    # TODO: Make this more flexible.
    needsCoffee = mod.hasPlugin "lotus-coffee"

    pattern = path.join mod.spec, "**", "*."
    pattern += if needsCoffee then "coffee" else "js"

    mod.crawl pattern,
      ignored: "**/{.git,node_modules}/**"

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
