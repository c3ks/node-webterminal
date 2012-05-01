var sgr = require('./sgr').sgr;

var CSI_PATTERN = /^\[([?])?([0-9;]*)?([@A-Za-z`])/;

exports.csi = function(data, terminal) {
	var match = CSI_PATTERN.exec(data);
	if(match === null)
		return 0;
	var args = (match[2] || '1').split(';');
	args.unshift(terminal)
	if(commands[match[3]])
		commands[match[3]].apply(terminal, args);
	else {
		console.log("Unknown CSI-command '"+match[3]+"'");
		return -1;
	}
	return match[0].length;
}

var commands = {
	'A': function(terminal, n) {
		n--;
		terminal.curRel({y: -n});
	},
	'B': function(terminal, n) {
		n--;
		terminal.curRel({y: n});
	},
	'C': function(terminal, n) {
		n--;
		terminal.curRel({x: n});
	},
	'D': function(terminal, n) {
		n--;
		terminal.curRel({x: -n});
	},
	'E': function(terminal, n) {
		n--;
		terminal.curRel({y: n}).curAbs({x: 0});
	},
	'F': function(terminal, n) {
		n--;
		terminal.curRel({y: -n}).curAbs({x: 0});
	},
	'G': function(terminal, n) {
		n--;
		terminal.curAbs({x: n});
	},
	'H': function(terminal, n, m) {
		terminal.curAbs({y: n, x: m});
	},
	'J': function(terminal, n) {
		terminal.eraseData(n);
	},
	'K': function(terminal, n) {
		terminal.eraseLine(n);
	},
	'S': function(terminal, n) {
		terminal.scroll(-n);
	},
	'T': function(terminal, n) {
		terminal.scroll(n);
	},
	'f': function(terminal, n) {
		commands.H(terminal, n);
	},
	'm': function(terminal) {
		sgr(Array.prototype.slice.call(arguments, 1));
	},
	's': function(terminal) {
		terminal.curSave();
	},
	'u': function(terminal) {
		terminal.curRest();
	},
	'l': function(terminal) {
		terminal.showCursor = false;
	},
	'h': function(terminal) {
		terminal.showCursor = true;
	}
}
