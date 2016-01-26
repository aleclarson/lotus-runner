var Runner, WeakMap, _call, _gatherAffectedSpecs, _getFileSource, _initFile, _runAffectedSpecs, _runSpec, _watch, async, basename, dirname, extname, has, join, log, lotus, mm, ref, ref1, relative, sync;

lotus = require("lotus-require");

ref = require("path"), join = ref.join, dirname = ref.dirname, basename = ref.basename, extname = ref.extname, relative = ref.relative;

ref1 = require("io"), sync = ref1.sync, async = ref1.async;

log = require("lotus-log").log;

WeakMap = require("weak-map");

has = require("has");

mm = require("minimatch");

Runner = require("./runner");

module.exports = function(module, options) {
  var pattern;
  options = {
    suite: has(options, "suite") ? options.suite : "lotus-jasmine",
    reporter: has(options, "reporter") ? options.reporter : "lotus-jasmine/reporter",
    extensions: options.extensions
  };
  pattern = options.src || "js/src/**/*.js";
  _watch(module, pattern, function(file, event) {
    if (event === "deleted") {
      return;
    }
    return _runAffectedSpecs(file, options);
  }).then(function(files) {
    return async.each(files, function(file) {
      return _initFile(file, "src");
    });
  });
  pattern = options.spec || "js/spec/**/*.js";
  return _watch(module, pattern, function(file, event) {
    if (event === "deleted") {
      return;
    }
    return _runSpec(file, options);
  }).then(function(files) {
    return async.each(files, function(file) {
      return _initFile(file, "spec");
    });
  });
};

_watch = function(module, pattern, eventHandler) {
  Module.watch(module.path + "/" + pattern, eventHandler);
  return module.watch(pattern);
};

_call = function(fn) {
  return fn();
};

_initFile = function(file, dirname) {
  file.dirname = dirname;
  file.source = _getFileSource(file.path, file.module);
  return file.initialize();
};

_runSpec = function(file, options) {
  var runner;
  log.origin("lotus-runner");
  log("Testing ");
  log.yellow(relative(lotus.path, file.path));
  log.moat(1);
  runner = Runner(options);
  return runner.start(file.path).done();
};

_runAffectedSpecs = function(file, options) {
  var specs;
  specs = _gatherAffectedSpecs(file);
  if (specs.length === 0) {
    return;
  }
  return async.each(specs, function(spec) {
    var runner;
    log.origin("lotus-runner");
    log("Testing ");
    log.yellow(relative(lotus.path, spec));
    log.moat(1);
    runner = Runner(options);
    return runner.start(spec);
  }).done();
};

_gatherAffectedSpecs = _call(function() {
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

_getFileSource = function(path, module) {
  var dir, ext, name;
  ext = extname(path);
  name = basename(path, ext);
  dir = basename(dirname(path));
  return join(module.path, dir, name + ".coffee");
};

//# sourceMappingURL=../../map/src/index.map
