exports.ansi = function(data, terminal) {
	var buffer = terminal.getBuffer();
	switch(data[0]) {
		case '(':
		case ')':
			if(data[1] === undefined)
				return 0;
			buffer.attr.graphic = data[1] === '2' || data[1] === '0';
			return 2;
		case 'c':
			buffer.clear();
			return 1;
		case '#':
			if(data[1] === undefined)
				return 0;
			return 2;
		case '=':
		case '<':
		case '>':
			return 1;
	}
	return -1;
}
