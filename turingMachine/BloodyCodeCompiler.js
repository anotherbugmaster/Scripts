var memory = [];
function DisplayError(errorType, incorrectSlice, error)
{
	WSH.echo(errorType + " error: " + incorrectSlice + " " + error);
	return 1;
}
function Debug()
{
	WSH.echo("Gonna check memory? y/n");
	if (WSH.stdin.ReadLine()=="y")
		ShowMemory();
	WSH.echo("Press any key to continue...");
	WSH.stdin.ReadLine();
}
function ShowMemory(length)
{
	for (var i=0; i<length; i++)
		WSH.echo(memory[i]);
}
function WipeMemory()
{
	for (var i=0; i<memory.length; i++)
		memory[i] = 0;
}
function BloodyCodeInterpretation(){
	var input;
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var arguments = WSH.Arguments;
	var fileName;
	if(arguments!=null && arguments.length>0)
		if(arguments(0)=="/?")
		{
			readme = fso.OpenTextFile("readme");
			while(!readme.AtEndOfStream)
				WSH.echo(readme.ReadLine());
			readme.close();
			WSH.Quit();
		}
		else
			fileName = arguments(0);
	else
	{
		WSH.stdout.Write("Please type file name: ");
		fileName = WSH.stdin.ReadLine();
	}
	if (!fso.FileExists(fileName))
	{
		WSH.stdout.WriteLine("File doesn't exist.");
		WSH.Quit();
	}
	input = fso.OpenTextFile(fileName);
	WSH.echo("BloodyCodeInterpretation is running...");
	var i = 1;
	memory[0] = 0;
	while(!input.AtEndOfStream)
	{
		var errorsExist = 0;
		currentLine = input.ReadLine();
		var currentString = currentLine.split(" ");
		var j = 0;
		while(j != currentString.length)
		{
			switch(currentString[j])
			{
				case "read":
					memory[i] = 0;
					break;
				case "set":
					memory[i] = 1;
					break;
				case "comp":
					memory[i] = 2;
					break;
				case "sum":
					memory[i] = 3;
					break;
				case "jmp":
					memory[i] = 4;
					break;
				case "jmp-":
					memory[i] = 5;
					break;
				case "jmp0":
					memory[i] = 6;
					break;
				case "jmp+":
					memory[i] = 7;
					break;
				case "disp":
					memory[i] = 8;
					break;
				case "exit":
					memory[i] = 9;
					break;
				case "mult":
					memory[i] = 10;
					break;
				case "sub":
					memory[i] = 11;
					break;
				case "copy":
					memory[i] = 12;
					break;
				default:
					memory[i] = currentString[j];
					break;
			}
			j++;
			i++;
		}
	}
	input.close();
	return errorsExist;
}
function ProcessorEmulation()
{
	WSH.echo("ProcessorEmulation is running...");
	var programLength = memory.length;
	var ip = 1;
	while(ip < programLength)
	{
		switch(memory[ip])
		{
			case 0: //read
				memory[memory[ip + 1]] = WSH.stdin.ReadLine();
				ip += 2;
				break;
			case 1: //set
				var resultString = memory[ip + 1];
				var firstChar = memory[ip + 1].charAt(0);

				if (firstChar == "\"")
				{
					var lastChar = memory[ip + 1].charAt(memory[ip + 1].length - 1);
					while (lastChar != "\"")
					{
						ip++;
						lastChar = memory[ip + 1].charAt(memory[ip + 1].length - 1);
						resultString += " " + memory[ip + 1];
					}
					resultString = resultString.substring(1, resultString.length - 1);
				}

				memory[memory[ip + 2]] = resultString;
				ip += 3;
				break;
			case 2: //comp
				if (parseInt(memory[memory[ip + 1]]) == parseInt(memory[memory[ip + 2]]))
					memory[0] = 0;
				else if  (parseInt(memory[memory[ip + 1]]) < parseInt(memory[memory[ip + 2]]))
					memory[0] = -1;
				else
					memory[0] = 1;
				ip += 3;
				break;
			case 3: //sum
				memory[memory[ip + 3]] = parseInt(memory[memory[ip + 1]]) + parseInt(memory[memory[ip + 2]]);
				ip += 4;
				break;
			case 4: //jmp
				ip = parseInt(memory[ip + 1]);
				break;
			case 5: //jmp-
				if (parseInt(memory[0]) == -1)
					ip = parseInt(memory[ip + 1]);
				else 
					ip += 2;
				break;
			case 6: //jmp0
				if (parseInt(memory[0]) == 0)
					ip = parseInt(memory[ip + 1]);
				else 
					ip += 2;
				break;
			case 7: //jmp+
				if (parseInt(memory[0]) == 1)
					ip = parseInt(memory[ip + 1]);
				else 
					ip += 2;
				break;
			case 8: //disp
				WSH.echo(memory[memory[ip + 1]]);
				ip += 2;
				break;
			case 9: //exit
				WSH.Quit();
				break;
			case 10: //mult
				memory[memory[ip + 3]] = parseInt(memory[memory[ip + 1]]) * parseInt(memory[memory[ip + 2]]);
				ip += 4;
				break;
			case 11: //sub
				memory[memory[ip + 3]] = parseInt(memory[memory[ip + 1]]) - parseInt(memory[memory[ip + 2]]);
				ip += 4;
				break;
			case 12: //copy
				memory[memory[ip + 2]] = memory[memory[ip + 1]];
				ip += 3;
				break;
			default:
				errorsExist = DisplayError("Compilation", memory[ip], "is not a method.");
				return errorsExist;
				break;
		}
		if (ip > programLength - 1)
			ip %= (programLength - 1);
	}
}
BloodyCodeInterpretation();
ProcessorEmulation(); 	
//ShowMemory();