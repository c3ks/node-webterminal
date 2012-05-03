exports.ansi = function(data, terminal) {
	var buffer = terminal.getBuffer();
	switch(data[0]) {
		case '(':
		case ')':
			buffer.attr.graphic = data[1] === '2' || data[1] === '0';
			return 2;
		case 'c':
			buffer.clear();
			return 1;
		case '#':
			return 2;
		case '<':
		case '>':
			return 1;
	}
}
