var sgr = require('./sgr').sgr;

var CSI_PATTERN = /^\[([?])?([0-9;]*)?([@A-Za-z`])/;

exports.csi = function(data, terminal) {
	var match = CSI_PATTERN.exec(data);
	if(match === null)
		return 0;
	var args = (match[2] || '1').split(';');
	args.unshift(terminal, terminal.getBuffer())
	if(commands[match[3]])
		commands[match[3]].apply(terminal, args);
	else {
		console.log("Unknown CSI-command '"+match[0]+"'");
		return -1;
	}
	return match[0].length;
}

var commands = {
	'A': function(terminal, buffer, n) {
		n--;
		buffer.mvCur(0, -n);
	},
	'B': function(terminal, buffer, n) {
		n--;
		buffer.mvCur(0, n);
	},
	'C': function(terminal, buffer, n) {
		n--;
		buffer.mvCur(n, 0);
	},
	'D': function(terminal, buffer, n) {
		terminal.mvCur(-n, 0);
	},
	'E': function(terminal, buffer, n) {
		n--;
		buffer.mvCur(0, n).setCur({x: 0});
	},
	'F': function(terminal, buffer, n) {
		n--;
		buffer.mvCur(0, -n).setCur({x: 0});
	},
	'G': function(terminal, buffer, n) {
		n--;
		buffer.setCur({x: n});
	},
	'H': function(terminal, buffer, n, m) {
		n = n === undefined ? 0 : n - 1;
		m = m === undefined ? 0 : m - 1;
		buffer.setCur({y: n, x: m});
	},
	'J': function(terminal, buffer, n) {
		buffer.eraseData(n);
	},
	'K': function(terminal, buffer, n) {
		buffer.eraseLine(n);
	},
	'S': function(terminal, buffer, n) {
		terminal.scroll(-n);
	},
	'T': function(terminal, buffer, n) {
		terminal.scroll(n);
	},
	'f': function(terminal, buffer, n) {
		commands.H(terminal, n);
	},
	'm': function(terminal, buffer) {
		sgr(terminal, Array.prototype.slice.call(arguments, 2));
	},
	'q': function(terminal, buffer, n) {
		terminal.setLed(n);
	},
	'r': function(terminal, buffer, n, m) {
		buffer.setScrollArea(n-1, m-1);
	},
	's': function(terminal, buffer) {
		terminal.curSave();
	},
	'u': function(terminal, buffer) {
		terminal.curRest();
	},
	'l': function(terminal, buffer) {
		terminal.showCursor = false;
	},
	'h': function(terminal, buffer) {
		terminal.showCursor = true;
	}
}
