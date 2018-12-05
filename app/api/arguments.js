//
// Module to expose functionality related to command-line arguments
//

var args = exports

args.ArgumentExists = function(argument) {
  var electron = require('electron')

  var args = electron.remote.process.argv

  for (var i = 2; i < args.length; i++) {
    if (args[i] === argument) return true
  }

  return false
}
