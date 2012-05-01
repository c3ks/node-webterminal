/**
 * Module dependencies.
 */

var connect = require('connect')
  , controllers = require('./controllers')
  , routes = require('./routes')
  , socketio = require('socket.io');

// Configuration

var app = connect()
	.use(connect.logger('dev'))
	.use(connect.static('public'))
	.listen(3000);

var io = socketio.listen(app);
