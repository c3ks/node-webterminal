var pty = require("pty.js");

function PtyController(socket, exec) {
	var self = this;
	this.socket = socket;
	this.exec = exec || "login";
	this.ptys = {}
	socket.on('ptyinit', function(data) { self.init(data) })
	socket.on('ptyinput', function(data) { self.input(data) })
	socket.on('ptysignal', function(data) { self.signal(data) })
	socket.on('ptyexit', function(data) { self.exit(data) })
	socket.on('disconnect', function() { self.finalize() })
}

PtyController.prototype = {
	init: function(data) {
		var self = this
		var id = data.id;
		if(this.ptys[id])
			return;
		var proc = pty.spawn(this.exec, [], {
			name: "xterm",
			cols: data.cols || 80,
			rows: data.rows || 24,
			cwd: process.env.HOME,
			env: process.env
		});

		proc.on("data", function(data) {
			self.socket.emit("ptydata", { id: id, data: data });
		});

		proc.on("exit", function() {
			self.socket.emit("ptyexit", { id: id, data: data });
		});
		this.ptys[id] = proc;
	},

	input: function(data) {
		if(this.ptys[data.id])
			this.ptys[data.id].write(data.data);
	},

	signal: function(data) {
		if(this.ptys[data.id])
			this.ptys[data.id].kill(data.data);
	},

	exit: function(data) {
		if(this.ptys[data.id]) {
			this.ptys[data.id].kill("SIGHUP");
			this.ptys[data.id].end();
		}
	},

	finalize: function() {
		for(var id in this.ptys) {
			this.ptys[id].kill("SIGHUP");
			this.ptys[id].end();
		}
	},
}

exports.PtyController = PtyController;
