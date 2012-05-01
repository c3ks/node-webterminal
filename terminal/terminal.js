
function extend(o){
	for(var i = 1; i < arguments.length; i++)
		for(var key in arguments[i])
			o[key] = arguments[i].key;
	return o;
}

var CHR = {
	BELL: '\x07';
	BS: '\x08';
	LF: '\x0a';
	CR: '\x0d';
	ESCAPE: '\x1b';
	DEL: '\x7f';
	BLANK: ' ';
}

var ESCAPESEQ = {
	'[': function(terminal, data) {
	},
}

function TermBuffer(width, height, opts) {
	this.cursor = {x:0,y:0};
	this.width = width || 80;
	this.height = height || 24;
	this.rowOffset = 0;
	this.attr = {
		fg: 15,
		bg: 0,
		bold: false,
		underline: false,
		blink: false,
	}
	this.lines = [];
	extend(this.attr, opts);
}
TermBuffer.prototype = {
	write: function(data) {
		if(data.length === 0)
			return;
		
		var c = this.cursor;
		for(var i = 0; i < data.length; i++) {
			if(data[i] === CHR.LF)
				this.lineFeed(true);
			else {
				if(data[i].attr === undefined)
					data[i].attr = extend({}, this.attr);
				this._currentLine()[c.x] = data[i];
				if(++c.x >= this.width)
					this.lineFeed();
			}
		}
	},
	setChar: function(chr) {
		this._currentLine()[c.x] = data[i];
	}
	lineFeed: function(hard) {
		var c = this.cursor;
		this._currentLine().terminated = hard;
		c.x = 0;
		c.y++;
		if(c.y >= this.height) {
			c.y = this.height - 1;
			this.rowOffset++;
		}
	},
	_currentLine: function() {
		var c = this.cursor;
		if(this.lines[this.rowOffset + c.y] === undefined)
			this.lines[this.rowOffset + c.y] = [];
		return this.lines[this.rowOffset + c.y];
	},
	delete: function() {
		this._currentLine()[c.x]
		// TODO
	}
	toString: function() {
		var ret = Array();
		for(var i = this.rowOffset; i < this.lines.length; i++) {
			ret.push(this.lines[i].join(''));
		}
		return ret.join(CHR.LF);
	}
}


function Terminal(width, height) {
	this.buffers = { def: new TermBuffer(width, height, {}), alt: new TermBuffer(width, height, {}) };
	this.currentBuffer = 'def';
	this.escapeBuffer = null;
	this.isEscape = false;
}

Terminal.prototype = {
	colors: [
		'#000000',
		'#aa0000',
		'#00aa00',
		'#aa5500',
		'#0000aa',
		'#aa00aa',
		'#00aaaa',
		'#aaaaaa',
		'#000000',
		'#ff5555',
		'#55ff55',
		'#ffff55',
		'#5555ff',
		'#ff55ff',
		'#55ffff',
		'#ffffff'
	],
	escapeWrite: function(data) {
		if(data === "")
			return 0;
		if(this.escapeBuffer !== null)
			data += this.escapeBuffer;
		if(ESCAPESEQ[data[0]]) {
			var result = ESCAPESEQ[data[0]](this, data);
			// 0 characters consumed, means incomplete data
			if(result === 0) {
				this.escapeBuffer = data;
				return data.length;
			}
			else {
				this.escapeBuffer = null;
			}
		}
		else {
			console.log("Unknown escape sequence ^["+data[0]);
		}
		return 0;
	}
	write: function(data) {
		var start = 0
		if(this.escapeBuffer !== null)
			start = this.escapeWrite(data)
		for(var i = start; i < data.length; i++) {
			switch(data[i]) {
				case BELL:
					this.onBell();
					break;
				case BS:
					this.left();
					this.currentBuffer().setChar(' ');
					break;
				case CR:
					this.currentBuffer().cursor.x = 0;
					break;
				case ESCAPE:
					i += this.escapeWrite(data.slice(++i));
					break;
				case DEL:
					// TODO
					break;
				default:
					this.currentBuffer().write(data[i]);
			}
		}
		this.getBuffer().write(data);
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
	getBuffer: function() {
		return this.buffers[this.currentBuffer];
	}
	toString: function() {
		return this.getBuffer().toString();
	},
	onBell: function() {}
	onUpdate: function() {}
}

exports.Terminal = Terminal;
exports.TermBuffer = TermBuffer;
