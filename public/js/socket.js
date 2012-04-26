var IoWrapper = {

	send: function (text, callback) {
		var socket = io.connect('http://localhost');

		socket.on('receive', function (data) {
			callback(data.data);
		});
		socket.emit("send", {data: text});
	}
};
