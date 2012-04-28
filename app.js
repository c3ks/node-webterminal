/**
 * Module dependencies.
 */

var connect = require('connect')
  , controllers = require('./controllers')
  , routes = require('./routes');

var app = connect()
  , io = require('socket.io').listen(app);

// Configuration

var app = connect()
	.use(connect.logger('dev'))
	.use(connect.static('public'))
	.listen(3000);

