var util = require('./util');

exports.sgr = function(terminal, sgr) {
	var buffer = terminal.getBuffer();
	var attr = {};
	var defaultAttr = buffer.defaultAttr;
	for(var i = 0; i < sgr.length; i++) {
		switch(parseInt(sgr[i])) {
		case 0:
			attr = defaultAttr;
			break;
		case 1:
			attr.bold = true;
			break;
		case 3:
			attr.italic = true;
			break;
		case 4:
			attr.underline = true;
			break;
		case 5:
		case 6:
			attr.blink = true;
			break;
		case 7:
			if(!attr.inverse) {
				attr.inverse = true;
				var tmp = attr.fg;
				attr.fg = attr.bg;
				attr.bg = tmp;
			}
			break;
		case 22:
			attr.bg = defaultAttr.bg;
			attr.fg = defaultAttr.fg;
			attr.bold = defaultAttr.bold;
			break;
		case 23:
			attr.italic = false;
			break;
		case 24:
			attr.underline = false;
			break;
		case 25:
			attr.blink = false;
			break
		case 27:
			if(attr.inverse) {
				attr.inverse = false;
				var tmp = attr.fg;
				attr.fg = attr.bg;
				attr.bg = tmp;
			}
			break;
		case 38:
			if(sgr[i+1] == 5)
				attr.fg = -sgr[i+=2];
			break
		case 39:
			attr.fg = defaultAttr.fg
			break;
		case 48:
			if(sgr[i+1] == 5)
				attr.bg = -sgr[i+=2];
			break
		case 49:
			attr.bg = defaultAttr.bg;
			break;
		default:
			if(sgr[i] >= 30 && sgr[i] <= 37)
				attr.fg = sgr[i] - 30;
			else if(sgr[i] >= 40 && sgr[i] <= 47)
				attr.bg = sgr[i] - 40;
			else if(sgr[i] >= 90 && sgr[i] <= 99)
				attr.fg = sgr[i] - 90 + 8;
			else if(sgr[i] >= 100 && sgr[i] <= 109)
				attr.bg = sgr[i] - 100 + 8;
			else
				console.log("Unkown sgr command '"+sgr[i]+"'");
		}
		buffer.chAttr(attr);
	}
}
