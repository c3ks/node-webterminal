var util = require('./util');

function TermDiff() {
	this.cursorX = -1;
	this.cursorLine = null;
	this.oldBuffer = [];
}

TermDiff.prototype = {
	diff: function(newBuffer) {
		var diff = {}
		var i = 0, j = 0;
		var emptyLine = [];
		var deleted = 0;

		if(this.cursorX !== newBuffer.cursor.x || newBuffer.buffer[newBuffer.cursor.y] !== this.cursorLine) {
			if(this.cursorLine) {
				this.cursorLine.changed = true;
				if(this.cursorLine.line[this.cursorX])
					delete this.cursorLine.line[this.cursorX].cursor;
			}

			this.cursorLine = newBuffer.getLine(newBuffer.cursor.y);
			this.cursorX = newBuffer.cursor.x;
			this.cursorLine.changed = true;
			if(!this.cursorLine.line[newBuffer.cursor.x])
				this.cursorLine.line[newBuffer.cursor.x] = {};
			this.cursorLine.line[newBuffer.cursor.x].cursor = newBuffer.showCursor;
		}


		for(; i < Math.min(newBuffer.buffer.length, this.oldBuffer.length); i++, j++) {
			var line = newBuffer.buffer[i] || emptyLine
			  , oldLine = this.oldBuffer[j] || emptyLine
			var oldInNew = util.indexOf(newBuffer.buffer, oldLine)
			  , newInOld = util.indexOf(this.oldBuffer, line)

			/*if(oldInNew === -1 && newInOld !== -1) {
				deleted = newInOld - i;
				j += deleted;
				oldLine = this.oldBuffer[j] || emptyLine
				oldInNew = util.indexOf(newBuffer.buffer, oldLine)
			}

			if(line.changed || newInOld === -1) {
				if(newInOld === -1) {
					diff[i] = {act: '+', line: line, rm: deleted};
					j--;
				}
				else {
					diff[i] = {act: 'c', line: line, rm: deleted};
				}
			}
			else if(deleted !== 0)
				diff[i] = {rm: deleted};*/
			if(line.changed || line !== oldLine) {
				diff[i] = util.extend({act: 'c', rm: deleted}, line);
			}
			
			deleted = 0;
		}
		deleted = this.oldBuffer.length - j
		for(; i < newBuffer.buffer.length; i++){
			diff[i] = util.extend({act: '+', rm: deleted}, newBuffer.buffer[i]);
			deleted = 0;
		}
		if(deleted !== 0)
			diff[i] = {rm: deleted};

		this.oldBuffer = newBuffer.buffer.slice(0);
		newBuffer.resetDiff();
		return diff;
	}
}

exports.TermDiff = TermDiff;
