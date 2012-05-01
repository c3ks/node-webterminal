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
	}
	util.extend(this.defaultAttr, opts);
	this.attr = util.extend({}, this.attr);
	this.lines = [];
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
		}
	},
	setChar: function(chr) {
		this.currentLine()[c.x] = data[i];
	},
	lineFeed: function(hard) {
		var c = this.cursor;
		this.currentLine().terminated = hard;
		c.x = 0;
		c.y++;
		if(c.y >= this.height) {
			c.y = this.height - 1;
			this.rowOffset++;
		}
	},
	currentLine: function() {
		var c = this.cursor;
		if(this.lines[this.rowOffset + c.y] === undefined)
			this.lines[this.rowOffset + c.y] = [];
		return this.lines[this.rowOffset + c.y];
	},
	lineNumber: function() {
		return this.rowOffset + this.cursor.y;
	},
	delete: function() {
		this.currentLine()[c.x]
		// TODO
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
	}
}

exports.TermBuffer = TermBuffer;
