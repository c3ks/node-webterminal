var util = require('./util');

exports.sgr = function(terminal, sgr) {
	var buffer = terminal.getBuffer();
	var defaultAttr = buffer.defaultAttr;
	for(var i = 0; i < sgr.length; i++) {
		switch(parseInt(sgr[i])) {
		case 0:
			buffer.chAttr('reset');
			break;
		case 1:
			buffer.chAttr('bold', true);
			break;
		case 3:
			buffer.chAttr('italic', true);
			break;
		case 4:
			buffer.chAttr('underline', true);
			break;
		case 5:
		case 6:
			buffer.chAttr('blink', true);
			break;
		case 7:
			if(!buffer.attr.inverse) {
				buffer.chAttr('inverse', true);
				var tmp = buffer.attr.fg;
				buffer.chAttr('fg', buffer.attr.bg);
				buffer.chAttr('bg', tmp);
			}
			break;
		case 22:
			buffer.chAttr('bg', defaultAttr.bg);
			buffer.chAttr('fg', defaultAttr.fg);
			buffer.chAttr('bold', defaultAttr.bold);
			break;
		case 23:
			buffer.chAttr('italic', false);
			break;
		case 24:
			buffer.chAttr('underline', false);
			break;
		case 25:
			buffer.chAttr('blink', false);
			break
		case 27:
			if(buffer.attr.inverse) {
				buffer.chAttr('inverse', false);
				var tmp = buffer.attr.fg;
				buffer.chAttr('fg', buffer.attr.bg);
				buffer.chAttr('bg', tmp);
			}
			break;
		case 38:
			if(sgr[i+1] == 5)
				buffer.chAttr('fg', -sgr[i+=2]);
			break
		case 39:
			buffer.chAttr('fg', defaultAttr.fg);
			break;
		case 48:
			if(sgr[i+1] == 5)
				buffer.chAttr('bg', -sgr[i+=2]);
			break
		case 49:
			buffer.chAttr('bg', defaultAttr.bg);
			break;
		default:
			if(sgr[i] >= 30 && sgr[i] <= 37)
				buffer.chAttr('fg', sgr[i] - 30);
			else if(sgr[i] >= 40 && sgr[i] <= 47)
				buffer.chAttr('bg', sgr[i] - 40);
			else if(sgr[i] >= 90 && sgr[i] <= 99)
				buffer.chAttr('fg', sgr[i] - 90 + 8);
			else if(sgr[i] >= 100 && sgr[i] <= 109)
				buffer.chAttr('bg', sgr[i] - 100 + 8);
			else
				console.log("Unkown sgr command '"+sgr[i]+"'");
		}
	}
}
