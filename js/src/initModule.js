var Path, Runner, WeakMap, callFunction, clearRequire, combine, initFiles, optionDefaults, runSpec;

clearRequire = require("clear-require");

WeakMap = require("weak-map");

combine = require("combine");

Path = require("path");

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
  var crawlingSpec, crawlingSrc;
  options = combine({}, optionDefaults, options);
  crawlingSpec = module.crawl(options.spec, function(file, event) {
    if (event === "unlink") {
      return;
    }
    clearRequire(file.path);
    return runSpec(file, options);
  }).then(function(files) {
    return initFiles("spec", files);
  });
  crawlingSrc = module.crawl(options.src, function(file, event) {
    if (event === "unlink") {
      return;
    }
    return clearRequire(file.path);
  });
  return Q.all([crawlingSpec, crawlingSrc]);
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
    return Q.all(sync.map(files, function(file) {
      file.dirname = dirname;
      file.source = getSourcePath(file.path, file.module);
      return file.load();
    }));
  };
});

runSpec = function(file, options) {
  return Runner(options).start([file.path]).done();
};

//# sourceMappingURL=../../map/src/initModule.map
