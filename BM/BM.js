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

function GetStopSymbolTable(string)
{
	var stopSymbolTable = new Array();
	for(var charNumber = 0; charNumber < string.length - 1; charNumber++)
		stopSymbolTable[string.charAt(charNumber)] = charNumber;
	return stopSymbolTable;
}

function GetSuffixTable(string)
{
	var suffixTable = new Array();
	var pi = PrefixFunction(string);
	var pi1 = PrefixFunction(string.split("").reverse().join(""));
	for(var j = 0; j <= string.length; j++)
		suffixTable[j] = string.length - pi[string.length - 1];
	for(var i = 0; i < string.length; i++)
	{
		var j = string.length - pi1[i];
		suffixTable[j] = Math.min(suffixTable[j], i - pi1[i] + 1);
	}
	return suffixTable;
}

function BMSearch (text, pattern)
{
	var timeBefore = new Date();
	if (text.length < pattern.length)
		return [];
	if (pattern.length == 0)
		return text.split("");
	stopSymbolTable = GetStopSymbolTable(pattern);
	suffixTable = GetSuffixTable(pattern);

    var patternIndexes = new Array();
    var shift = 0;
    var itemsAmount = 0;
    while((shift < text.length - pattern.length + 1) && (itemsAmount < maxItemsAmount))
  	{
  		var shiftdelta = 0;
  		for(var position = pattern.length - 1; position >= 0; position--)
  		{
  			if (text.charAt(shift + position) != pattern.charAt(position))
  			{
  				if (stopSymbolTable[text.charAt(shift + position)] != null)
  					shiftdelta += position - stopSymbolTable[text.charAt(shift + position)];
  				else
  					shiftdelta += position;
  				if (shiftdelta <= 0)
  					shiftdelta = suffixTable[pattern.length - 1 - position];
  				shift += shiftdelta;
  				break;
  			}
  		}
  		if (shiftdelta == 0)
  		{
  			patternIndexes.push(shift);
  			itemsAmount++;
  			shift++;
  		}
  	}
  	var wastedTime = new Date() - timeBefore;
	WSH.stdout.WriteLine("Time wasted: " + wastedTime + " ms;");
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

BMSearch(text, pattern);