exports.globalDependencies = ["lotus-watch"];

exports.initCommands = function() {
  return {
    test: function() {
      return require("./cli");
    }
  };
};

//# sourceMappingURL=map/index.map
