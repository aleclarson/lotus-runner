var Runner, assert;

assert = require("assert");

Runner = require("./runner");

module.exports = function(args) {
  var moduleName;
  moduleName = args._.shift() || ".";
  return lotus.Module.load(moduleName).then(function(module) {
    log.moat(1);
    log.gray.dim("Testing: ");
    log.green(lotus.relative(module.path));
    log.moat(1);
    return module.load(["config"]).then(function() {
      var needsCoffee, pattern;
      try {
        if (module.spec == null) {
          module.spec = "spec";
        }
      } catch (error) {}
      assert(module.spec, "Module named '" + module.name + "' must define its `spec`!");
      needsCoffee = module.hasPlugin("lotus-coffee");
      pattern = module.spec + "/**/*." + (needsCoffee ? "coffee" : "js");
      return module.crawl(pattern, {
        ignore: "**/{node_modules,__tests__}/**"
      }).then(function(files) {
        var runner;
        if (files.length === 0) {
          log.moat(1);
          log.red("Error: ");
          log.white("No tests were found.");
          log.moat(1);
          return;
        }
        if (needsCoffee) {
          require("coffee-script/register");
        }
        runner = Runner({
          bench: args.bench,
          suite: args.suite,
          reporter: args.reporter
        });
        return runner.start(files.map(function(file) {
          return file.path;
        }));
      });
    });
  });
};

//# sourceMappingURL=map/cli.map
