var Path, Runner, WeakMap, callFunction, combine, gatherAffectedSpecs, has, initFiles, mm, optionDefaults, runAffectedSpecs, runSpec, watchFiles;

WeakMap = require("weak-map");

combine = require("combine");

Path = require("path");

has = require("has");

mm = require("minimatch");

Runner = require("./runner");

callFunction = function(fn) {
  return fn();
};

optionDefaults = {
  src: "js/src/**/*.js",
  spec: "js/spec/**/*.js",
  suite: "lotus-jasmine",
  reporter: "lotus-jasmine/reporter"
};

module.exports = function(module, options) {
  var specWatcher, srcWatcher;
  options = combine({}, optionDefaults, options);
  specWatcher = watchFiles(module, options.spec, (function(_this) {
    return function(file, event) {
      if (event === "unlink") {
        return;
      }
      return runSpec(file, options);
    };
  })(this)).then((function(_this) {
    return function(files) {
      return initFiles("spec", files);
    };
  })(this));
  srcWatcher = watchFiles(module, options.src, (function(_this) {
    return function(file, event) {
      if (event === "unlink") {
        return;
      }
      return runAffectedSpecs(file, options);
    };
  })(this)).then((function(_this) {
    return function(files) {
      return initFiles("src", files);
    };
  })(this));
  return Q.all([specWatcher, srcWatcher]);
};

watchFiles = function(module, pattern, eventHandler) {
  lotus.Module.watch(module.path + "/" + pattern, eventHandler);
  return module.crawl(pattern);
};

initFiles = callFunction(function() {
  var getSourcePath;
  getSourcePath = function(path, module) {
    var dir, ext, name;
    ext = Path.extname(path);
    name = Path.basename(path, ext);
    dir = Path.basename(Path.dirname(path));
    return Path.join(module.path, dir, name + ".coffee");
  };
  return function(dirname, files) {
    return Q.all(sync.map(files, (function(_this) {
      return function(file) {
        file.dirname = dirname;
        file.source = getSourcePath(file.path, file.module);
        return file.load();
      };
    })(this)));
  };
});

runSpec = function(file, options) {
  return Runner(options).start(file.path).done();
};

runAffectedSpecs = function(file, options) {
  var specs;
  specs = gatherAffectedSpecs(file);
  if (specs.length === 0) {
    return;
  }
  return Q.all(sync.map(specs, function(spec) {
    var runner;
    log.moat(1);
    log("Testing ");
    log.yellow(Path.relative(lotus.path, spec));
    log.moat(1);
    runner = Runner(options);
    return runner.start(spec);
  })).done();
};

gatherAffectedSpecs = callFunction(function() {
  var gather;
  gather = function(file, specs, memory) {
    return sync.each(file.dependers, function(file) {
      if (memory.map.has(file)) {
        return;
      }
      memory.map.set(file, true);
      memory.array.push(file);
      if (file.dirname === "spec") {
        return specs.push(file.path);
      } else {
        return gather(file, specs, memory);
      }
    });
  };
  return function(file, specs) {
    var memory;
    if (specs == null) {
      specs = [];
    }
    memory = {
      array: [],
      map: WeakMap()
    };
    gather(file, specs, memory);
    sync.each(memory.array, function(file) {
      return memory.map.remove(file);
    });
    return specs;
  };
});

//# sourceMappingURL=../../map/src/initModule.map
