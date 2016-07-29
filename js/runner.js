var Benchmark, Path, Promise, Runner, Type, assert, assertType, asyncFs, isType, log, sync, syncFs, type;

assertType = require("assertType");

Benchmark = require("benchmark");

Promise = require("Promise");

asyncFs = require("io/async");

syncFs = require("io/sync");

isType = require("isType");

assert = require("assert");

Type = require("Type");

Path = require("path");

sync = require("sync");

log = require("log");

type = Type("Runner");

type.defineOptions({
  suite: String.withDefault("lotus-jasmine"),
  reporter: String.withDefault("lotus-jasmine/reporter"),
  bench: Boolean.withDefault(false)
});

type.defineFrozenValues({
  suite: function(options) {
    var suite;
    try {
      suite = require(options.suite);
    } catch (error1) {}
    assert(suite, {
      options: options,
      reason: "Failed to load suite!"
    });
    return suite;
  },
  reporter: function(options) {
    var reporter;
    if (!options.reporter) {
      return;
    }
    try {
      reporter = require(options.reporter);
    } catch (error1) {}
    assert(reporter, {
      options: options,
      reason: "Failed to load reporter!"
    });
    return reporter;
  }
});

type.initInstance(function(options) {
  global.emptyFunction = require("emptyFunction");
  global.Benchmark = options.bench ? Benchmark : null;
  return this.suite.load({
    reporter: this.reporter
  });
});

type.defineMethods({
  start: function(specs) {
    assertType(specs, Array);
    specs.sort(function(a, b) {
      return a.localeCompare(b);
    });
    sync.each(specs, function(spec) {
      var error;
      assertType(spec, String);
      assert(Path.isAbsolute(spec), "Spec path must be absolute!");
      delete require.cache[spec];
      try {
        return require(spec);
      } catch (error1) {
        error = error1;
        log.moat(1);
        log.red("Failed to load test: ");
        log.white(spec);
        log.moat(1);
        throw error;
      }
    });
    return this.suite.start();
  },
  _loadPaths: function(paths) {
    var specs;
    assertType(paths, Array);
    specs = [];
    return Promise.map(paths, (function(_this) {
      return function(path, index) {
        path = _this._resolve(path, index);
        return _this._loadSpecs(path, specs);
      };
    })(this)).then(function() {
      return specs;
    });
  },
  _resolve: function(path, index) {
    var parent;
    assertType(path, String);
    if (!Path.isAbsolute(path)) {
      parent = path[0] === "." ? process.cwd() : lotus.path;
      path = Path.resolve(parent, Path.join(path, this._specDir));
    }
    return path;
  },
  _loadSpecs: function(path, specs) {
    return asyncFs.isDir(path).then(function(isDir) {
      if (!isDir) {
        specs.push(path);
        return;
      }
      return asyncFs.readDir(path).then(function(files) {
        var file, i, len, spec;
        for (i = 0, len = files.length; i < len; i++) {
          file = files[i];
          spec = Path.join(path, file);
          if (syncFs.isFile(spec)) {
            specs.push(spec);
          }
        }
      });
    });
  }
});

module.exports = Runner = type.build();

//# sourceMappingURL=map/runner.map
