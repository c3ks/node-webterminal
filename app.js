/**
 * Module dependencies.
 */

var connect = require('connect')
  , socketio = require('socket.io')
  , PtyController = require('./controllers/ptycontroller').PtyController
  , routes = require('./routes')

// Configuration

var app = connect()
	.use(connect.logger('dev'))
	.use(connect.static('public'))
	.use(connect.static('dist'))
	.listen(3000);

var io = socketio.listen(app);

io.sockets.on('connection', function(socket) {
	console.log("New Connection opened");
	new PtyController(socket, "sh")
});
