exports.globalDependencies = ["lotus-watch"];

exports.initCommands = function() {
  return {
    test: function() {
      return require("./cli");
    }
  };
};

exports.initModule = function() {
  return require("./initModule");
};

//# sourceMappingURL=../../map/src/index.map
