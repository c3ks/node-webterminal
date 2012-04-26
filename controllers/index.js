var exec = require('child_process').exec;
var child;

exports.mypty = function(input, callback) {
  child = exec(input, function (error, stdout, stderr) {
    if (error === null)
      callback(stdout);
  });
};
