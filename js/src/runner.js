var Benchmark, Factory, Path, Runner, asyncFs, combine, sync, syncFs;

Benchmark = require("benchmark");

Factory = require("factory");

combine = require("combine");

asyncFs = require("io/async");

syncFs = require("io/sync");

Path = require("path");

sync = require("sync");

module.exports = Runner = Factory("Runner", {
  optionTypes: {
    suite: String,
    reporter: [String, Void],
    extensions: [String, Array],
    bench: Boolean
  },
  optionDefaults: {
    suite: "lotus-jasmine",
    reporter: "lotus-jasmine/reporter",
    extensions: "js",
    bench: false
  },
  initFrozenValues: function(options) {
    return {
      suite: this._initSuite(options.suite),
      reporter: this._initReporter(options.reporter),
      extensions: this._initExtensions(options.extensions)
    };
  },
  initValues: function(options) {
    return {
      _specPath: options.specPath
    };
  },
  init: function(options) {
    global.Benchmark = options.bench ? Benchmark : null;
    return this.suite.load({
      reporter: this.reporter
    });
  },
  start: function(specs) {
    assertType(specs, Array);
    specs.sort(function(a, b) {
      return a.localeCompare(b);
    });
    sync.each(specs, function(spec) {
      assertType(spec, String);
      assert(Path.isAbsolute(spec), "Spec path must be absolute!");
      delete require.cache[spec];
      log.moat(1);
      log.white("test ");
      log.cyan(Path.relative(lotus.path, spec));
      log.moat(1);
      return module.optional(spec, function(error) {
        log.moat(1);
        log.red("Failed to load test: ");
        log.white(spec);
        log.moat(1);
        throw error;
      });
    });
    return this.suite.start();
  },
  _initSuite: function(modulePath) {
    var suite;
    suite = module.optional(modulePath);
    if (suite) {
      suite.entry = lotus.resolve(suite.path);
      return suite;
    }
    log.moat(1);
    log.red("Unknown suite: ");
    log.white(modulePath);
    log.moat(1);
    return process.exit();
  },
  _initReporter: function(modulePath) {
    var reporter;
    if (!modulePath) {
      return;
    }
    reporter = module.optional(modulePath);
    if (reporter) {
      return reporter;
    }
    log.moat(1);
    log.red("Unknown reporter: ");
    log.white(modulePath);
    log.moat(1);
    return process.exit();
  },
  _initExtensions: function(extensions) {
    if (isType(extensions, Array)) {
      extensions = extensions.join("|");
    }
    return RegExp(".*\\.(" + extensions + ")$", "i");
  },
  _loadPaths: function(paths) {
    var specs;
    assertType(paths, Array);
    specs = [];
    return Q.all(sync.map(paths, (function(_this) {
      return function(path, index) {
        path = _this._resolve(path, index);
        return _this._loadSpecs(path, specs);
      };
    })(this))).then(function() {
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

//# sourceMappingURL=../../map/src/runner.map
