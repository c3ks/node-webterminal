var util = require('./util');
var csi = require('./csi').csi;
var osc = require('./osc').osc;
var ansi = require('./ansi').ansi;
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
	this.title = "";
	this.leds = {1:false,2:false,3:false,4:false}
	this.showCursor = true;
}

Terminal.prototype = {
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
				break;
			default:
				result = ansi(data, this);
				if(result === -1)
					console.log("Unknown escape character ^[" + data[0])
		}
		if(result == 0)
			this.escapeBuffer = null;
		return result < 0 ? 0 : result;
	},
	write: function(data) {
		var i = 0;
		data = data.toString();
		if(this.escapeBuffer !== null)
			i = this.escapeWrite(data);
		for(; i < data.length; i++) {
			switch(data[i]) {
				case CHR.BELL:
					this.onBell(this);
					break;
				case CHR.BS:
					this.getBuffer().mvCur(-1, 0);
					this.getBuffer().editChar().chr = null;
					break;
				case CHR.CR:
					this.getBuffer().setCur({x: 0});
					break;
				case CHR.ESCAPE:
					i += this.escapeWrite(data.slice(++i));
					break;
				case CHR.DEL:
					this.currentBuffer().delete(1);
					break;
				default:
					this.getBuffer().write(data[i]);
			}
		}
		this.updated();
		return this;
	},
	setLed: function(n) {
		if(n == 0)
			for(var k in this.leds)
				this.leds[k] = false;
		else
			this.leds[n] = true;
		this.metachanged();
		return this;
	},
	resize: function(width, height) {
		for(var k in this.buffers) {
			this.buffers[k].resize(width, height);
		}
	},
	getBuffer: function() {
		return this.buffers[this.currentBuffer];
	},
	toString: function() {
		return this.getBuffer().toString();
	},
	saveCur: function() {
		this.savedCursor = this.getBuffer().cursor;
		return this;
	},
	restCur: function() {
		return this.setCur(this.savedCursor);
	},
	updated: function() {
		this.onUpdate(this, this.getBuffer());
	},
	metachanged: function() {
		this.onMetaChange(this, this.title, this.leds);
	},
	cursorVisible: function(visible) {
		this.showCursor = visible;
		var diff = {};
		diff[getBuffer().lineNumber()] = buffer.currentLine();
		onUpdate(this, diff);
	},
	onBell: function(terminal) {},
	onUpdate: function(terminal, buffer) {},
	onMetaChange: function(terminal, title, leds) {}
}

exports.Terminal = Terminal;
