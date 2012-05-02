var util = require('./util');
var LF = '\n'

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
		inverse: false
	}
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
				if(data[i].attr === undefined)
					data[i].attr = util.extend({}, this.attr);
				this.currentLine()[c.x] = data[i];
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
					l.push(this.lines[i][j] ? this.lines[i][j] : ' ');
			ret.push(l.join(''));
		}
		return ret.join(LF);
	},
	setCursor: function(obj) {
		this.diff[this.cursor.y] = true;
		for(var k in {x:1, y:1}) {
			if(obj[k] !== undefined) {
				obj[k] = Math.min(obj[k], this.width-1);
				obj[k] = Math.max(obj[k], 0);
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
	}
}

exports.TermBuffer = TermBuffer;
