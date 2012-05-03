var pty = require("pty.js");


exports.mypty = function(socket) {

	var proc = pty.spawn("sh", [], {
		name: "xterm",
		cols: 80,
		rows: 24,
		cwd: process.env.HOME,
		env: process.env
	});

	proc.on("data", function(data) {
		socket.emit("ptydata", data);
	});

	proc.on("exit", function() {
		socket.emit("ptyexit");
	});


	socket.on("input", function(input) {
		console.log("Input received");
		console.log(input);
		proc.write(input);
	});

	socket.on("disconnect", function() {
		proc.end();
	});
};
