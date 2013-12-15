function HandleExceptions(arguments)
{
	if (arguments.length == 1 && arguments(0) == "/?")
	{
		WSH.stdout.WriteLine(help);
		WSH.Quit();
	}
	else if (arguments.length < 4)
	{
		WSH.stdout.WriteLine(usage);
		WSH.Quit();
	}
}

function GetCodeFromChar(character)
{
	for(var charNumber = 0; charNumber < ansiTable.length; charNumber++)
		if (ansiTable.charAt(charNumber) == character)
			return charNumber;
	return null;
}

function GetCharFromCode(charCode)
{
	if (charCode < ansiTable.length)
		return ansiTable.charAt(charCode);
	else
		return null;
}

function ReadEncoding()
{
	var encodingCurrent = fso.OpenTextFile("ansi.txt", 1);
	var encodingTable = "";
	if (!encodingCurrent.atEndOfStream)
		encodingTable = encodingCurrent.ReadAll();
	encodingCurrent.close();
	return encodingTable;
}

function ReadInput(arguments)
{
	var input = fso.OpenTextFile(arguments(2), 1);
	var inputString = "";
	if (!input.atEndOfStream)
		inputString = input.ReadAll();
	input.close();
	return inputString;
}

function ReadFile(inputFileName)
{
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var input = fso.OpenTextFile(inputFileName, 1);
	var inputString = "";
	if (!input.atEndOfStream)
		inputString = input.ReadAll();
	input.close();
	return inputString;
}

function EscapeEncoding()
{
	if (inputString.length == 0)
		return "";
	var outputString = inputString.charAt(0);
	var charNumber = 1;
	var charCounter = 1;
	while (charNumber < inputString.length)
	{
		var lastChar = inputString.charAt(charNumber - 1);
		var currentChar = inputString.charAt(charNumber);
		WSH.stdout.WriteLine(lastChar + currentChar);
		if (lastChar != currentChar || charCounter == 256)
		{
			if (charCounter > 1)
			{
				outputString += lastChar + GetCharFromCode(charCounter - 1);
				charCounter = 1;
			}
			outputString += currentChar;
			WSH.stdout.WriteLine(charNumber);
		}
		else
		{
			charCounter++;
			if (charNumber == inputString.length - 1)
				outputString += lastChar + GetCharFromCode(charCounter - 1);
		}
		charNumber++;
	}
	return outputString;
}

function EscapeDecoding()
{
	if (inputString.length == 0)
		return "";
	var outputString = inputString.charAt(0);
	var charNumber = 1;
	var charCounter = 0;
	while (charNumber < inputString.length)
	{
		var lastChar = inputString.charAt(charNumber - 1);
		var currentChar = inputString.charAt(charNumber);
		if (lastChar == currentChar)
		{
			charNumber++;
			charCounter = GetCodeFromChar(inputString.charAt(charNumber)) + 1;
			for (var charIndex = 1; charIndex < charCounter; charIndex++)
				outputString += currentChar;
			charNumber++;
			if (charNumber < inputString.length)
				outputString += inputString.charAt(charNumber);
			charCounter = 0;
		}
		else
		{
			outputString += currentChar;
		}
			charNumber++;
	}
	return outputString;
}

function JumpEncoding()
{
	if (inputString.length == 0)
		return "";
	var outputString = "";
	var diffSymbols = inputString.charAt(0);
	var charNumber = 1;
	var charCounter = 1;
	var diffCounter = 1;
	if (inputString.length == 1)
		outputString += GetCharFromCode(128) + diffSymbols;
	while (charNumber < inputString.length)
	{
		var lastChar = inputString.charAt(charNumber - 1);
		var currentChar = inputString.charAt(charNumber);

		if (lastChar == currentChar)
		{
			//WSH.stdout.WriteLine("same");
			if (diffCounter > 0)
			{
				diffCounter--;
				if (diffSymbols.length > 1)
					outputString += GetCharFromCode(diffCounter - 1 + 128) + diffSymbols.substr(0, diffSymbols.length - 1);
				diffCounter = 0;
				diffSymbols =  "";
			}
			charCounter++;
			if (charCounter == 128 || charNumber == inputString.length - 1)
			{
				//WSH.stdout.WriteLine("sameEnd");
				//WSH.stdout.WriteLine(GetCodeFromChar(GetCharFromCode(charCounter - 1)));
				outputString += GetCharFromCode(charCounter - 1) + lastChar;
				diffSymbols = inputString.charAt((charNumber + 1) % inputString.length);
				charCounter = 1;
				diffCounter = 1;
				charNumber++;
			}
		}
		else if (lastChar != currentChar)
		{
			//WSH.stdout.WriteLine("diff");
			if (charCounter > 1)
			{
				outputString += GetCharFromCode(charCounter - 1) + lastChar;
				charCounter = 1;
			}
			diffCounter++;
			diffSymbols += currentChar;
			if (diffCounter == 128 || charNumber == inputString.length - 1)
			{
				//WSH.stdout.WriteLine("diffEnd");
				outputString += GetCharFromCode(diffCounter - 1 + 128) + diffSymbols;
				diffSymbols = inputString.charAt((charNumber + 1) % inputString.length);
				charCounter = 1;
				diffCounter = 1;
				charNumber++;
			}
		}

		charNumber++;

		//WSH.stdout.WriteLine(lastChar + " " + currentChar + " " + charCounter + " " + diffCounter);
	}
	return outputString;
}

function JumpDecoding()
{
	var outputString = "";
	var charNumber = 0;
	var charCounter = 0;
	while (charNumber < inputString.length)
	{
		//WSH.stdout.Write(inputString.charCodeAt(charNumber) + " ");
		charCounterCode = GetCodeFromChar(inputString.charAt(charNumber));
		var currentChar = inputString.charAt(charNumber + 1);
		if (charCounterCode < 128)
		{
			charCounter = charCounterCode + 1;
			for(var symbolNumber = 0; symbolNumber < charCounter; symbolNumber++)
			{
				outputString += currentChar;
			}
			charNumber++;
		}
		else
		{
			charCounter = charCounterCode - 127;
			for(var symbolNumber = 0; symbolNumber < charCounter; symbolNumber++)
			{
				outputString += currentChar;
				charNumber++;
				currentChar = inputString.charAt(charNumber + 1);
			}
		}
		charNumber++;
	}
	return outputString;
}

var arguments = WSH.Arguments;
var fso = new ActiveXObject("Scripting.FileSystemObject");
var help = ReadFile("readme");
var usage = "Usage: cscript RLE.js [encodingType] [mode] [inputFileName] [outputFileName]";

var ansiTable = ReadEncoding();
HandleExceptions(arguments);
var inputString = ReadInput(arguments);

var output = fso.OpenTextFile(arguments(3), 2);

var opType = arguments(0).concat(" ").concat(arguments(1));

switch (opType)
{
	case "escape encode":
		output.Write(EscapeEncoding());
		break;
	case "escape decode":
		output.Write(EscapeDecoding());
		break;
	case "jump encode":
		output.Write(JumpEncoding());
		break;
	case "jump decode":
		output.Write(JumpDecoding());
		break;
	default:
		WSH.stdout.Write(usage);
		break;
}

output.close();