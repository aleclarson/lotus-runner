var Benchmark, Path, Q, Runner, Type, assert, assertType, asyncFs, isType, ref, sync, syncFs, type;

ref = require("type-utils"), assert = ref.assert, assertType = ref.assertType, isType = ref.isType;

Benchmark = require("benchmark");

asyncFs = require("io/async");

syncFs = require("io/sync");

Type = require("Type");

Path = require("path");

sync = require("sync");

Q = require("q");

type = Type("Runner");

type.optionTypes = {
  suite: String,
  reporter: String.Maybe,
  extensions: [String, Array],
  bench: Boolean
};

type.optionDefaults = {
  suite: "lotus-jasmine",
  reporter: "lotus-jasmine/reporter",
  extensions: "js",
  bench: false
};

type.defineFrozenValues({
  suite: function(options) {
    var suite;
    suite = module.optional(options.suite);
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
    reporter = module.optional(options.reporter);
    assert(reporter, {
      options: options,
      reason: "Failed to load reporter!"
    });
    return reporter;
  },
  extensions: function(arg) {
    var extensions;
    extensions = arg.extensions;
    if (isType(extensions, Array)) {
      extensions = extensions.join("|");
    }
    return RegExp(".*\\.(" + extensions + ")$", "i");
  }
});

type.defineValues({
  _specPath: function(options) {
    return options.specPath;
  }
});

type.initInstance(function(options) {
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

module.exports = Runner = type.build();

//# sourceMappingURL=../../map/src/runner.map
