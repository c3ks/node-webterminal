function IoWrapper (callback) {
	this.socket = io.connect('http://localhost');
	this.socket.on("ptydata", function (data) {
		callback(data);
		data.data = "";
	});
}

IoWrapper.prototype = {
	send: function (text) {
		console.debug(text);
		this.socket.emit("input", text);
	}
};
