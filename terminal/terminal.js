var util = require('./util');
var csi = require('./csi').csi;
var osc = require('./osc').osc;
var TermBuffer = require('./termbuffer').TermBuffer;

var CHR = {
	BELL: '\x07',
	BS: '\x08',
	LF: '\x0a',
	CR: '\x0d',
	ESCAPE: '\x1b',
	DEL: '\x7f'
}

function Terminal(width, height) {
	this.buffers = { def: new TermBuffer(width, height, {}), alt: new TermBuffer(width, height, {}) };
	this.currentBuffer = 'def';
	this.escapeBuffer = null;
	this.isEscape = false;
	this.savedCursor = {x:0,y:0};
	this.showCursor = true;
}

Terminal.prototype = {
	colors: [
		"rgb(0, 0, 0)",
		"rgb(170, 0, 0)",
		"rgb(0, 170, 0)",
		"rgb(170, 85, 0)",
		"rgb(0, 0, 170)",
		"rgb(170, 0, 170)",
		"rgb(0, 170, 170)",
		"rgb(170, 170, 170)",

		"rgb(85, 85, 85)",
		"rgb(255, 85, 85)",
		"rgb(85, 255, 85)",
		"rgb(255, 255, 85)",
		"rgb(85, 85, 255)",
		"rgb(255, 85, 255)",
		"rgb(85, 255, 255)",
		"rgb(255, 255, 255)"
	],
	escapeWrite: function(data) {
		if(data === "")
			return 0;
		if(this.escapeBuffer !== null)
			data += this.escapeBuffer;
		var result = 0;
		switch(data[0]) {
			case '[':
				result = csi(data, this);
				break;
			case ']':
				result = osc(data, this);
			default:
				console.log("Unknown escape character ^[" + data[0]);
				return 0;
		}
		if(result == 0)
			this.escapeBuffer = null;
		return result < 0 ? 0 : result;
	},
	write: function(data) {
		var start = 0
		if(this.escapeBuffer !== null)
			start = this.escapeWrite(data)
		for(var i = start; i < data.length; i++) {
			switch(data[i]) {
				case CHR.BELL:
					this.onBell();
					break;
				case CHR.BS:
					this.curRel({x: -1});
					this.currentBuffer().setChar(' ');
					break;
				case CHR.CR:
					this.curAbs({x: 0});
					break;
				case CHR.ESCAPE:
					i += this.escapeWrite(data.slice(++i));
					break;
				case CHR.DEL:
					// TODO
					break;
				default:
					this.getBuffer().write(data[i]);
			}
		}
	},
	resize: function(width, height) {
		for(var k in this.buffers) {
			var oldBuffer = this.buffers[k];
			var newBuffer = new TermBuffer(width, height);
			for(var i = 0; i < oldBuffer.lines.length; i++) {
				var line = oldBuffer.lines[i]
				newBuffer.write(line);
				if(line.terminated)
					newBuffer.lineFeed();
				newBuffer.cursor = {x:0, y:0};
			}
			this.buffers[k] = newBuffer
		}
	},
	curRel: function(obj) {
		obj = util.extend({}, obj);
		obj.x = (obj.x === undefined ? obj.x : 0) + this.getBuffer().cursor.x;
		obj.y = (obj.y === undefined ? obj.y : 0) + this.getBuffer().cursor.y;
		return this.curAbs(obj)
	},
	curAbs: function(obj) {
		var buffer = this.getBuffer();
		obj.x = Math.max(obj.x, buffer.width-1);
		obj.y = Math.max(obj.y, buffer.height-1);
		if(obj.x !== undefined)
			buffer.cursor.x = obj.x;
		if(obj.y !== undefined)
			buffer.cursor.y = obj.y;
		return this;
	},
	getBuffer: function() {
		return this.buffers[this.currentBuffer];
	},
	toString: function() {
		return this.getBuffer().toString();
	},
	eraseData: function(type) {
		// TODO
	},
	eraseLine: function(type) {
		// TODO
	},
	saveCur: function() {
		this.savedCursor = this.getBuffer().cursor;
	},
	restCur: function() {
		this.getBuffer().cursor = this.savedCursor;
	},
	onBell: function() {},
	onUpdate: function() {}
}

exports.Terminal = Terminal;
