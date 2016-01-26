// Generated by CoffeeScript 1.10.0
(function() {
  var Runner, argv, async, combine, defaults, minimist, options, ref, runner, specs, sync;

  require("lotus-require");

  ref = require("io"), sync = ref.sync, async = ref.async;

  minimist = require("minimist");

  combine = require("combine");

  defaults = {
    _: null,
    suite: "lotus-jasmine",
    reporter: "lotus-jasmine/reporter"
  };

  argv = process.argv.slice(3);

  options = combine({}, defaults, minimist(argv));

  sync.each(argv, function(arg, index) {
    var reporter, suite;
    if (arg.slice(0, 2) === "--") {
      switch (arg.slice(2)) {
        case "suite":
          suite = argv[index + 1];
          if (typeof suite === "string") {
            return options.suite = suite;
          }
          break;
        case "reporter":
          reporter = argv[index + 1];
          if (typeof reporter === "string") {
            return options.reporter = reporter;
          }
      }
    }
  });

  sync.each(options, function(value, key) {
    if (defaults.hasOwnProperty(key)) {
      return;
    }
    return async["throw"]({
      error: Error("'" + key + "' is not a valid option"),
      code: "INVALID_OPTION",
      format: function() {
        return {
          simple: true
        };
      }
    });
  });

  specs = options._;

  if (specs.length === 0) {
    async["throw"]({
      error: Error("No specs were found."),
      code: "NO_SPECS_FOUND",
      format: {
        simple: true
      }
    });
  }

  delete options._;

  Runner = require("./runner");

  runner = Runner(options);

  runner.start(specs).done();

}).call(this);
