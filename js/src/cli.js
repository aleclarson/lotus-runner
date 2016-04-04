var Path, Runner, bench, combine, extensions, globby, parentDir, parseBool, ref, reporter, runner, specDir, specRegex, specs, suite, syncFs, tryToReadDir;

parseBool = require("parse-bool");

combine = require("combine");

syncFs = require("io/sync");

globby = require("globby");

Path = require("path");

Runner = require("./runner");

ref = process.options, bench = ref.bench, suite = ref.suite, reporter = ref.reporter, extensions = ref.extensions;

if (isType(bench, String)) {
  bench = parseBool(bench);
}

if (bench == null) {
  bench = false;
}

specDir = process.options._[1];

if (specDir == null) {
  specDir = ".";
}

if (!Path.isAbsolute(specDir)) {
  parentDir = specDir[0] === "." ? process.cwd() : lotus.path;
  specDir = Path.resolve(parentDir, specDir);
}

tryToReadDir = function(dir) {
  var files;
  if (!syncFs.isDir(dir)) {
    return false;
  }
  files = globby.sync("*.js", {
    cwd: dir,
    matchBase: true
  });
  return files.map(function(path) {
    return Path.resolve(dir, path);
  });
};

if (syncFs.isDir(specDir)) {
  specs = tryToReadDir(specDir + "/js/spec");
  if (!specs) {
    specs = tryToReadDir(specDir + "/spec");
  }
  if (!specs) {
    specs = tryToReadDir(specDir);
  }
} else if (syncFs.isFile(specDir)) {
  specs = [specDir];
} else {
  log.moat(1);
  log.red("Error: ");
  log.white("'" + specDir + "' does not exist!");
  log.moat(1);
  process.exit();
}

specRegex = /\.js$/;

specs = specs.filter(function(spec) {
  return specRegex.test(spec);
});

if (specs.length === 0) {
  log.moat(1);
  log.red("Error: ");
  log.white("No tests were found.");
  log.moat(1);
  process.exit();
}

runner = Runner({
  bench: bench,
  suite: suite,
  reporter: reporter,
  extensions: extensions
});

runner.start(specs).done();

//# sourceMappingURL=../../map/src/cli.map
