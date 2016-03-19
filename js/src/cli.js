var Runner, bench, combine, minimist, options, parseBool, runner, specs, steal, validOptions;

require("lotus-require");

parseBool = require("parse-bool");

minimist = require("minimist");

combine = require("combine");

steal = require("steal");

validOptions = {
  suite: 1,
  reporter: 1,
  extensions: 1,
  bench: 1
};

options = minimist(process.argv.slice(3));

bench = options.bench;

if (isType(bench, String)) {
  bench = parseBool(bench);
}

options.bench = bench != null ? bench : bench = false;

specs = steal(options, "_");

if (specs.length === 0) {
  specs.push(".");
}

sync.each(options, function(value, key) {
  if (validOptions[key]) {
    return;
  }
  log.moat(1);
  log.red("Invalid option: ");
  log.white(key);
  log.moat(1);
  return process.exit();
});

Runner = require("./runner");

runner = Runner(options);

runner.start(specs).done();

//# sourceMappingURL=../../map/src/cli.map
