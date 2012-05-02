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
		'#000000',
		'#aa0000',
		'#00aa00',
		'#aa5500',
		'#0000aa',
		'#aa00aa',
		'#00aaaa',
		'#aaaaaa',
		'#555555',
		'#ff5555',
		'#55ff55',
		'#ffff55',
		'#5555ff',
		'#ff55ff',
		'#55ffff',
		'#ffffff',
	],
	xtermColors: [
		'#000000',
		'#800000',
		'#008000',
		'#808000',
		'#000080',
		'#800080',
		'#008080',
		'#c0c0c0',
		'#808080',
		'#ff0000',
		'#00ff00',
		'#ffff00',
		'#0000ff',
		'#ff00ff',
		'#00ffff',
		'#ffffff',
		'#000000',
		'#00005f',
		'#000087',
		'#0000af',
		'#0000d7',
		'#0000ff',
		'#005f00',
		'#005f5f',
		'#005f87',
		'#005faf',
		'#005fd7',
		'#005fff',
		'#008700',
		'#00875f',
		'#008787',
		'#0087af',
		'#0087d7',
		'#0087ff',
		'#00af00',
		'#00af5f',
		'#00af87',
		'#00afaf',
		'#00afd7',
		'#00afff',
		'#00d700',
		'#00d75f',
		'#00d787',
		'#00d7af',
		'#00d7d7',
		'#00d7ff',
		'#00ff00',
		'#00ff5f',
		'#00ff87',
		'#00ffaf',
		'#00ffd7',
		'#00ffff',
		'#5f0000',
		'#5f005f',
		'#5f0087',
		'#5f00af',
		'#5f00d7',
		'#5f00ff',
		'#5f5f00',
		'#5f5f5f',
		'#5f5f87',
		'#5f5faf',
		'#5f5fd7',
		'#5f5fff',
		'#5f8700',
		'#5f875f',
		'#5f8787',
		'#5f87af',
		'#5f87d7',
		'#5f87ff',
		'#5faf00',
		'#5faf5f',
		'#5faf87',
		'#5fafaf',
		'#5fafd7',
		'#5fafff',
		'#5fd700',
		'#5fd75f',
		'#5fd787',
		'#5fd7af',
		'#5fd7d7',
		'#5fd7ff',
		'#5fff00',
		'#5fff5f',
		'#5fff87',
		'#5fffaf',
		'#5fffd7',
		'#5fffff',
		'#870000',
		'#87005f',
		'#870087',
		'#8700af',
		'#8700d7',
		'#8700ff',
		'#875f00',
		'#875f5f',
		'#875f87',
		'#875faf',
		'#875fd7',
		'#875fff',
		'#878700',
		'#87875f',
		'#878787',
		'#8787af',
		'#8787d7',
		'#8787ff',
		'#87af00',
		'#87af5f',
		'#87af87',
		'#87afaf',
		'#87afd7',
		'#87afff',
		'#87d700',
		'#87d75f',
		'#87d787',
		'#87d7af',
		'#87d7d7',
		'#87d7ff',
		'#87ff00',
		'#87ff5f',
		'#87ff87',
		'#87ffaf',
		'#87ffd7',
		'#87ffff',
		'#af0000',
		'#af005f',
		'#af0087',
		'#af00af',
		'#af00d7',
		'#af00ff',
		'#af5f00',
		'#af5f5f',
		'#af5f87',
		'#af5faf',
		'#af5fd7',
		'#af5fff',
		'#af8700',
		'#af875f',
		'#af8787',
		'#af87af',
		'#af87d7',
		'#af87ff',
		'#afaf00',
		'#afaf5f',
		'#afaf87',
		'#afafaf',
		'#afafd7',
		'#afafff',
		'#afd700',
		'#afd75f',
		'#afd787',
		'#afd7af',
		'#afd7d7',
		'#afd7ff',
		'#afff00',
		'#afff5f',
		'#afff87',
		'#afffaf',
		'#afffd7',
		'#afffff',
		'#d70000',
		'#d7005f',
		'#d70087',
		'#d700af',
		'#d700d7',
		'#d700ff',
		'#d75f00',
		'#d75f5f',
		'#d75f87',
		'#d75faf',
		'#d75fd7',
		'#d75fff',
		'#d78700',
		'#d7875f',
		'#d78787',
		'#d787af',
		'#d787d7',
		'#d787ff',
		'#d7af00',
		'#d7af5f',
		'#d7af87',
		'#d7afaf',
		'#d7afd7',
		'#d7afff',
		'#d7d700',
		'#d7d75f',
		'#d7d787',
		'#d7d7af',
		'#d7d7d7',
		'#d7d7ff',
		'#d7ff00',
		'#d7ff5f',
		'#d7ff87',
		'#d7ffaf',
		'#d7ffd7',
		'#d7ffff',
		'#ff0000',
		'#ff005f',
		'#ff0087',
		'#ff00af',
		'#ff00d7',
		'#ff00ff',
		'#ff5f00',
		'#ff5f5f',
		'#ff5f87',
		'#ff5faf',
		'#ff5fd7',
		'#ff5fff',
		'#ff8700',
		'#ff875f',
		'#ff8787',
		'#ff87af',
		'#ff87d7',
		'#ff87ff',
		'#ffaf00',
		'#ffaf5f',
		'#ffaf87',
		'#ffafaf',
		'#ffafd7',
		'#ffafff',
		'#ffd700',
		'#ffd75f',
		'#ffd787',
		'#ffd7af',
		'#ffd7d7',
		'#ffd7ff',
		'#ffff00',
		'#ffff5f',
		'#ffff87',
		'#ffffaf',
		'#ffffd7',
		'#ffffff',
		'#080808',
		'#121212',
		'#1c1c1c',
		'#262626',
		'#303030',
		'#3a3a3a',
		'#444444',
		'#4e4e4e',
		'#585858',
		'#626262',
		'#6c6c6c',
		'#767676',
		'#808080',
		'#8a8a8a',
		'#949494',
		'#9e9e9e',
		'#a8a8a8',
		'#b2b2b2',
		'#bcbcbc',
		'#c6c6c6',
		'#d0d0d0',
		'#dadada',
		'#e4e4e4',
		'#eeeeee',
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
		var i = 0;
		if(this.escapeBuffer !== null)
			i = this.escapeWrite(data)
		for(; i < data.length; i++) {
			switch(data[i]) {
				case CHR.BELL:
					this.onBell();
					break;
				case CHR.BS:
					this.mvCursor({x: -1});
					this.currentBuffer().setChar(' ');
					break;
				case CHR.CR:
					this.setCursor({x: 0});
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
	resize: function(width, height) {
		for(var k in this.buffers) {
			var oldBuffer = this.buffers[k];
			var newBuffer = new TermBuffer(width, height);
			for(var i = 0; i < oldBuffer.lines.length; i++) {
				var line = oldBuffer.lines[i]
				newBuffer.write(line);
				if(line.terminated)
					newBuffer.lineFeed(true);
				newBuffer.cursor = {x:0, y:0};
			}
			this.buffers[k] = newBuffer
		}
		this.updated();
	},
	mvCursor: function(obj) {
		obj = util.extend({}, obj);
		obj.x = (obj.x !== undefined ? obj.x : 0) + this.getBuffer().cursor.x;
		obj.y = (obj.y !== undefined ? obj.y : 0) + this.getBuffer().cursor.y;
		this.updated();
		return this.setCursor(obj);
	},
	setCursor: function(obj) {
		var buffer = this.getBuffer();
		buffer.setCursor(obj);
		this.updated();
		return this;
	},
	getBuffer: function() {
		return this.buffers[this.currentBuffer];
	},
	toString: function() {
		return this.getBuffer().toString();
	},
	eraseData: function(type) {
		var buffer = this.getBuffer();
		switch(type) {
		case 0:
		case 'toEnd':
		default:
			buffer.lines.splice(buffer.lineNumber()+1, buffer.lines.length);
			break;
		case 1:
		case 'toBegin':
			for(var i = buffer.rowOffset; i < buffer.lineNumber(); i++)
				delete buffer.lines[i];
			break;
		case 2:
		case 'entire':
			buffer.lines.splice(buffer.rowOffset, buffer.lines.length);
			break;
		}
		return this.eraseLine(type);
	},
	eraseLine: function(type) {
		var buffer = this.getBuffer()
		var line = buffer.currentLine();
		switch(type) {
		case 0:
		case 'toEnd':
		default:
			line.splice(buffer.cursor.x, line.length);
			break;
		case 1:
		case 'toBegin':
			for(var i = 0; i < buffer.cursor.x; i++)
				delete line[i];
			break;
		case 2:
		case 'entire':
			line.splice(0, line.length);
			break;
		}
		this.updated();
		return this;
	},
	saveCur: function() {
		this.savedCursor = this.getBuffer().cursor;
		return this;
	},
	restCur: function() {
		return this.setCursor(this.savedCursor);
	},
	updated: function() {
		this.onUpdate(this, this.getBuffer().dumpDiff());
	},
	cursorVisible: function(visible) {
		this.showCursor = visible;
		var diff = {};
		diff[getBuffer().lineNumber()] = buffer.currentLine();
		onUpdate(this, diff);
	},
	onBell: function(terminal) {},
	onUpdate: function(terminal, diff) {},
	onTitleChange: function(terminal, title) {}
}

exports.Terminal = Terminal;
