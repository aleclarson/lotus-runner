var Path, Runner, WeakMap, clearRequire, combine, getSourcePath, initFiles, optionDefaults, runSpec;

clearRequire = require("clear-require");

WeakMap = require("weak-map");

combine = require("combine");

Path = require("path");

Runner = require("./runner");

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

getSourcePath = function(path, module) {
  var dir, ext, name;
  ext = Path.extname(path);
  name = Path.basename(path, ext);
  dir = Path.basename(Path.dirname(path));
  return Path.join(module.path, dir, name + ".coffee");
};

initFiles = function(dirname, files) {
  return Q.all(sync.map(files, function(file) {
    file.dirname = dirname;
    return file.source = getSourcePath(file.path, file.module);
  }));
};

runSpec = function(file, options) {
  return Runner(options).start([file.path]).done();
};

//# sourceMappingURL=../../map/src/initModule.map
