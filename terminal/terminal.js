var util = require('./util');
var csi = require('./csi').csi;
var osc = require('./osc').osc;
var ansi = require('./ansi').ansi;
var TermBuffer = require('./termbuffer').TermBuffer;
var TermDiff = require('./termdiff').TermDiff;

var CHR = {
	BELL: '\x07',
	BS: '\x08',
	LF: '\x0a',
	CR: '\x0d',
	ESCAPE: '\x1b',
	DEL: '\x7f',
	TAB: '\t',
	TABSET: '\x88'
}

function Terminal(width, height) {
	this.buffers = { def: new TermBuffer(width, height, {}), alt: new TermBuffer(width, height, {}) };
	this.buffers.alt.crlf = false;

	this.termDiff = new TermDiff();
	this.currentBuffer = 'def';
	this.escapeBuffer = null;
	this.isEscape = false;
	this.savedCursor = {x:0,y:0};
	this.title = "";
	this.leds = {1:false,2:false,3:false,4:false}
}

Terminal.prototype = {
	writable: true,
	write: function(data, encoding) {
		var i = 0;
		if(typeof data !== 'string')
			data = data.toString(encoding);

		if(this.escapeBuffer !== null) {
			data = this.escapeBuffer + data;
			i = this.escapeWrite(data);
		}
		var buffer = this.getBuffer();
		for(; i < data.length; i++) {
			switch(data[i]) {
				case CHR.BELL:
					this.onBell(this);
					break;
				case CHR.BS:
					buffer.mvCur(-1, 0);
					break;
				case CHR.CR:
					buffer.setCur({x: 0});
					break;
				case CHR.ESCAPE:
					i += this.escapeWrite(data.slice(++i));
					break;
				case CHR.DEL:
					buffer.deleteChar(1);
					break;
				case CHR.TABSET:
					buffer.setTab();
					break;
				case CHR.TAB:
					buffer.mvTab(1);
					break;
				default:
					buffer.write(data[i]);
			}
		}
		return true;
	},
	end: function(data, encoding) {
		this.writable = false;
		if(data !== undefined)
			return this.write(data, encoding);
	},
	destroy: function() {
		this.writable = false;
	},
	destroySoon: function() {
		this.writable = false;
	},
	escapeWrite: function(data) {
		if(data === "")
			return 0;
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
		this.escapeBuffer = null;
		if(result == 0) {
			this.escapeBuffer = data;
			result = data.length;
		}
		console.log(data.slice(0, result))
		return result < 0 ? 0 : result;
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
	diff: function() {
		return this.termDiff.diff(this.getBuffer());
	},
	toString: function(locateCursor) {
		return this.getBuffer().toString(locateCursor);
	},
	saveCur: function() {
		this.savedCursor = util.extend({}, this.getBuffer().cursor);
		return this;
	},
	restCur: function() {
		this.buffers.def.setCur(this.savedCursor);
		this.buffers.alt.setCur(this.savedCursor);
	},
	metachanged: function() {
		this.onMetaChange(this, this.title, this.leds);
	},
	onBell: function(terminal) {},
	onMetaChange: function(terminal, title, leds) {},
	eventToKey: function(event) {
		var appCursor = this.getBuffer().appCursor;
		switch(event.which) {
			case 38: // up
				return appCursor ? "\x1bOA" : "\x1b[A";
			case 40: // down
				return appCursor ? "\x1bOB" : "\x1b[B";
			case 39: // right
				return appCursor ? "\x1bOC" : "\x1b[C";
			case 37: // left
				return appCursor ? "\x1bOD" : "\x1b[D";
			case 8:
				return "\x08";
			case 9:
				return "\t";
			default:
				return String.fromCharCode(event.which);
		}
	}
}

exports.Terminal = Terminal;
