var fs = require('fs')
  , terminal = require('./terminal/terminal');
var vt100 = fs.readFileSync("vt100test.txt");

var t = new terminal.Terminal();
t.write(vt100);
console.log(t.toString());
