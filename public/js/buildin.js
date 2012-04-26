function buildin(input)
{
	switch (input)
	{
		case "clear":
			execute(input);
			break;
		default:
			return false;
	}

	return true;
}

function execute(input)
{
	if(input === "clear")
		$("#output").html("");
}
