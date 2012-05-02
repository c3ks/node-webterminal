/**
 * Module dependencies.
 */

var connect = require('connect')
  , socketio = require('socket.io');
  , controllers = require('./controllers')
  , routes = require('./routes')

// Configuration

var app = connect()
	.use(connect.logger('dev'))
	.use(connect.static('public'))
	.listen(3000);

var io = socketio.listen(app);
