var iowrapper;

$(document).ready(init);


function init()
{
	iowrapper = new IoWrapper(parseResponse);
	$("body").on("keypress", submitInput);
}


function submitInput(event)
{
	var chr;
		chr = String.fromCharCode(event.which)

	iowrapper.send(chr, parseResponse);
}

function parseResponse(res, term)
{
	var diff = term.getBuffer().dumpDiff();
	$("#log").append($("<pre>").text(JSON.stringify(diff)))
	$("#log").append("Hello")

	//res = format(res);

	var t = $("#term");
	for(var i in diff) {
		var action = diff[i].act;
		var line = diff[i].line;
		var element = null;
		switch(action) {
		case 'c': // a line has been changed
			element = $(t.children()[i]);
			break;
		case '+': // a line has been inserted at position i
			if(t.children()[i])
				element = $("<div>").insertBefore(t.children()[i]);
			else // if no children is found, consider adding it to the end
				element = $("<div>").appendTo(t);
			break;
		case '-': // the line at position i has been removed
			$(t.children()[i]).remove()
			break;
		}
		if(element && line) {
			element.html(line.length === 0 ? "&nbsp" : "");
			for(var i = 0; i < line.length; i++) {
				var chr = $("<span>").appendTo(element).text(line[i].chr);
				for(var k in line[i].attr) {
					chr.addClass(k+"_"+line[i].attr[k]);
				}
			}
		}
	}
}
