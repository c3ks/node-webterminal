var util = require('./util');
var LF = '\n'
var graphics = {
	'`': '\u25C6',
	'a': '\u2592',
	'b': '\u2409',
	'c': '\u240C',
	'd': '\u240D',
	'e': '\u240A',
	'f': '\u00B0',
	'g': '\u00B1',
	'h': '\u2424',
	'i': '\u240B',
	'j': '\u2518',
	'k': '\u2510',
	'l': '\u250C',
	'm': '\u2514',
	'n': '\u253C',
	'o': '\u23BA',
	'p': '\u23BB',
	'q': '\u2500',
	'r': '\u23BC',
	's': '\u23BD',
	't': '\u251C',
	'u': '\u2524',
	'v': '\u2534',
	'w': '\u252C',
	'x': '\u2502',
	'y': '\u2264',
	'z': '\u2265',
	'{': '\u03C0',
	'|': '\u2260',
	'}': '\u00A3',
	'~': '\u00B7',
}

function TermBuffer(width, height, opts) {
	this.cursor = {x:0,y:0};
	this.width = width || 80;
	this.height = height || 24;
	this.rowOffset = 0;
	this.defaultAttr = {
		fg: 15,
		bg: 0,
		bold: false,
		underline: false,
		blink: false,
		inverse: false,
		graphics: false
	}
	this.scrollArea = [0, height - 1];
	util.extend(this.defaultAttr, opts);
	this.attr = util.extend({}, this.attr);
	this.lines = [];
	this.diff = {};
}
TermBuffer.prototype = {
	write: function(data) {
		if(data.length === 0)
			return;
		
		var c = this.cursor;
		for(var i = 0; i < data.length; i++) {
			if(data[i] === LF)
				this.lineFeed(true);
			else {
				this.currentLine()[c.x] = { chr: data[i], attr: util.extend({}, this.attr) };
				if(++c.x >= this.width)
					this.lineFeed();
			}
			this.diff[c.y] = true;
		}
	},
	setChar: function(chr) {
		var c = this.cursor;
		this.diff[c.y] = true;
		this.currentLine()[c.x] = data[i];
	},
	lineFeed: function(hard) {
		var c = this.cursor;
		this.currentLine().terminated = hard;
		c.x = 0;
		this.diff[c.y] = true;
		c.y++;
		this.diff[c.y] = true;
		if(c.y >= this.height) {
			c.y = this.height - 1;
			this.rowOffset++;
		}
	},
	currentLine: function() {
		var n = this.lineNumber()
		if(this.lines[n] === undefined)
			this.lines[n] = [];
		return this.lines[n];
	},
	lineNumber: function() {
		return this.rowOffset + this.cursor.y;
	},
	delete: function(n) {
		var c = this.cursor;
		this.currentLine().splice(c.x, n);
	},
	toString: function() {
		var ret = Array();
		for(var i = this.rowOffset; i < this.lines.length; i++) {
			var l = [];
			if(this.lines[i])
				for(var j = 0; j < this.lines[i].length; j++)
					if(this.lines[i][j]) {
						if(this.lines[i][j].attr.graphic && graphics[this.lines[i][j].chr])
							l.push(graphics[this.lines[i][j].chr]);
						else
							l.push(this.lines[i][j].chr);
					}
					else
						l.push(' ')
			ret.push(l.join(''));
		}
		return ret.join(LF);
	},
	setCursor: function(obj) {
		this.diff[this.cursor.y] = true;
		var dim = {x:'width', y:'height'};
		for(var k in dim) {
			if(obj[k] !== undefined) {
				obj[k] = Math.max(Math.min(obj[k], this[dim[k]]-1), 0);
				this.cursor[k] = obj[k];
			}
		}
		this.diff[this.cursor.y] = true;
	},
	dump: function(withScrollback) {
		if(withScrollback)
			return this.lines;
		return this.lines.slice(this.rowOffset);
	},
	dumpDiff: function() {
		var diff = this.diff;
		this.diff = {};
		for(var k in diff) {
			diff[k] = this.lines[parseInt(k) + this.rowOffset] || [];
		}
		return diff;
	},
	setScrollArea: function(n, m) {
		if(n === undefined || m === undefined)
			this.scrollArea = [0, height - 1];
		else {
			for(var i = 0; i < 2; i++)
				this.scrollArea[i] = Math.max(Math.min(arguments[i], this.height - 1), 0);
		}
	}
}

exports.TermBuffer = TermBuffer;
