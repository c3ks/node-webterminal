function IoWrapper (callback) {
	var self = this;

	this.terminal = new terminal.Terminal(80, 24);

	this.socket = io.connect('http://localhost');
	this.socket.on("ptydata", function (data) {
		self.terminal.write(data);
		callback(data, self.terminal);
	});
}

IoWrapper.prototype = {
	send: function (text) {
		this.socket.emit("input", text);
	}
};
