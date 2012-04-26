$(document).ready(init);

function init()
{
	$("body").keypress(submitInput);
	$("#cursor").focus();
}

function submitInput(event)
{
	if (event.which == 13)
	{
		var input = $("#cursor").val();
		$("#cursor").val("");

		appendRequest(input);
		if (buildin(input))
			return ;

		IoWrapper.send(input, appendResponse);
	}
}

function appendRequest(req)
{
	$("#output").append("$ ");
	$("#output").append(req);
	$("#output").append("<br />");
}

function appendResponse(res)
{
	res = format(res);
	$("#output").append(res);
}
