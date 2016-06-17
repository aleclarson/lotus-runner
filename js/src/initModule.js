var Path, Promise, Runner, clearRequire, log, specListeners, srcListeners, watchSpecs, watchSrc;

clearRequire = require("clear-require");

Promise = require("Promise");

Path = require("path");

log = require("log");

Runner = require("./runner");

module.exports = function(mod, options) {
  if (options.suite == null) {
    options.suite = "lotus-jasmine";
  }
  if (options.reporter == null) {
    options.reporter = "lotus-jasmine/reporter";
  }
  return mod.load(["config"]).then(function() {
    if (!mod.specDest) {
      log.moat(1);
      log.yellow("Warning: ");
      log.white(mod.name);
      log.moat(0);
      log.gray.dim("A valid 'specDest' must exist before 'lotus-runner' can work!");
      log.moat(1);
      return;
    }
    return Promise.all([watchSpecs(mod, options), watchSrc(mod)]);
  });
};

watchSpecs = function(mod, options) {
  var pattern;
  pattern = mod.specDest + "/**/*.js";
  return mod.watch(pattern, {
    change: function(file) {
      return specListeners.change(file, options);
    }
  });
};

watchSrc = function(mod) {
  var patterns;
  patterns = [];
  patterns[0] = "*.js";
  patterns[1] = mod.dest + "/**/*.js";
  return mod.watch(patterns, srcListeners);
};

specListeners = {
  change: function(file, options) {
    clearRequire(file.path);
    return Runner(options).start([file.path]).done();
  }
};

srcListeners = {
  change: function(file) {
    return clearRequire(file.path);
  }
};

//# sourceMappingURL=../../map/src/initModule.map
