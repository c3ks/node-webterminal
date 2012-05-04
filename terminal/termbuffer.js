var util = require('./util');

var LF = '\n';

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
};

function TermBuffer(width, height, defaultAttr) {
	this.width = width;
	this.height = height;

	this.scrollArea = [0, height - 1];
	this.scrollBack = [];
	this.buffer = []
	this.oldBuffer = [];
	this.cursor = {x:0,y:0};
	this.cursorLine = null;

	this.defaultAttr = util.extend({
		fg: 15,
		bg: 0,
		bold: false,
		underline: false,
		blink: false,
		inverse: false,
		graphics: false,
	}, defaultAttr);
	this.attr = util.extend({}, this.defaultAttr);
}

TermBuffer.prototype = {
	write: function(data) {
		var c = this.cursor;

		for(var i = 0; i < data.length; i++) {
			if(data[i] === LF)
				this.newLine(false);
			else {
				var c = this.editChar();
				if(typeof data[i] === 'string') {
					c.chr = this.attr.graphic ? (graphics[data[i]] || data[i]) : data[i];
					util.extend(c.attr, this.attr);
				}
				else
					util.extend(c.chr, data[i]);

				if(this.mvCur(1, 0) == false)
					this.newLine(true);
			}
		}
	},
	newLine: function(soft) {
		this.getLine().soft = soft;
		if(this.cursor.y == this.scrollArea[1])
			this.insertLine(true);
		this.mvCur(0, 1);
		this.setCur({x:0})
		this.getLine();
	},
	editChar: function(action) {
		var line = this.getLine();
		line.changed = true;
		if(line[this.cursor.x])
			return line[this.cursor.x];
		else
			return line[this.cursor.x] = { chr: null, attr: {}};
	},
	clear: function() {
		var args = [this.scrollArea[0], this.scrollArea[1] + 1]
		if(this.scrollArea[1] !== this.height - 1)
			args.push.apply(args, new Array(this.scrollArea[1] - this.scrollArea[0] + 1));
		var leftover = this.buffer.splice.apply(this.buffer, args);
		if(this.scrollArea[0] === 0)
			this.scrollBack.push.apply(this.scrollArea, leftover);
	},
	eraseData: function(type, n) {
		n = n === undefined ? this.getLineNumber() : n;
		switch(type) {
		default:
		case 0:
		case 'toEnd':
			if(this.scrollArea[1] === this.height - 1)
				this.buffer.splice(n+1);
			else
				for(var i = n + 1; i <= this.scrollArea[1]; i++)
					this.buffer[i] = [];
			break;
		case 1:
		case 'toBegin':
			for(var i = this.scrollArea[0]; i < n; i++)
				this.buffer[i] = [];
			break;
			break;
		case 2:
		case 'entire':
			this.eraseData('toBegin', n).eraseData('toEnd', n);
			break;
		}
		return this.eraseLine(type);
	},
	eraseLine: function(type, n) {
		var line = this.getLine();
		switch(type) {
		default:
		case 0:
		case 'toEnd':
			line.splice(this.cursor.x, line.length);
			break;
		case 1:
		case 'toBegin':
			for(var i = 0; i < this.cursor.x; i++)
				delete line[i];
			break;
		case 2:
		case 'entire':
			line.splice(0, line.length);
			break;
		}
		this.setCur(this.cursor);
		return this;
	},
	getLineNumber: function(n) {
		if(n === undefined)
			n = this.cursor.y;
		if(n > this.scrollArea[1] - this.scrollArea[0] || n < 0)
			return -1;
		else
			return this.scrollArea[0] + n;
	},
	getLine: function(n) {
		n = this.getLineNumber(n);
		if(n < 0)
			return null;
		else if(this.buffer[n])
			return this.buffer[n];
		else
			return (this.buffer[n] = []);
	},
	insertSpace: function(cnt) {
		var line = this.getLine();
		var c = this.cursor;
		delete line[c.x].attr.cursor;
		var after = line.splice(c.x);
		var spaces = [];
		while(cnt--) {
			spaces.push({chr:' ', attr: util.extend({},this.attr) })
		}
		line.push.apply(line, spaces);
		line.push.apply(line, after);
		line.splice(this.width);
		line[c.x].attr.cursor = true;
	},
	insertLine: function(insertAfter, n) {
		n = n === undefined ? this.getLineNumber() : n;
		if(insertAfter)
			n++;
		var after = this.buffer.splice(n);
		var newline = [];
		this.buffer.push(newline);
		this.buffer.push.apply(this.buffer, after);
		if(this.buffer.length > this.height) {
			var oversize = this.buffer.length - this.height
			if(n - 1 == this.scrollArea[1]) {
				var tail = this.buffer.splice(this.scrollArea[0], oversize);
				if(this.scrollArea[0] == 0)
					this.scrollBack.push.apply(this.scrollBack, tail);
			}
			else
				this.buffer.splice(this.scrollArea[1], oversize);
		}
	},
	setScrollArea: function(n, m) {
		if(n === undefined || m === undefined)
			this.scrollArea = [ 0, this.height - 1 ];
		else {
			this.scrollArea = [ Math.max(n, 0), Math.min(m, this.height - 1) ];
		}
	},
	deleteLine: function(n) {
		n = n === undefined ? this.getLineNumber() : n;
		this.buffer.splice(n + this.scrollArea[0], 1)
		if(this.scrollArea[1] != this.height)
			this.insertLine(false, this.scrollArea[1] - this.scrollArea[0]);
	},
	mvCur: function(x, y, step) {
		var mult = step === 'tabstop' ? 8 : 1;
		var obj = {x: (this.cursor.x + (x * mult) - (this.cursor.x % mult)), y: this.cursor.y + y};
		return this.setCur(obj);
	},
	setCur: function(obj) {
		var inbounds = 0;
		var c = this.cursor;

		if(this.cursorLine && this.cursorLine[c.x]) {
			delete this.cursorLine[c.x].attr.cursor;
			this.cursorLine.changed = true;
		}

		if(obj.x < 0)
			obj.x = 0;
		else if(obj.x >= this.width)
			obj.x = this.width - 1;
		else
			inbounds++

		if(obj.y < 0)
			obj.y = 0;
		else if(obj.y > this.scrollArea[1] - this.scrollArea[0])
			obj.y = this.scrollArea[1] - this.scrollArea[0];
		else
			inbounds++

		util.extend(this.cursor, obj);

		this.editChar().attr.cursor = true;
		this.cursorLine = this.getLine();

		return inbounds === 2;
	},
	dump: function(withScrollBack) {
		var ret = []
		if(withScrollBack)
			ret.push.apply(ret, this.scrollBack);
		ret.push.apply(ret, this.buffer);
		return ret;
	},
	toString: function() {
		var ret = []
		for(var i = 0; i < this.buffer.length; i++) {
			var line = []
			if(this.buffer[i])
				for(var j = 0; j < this.buffer[i].length; j++) {
					line.push(this.buffer[i][j] ? this.buffer[i][j].chr || ' ' : ' ');
				}
				while(line[line.length-1] === ' ') line.pop();
			ret.push(line.join(''));
		}
		return ret.join(LF);
	},
	resize: function(width, height) {
		var old = this.scrollBack;
		old.push.apply(old, this.buffer);
		var oldCursor = this.cursor;
		this.setCur(this.cursor = {x:0,y:0})
		this.height = height;
		this.width = width;
		this.scrollArea = [ 0, this.height - 1]
		this.buffer = [];
		this.oldBuffer = [];
		this.scrollBack = [];

		for(var i = 0; i < old.length; i++) {
			this.write(old[i])
			if(!old[i].soft)
				this.write(LF);
		}
		this.setCur(oldCursor);
	},
	dumpDiff: function() {
		var diff = {}
		var emptyLine = []
		for(var i = 0; i < Math.max(this.buffer.length, this.oldBuffer.length); i++) {
			var line = this.buffer[i] || emptyLine
			  , oldLine = this.oldBuffer[i] || emptyLine
			  , oldIndex = this.oldBuffer.indexOf(line)
			  , newIndex = this.buffer.indexOf(oldLine);
			if((oldIndex === -1 && newIndex === -1))
				diff[i] = {act:i >= this.oldBuffer.length ? '+' : 'c', line: line}
			else if(newIndex === -1)
				diff[i] = {act:'-'}
			else if(oldIndex === -1)
				diff[i] = {act:'+', line: line}
			else if(line.changed)
				diff[i] = {act:'c', line: line}
			line.changed = false;
		}
		this.oldBuffer = this.buffer.slice();
		return diff;
	}
}

exports.TermBuffer = TermBuffer
