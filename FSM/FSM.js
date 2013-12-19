function HandleExceptions()
{
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var input = fso.OpenTextFile("readme", 1);
	var help = "";
	if (!input.atEndOfStream)
		help = input.ReadAll();
	input.close();
	var usage = "Usage: cscript search.js [inputFileName] [pattern]";
	if (WSH.arguments.length < 2)
		if (WSH.arguments.length == 1 && WSH.arguments(0) == "/?")
		{
			WSH.stdout.WriteLine(help);
			WSH.Quit();
		}
		else
		{
			WSH.stdout.WriteLine(usage);
			WSH.Quit();
		} 
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

function PrefixFunction(string)
{
	var functionValue = [0];
	var k = 0;
	for(var i = 1; i < string.length; i++)
	{
		while((k > 0) && (string.charAt(k) != string.charAt(i)))
			k = functionValue[k - 1];
		if (string.charAt(k) == string.charAt(i))
			k++;
		functionValue[i] = k;
	}
	return functionValue;
}

function GetStateTable(string)
{
	var stateTable = [];
	var prefixFunctionArray = PrefixFunction(string);
	prefixFunctionArray.unshift("");

	var states = [""];
	var stringSymbols = [];
	for(var symbolNumber in string.split(""))
	{
		var symbol = string.charAt(symbolNumber);
		if (stringSymbols.join("").search(symbol) == -1)
			stringSymbols.push(symbol);
		states.push(states[states.length - 1] + symbol);
	}
	//stringSymbols.push("otherSymbol");

	for(var symbolNumber in stringSymbols)
	{
		var symbol = stringSymbols[symbolNumber];
		stateTable[symbol] = [];
		for(var stateNumber in states)
		{
			var state = states[stateNumber];
			if (symbol == string.charAt(state.length))
			{
				stateTable[symbol][state] = state + symbol;
			}
			else
			{
				var suffixLength = prefixFunctionArray[state.length];
				while (symbol != string.charAt(suffixLength) && suffixLength > 0)
				{
					suffixLength = prefixFunctionArray[suffixLength - 1];
				}
				if (symbol == string.charAt(suffixLength))
					suffixLength++;
				stateTable[symbol][state] = string.substr(0, suffixLength);
			}
		}
	}
	return stateTable;
	//WSH.stdout.WriteLine(states);
	//WSH.stdout.WriteLine(stringSymbols);
}

function WriteWithMargin(string, margin)
{
	WSH.stdout.Write(string);
	var spaceAmount = 0;
	while(spaceAmount < margin - string.length)
	{
		WSH.stdout.Write(" ");
		spaceAmount++;
	}
}

function ShowStateTable(stateTable)
{
	var margin = 0;
	for(var symbol in stateTable)
	{
		for(var state in stateTable[symbol])
			margin++;
		margin++;
		break;
	}

	for(var symbol in stateTable)
	{
		WriteWithMargin("", margin);
		for(var state in stateTable[symbol])
			WriteWithMargin(state, margin);
		break;
	}
	WSH.stdout.WriteLine();

	for(var symbol in stateTable)
	{
		WriteWithMargin(symbol, margin);
		for(var state in stateTable[symbol])
		{
			WriteWithMargin(stateTable[symbol][state], margin);
		}
		WSH.stdout.WriteLine();
	}
}
function FSMSearch(text, pattern)
{
	var timeBefore = new Date();
	if (text.length < pattern.length)
		return [];
	if (pattern.length == 0)
		return text.split("");

	var patternIndexes = new Array();
	var itemsAmount = 0;
	var stateTable = GetStateTable(pattern);
	var currentState = "";
	for(var charNumber in text.split(""))
	{
		var character = text.charAt(charNumber);

		if (stateTable[character] == null)
			currentState = "";
		else
			currentState = stateTable[character][currentState];

		if (currentState == pattern)
		{
			patternIndexes.push(charNumber - pattern.length + 1);
			itemsAmount++;
			if (itemsAmount >= maxItemsAmount)
				break;
		}
	}
  	var wastedTime = new Date() - timeBefore;
	WSH.stdout.WriteLine("Time wasted: " + wastedTime + " ms;");
	WSH.stdout.WriteLine("State table:");
  	ShowStateTable(stateTable);
	WSH.stdout.WriteLine("Found " + itemsAmount + " items;");
	WSH.stdout.WriteLine("Indexes of pattern are: " + patternIndexes);
  	return patternIndexes;
}
	
HandleExceptions();

var inputFileName = WSH.arguments(0);
var patternFileName = WSH.arguments(1);
var maxItemsAmount = (WSH.arguments.length == 3)?parseInt(WSH.arguments(2)):Number.POSITIVE_INFINITY;

var text = ReadFile(inputFileName);
var pattern = ReadFile(patternFileName);

FSMSearch(text, pattern);