exports.ansi = function(data, terminal) {
	switch(data[0]) {
		case '(':
		case ')':
			terminal.getBuffer().attr.graphic = data[1] === '2' || data[1] === '0';
			return 2;
		case '#':
			return 2;
		case 'c':
		case '<':
		case '>':
			return 1;
	}
}
