
module.exports = function (commands, options) {
  commands.test = function () {
    process.options = options
    require("./js/src/cli")
  }
}
