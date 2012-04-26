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
		alert("Submitted");
		var input = $("#cursor").val();
		$("#cursor").val("");

		IoWrapper.send(input);
	}
}
