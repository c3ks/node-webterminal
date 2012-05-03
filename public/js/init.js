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
	$("#log").append(res);
	$("#log").append("<br />");

	//res = format(res);
	$("#term").text(term.toString());
}
