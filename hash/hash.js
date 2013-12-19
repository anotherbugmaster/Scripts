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

function AreStringsEqual(string1, string2)
{
	if (string1.length != string2.length)
		return false;
	for(var charNumber = 0; charNumber < Math.min(string1.length, string2.length); charNumber++)
		if (string1.charAt(charNumber) != string2.charAt(charNumber))
			return false;
	return true;
}

function BruteForceSearch(text, pattern)
{
	var timeBefore = new Date();
	var patternIndexes = [];
	var itemsAmount = 0;
	var collisionsAmount = 0;
	var charNumber = 0;
	while((charNumber < text.length - pattern.length + 1) && (itemsAmount < maxItemsAmount))
	{
		collisionsAmount++;
		var currentSlice = text.substr(charNumber, pattern.length);
		if (AreStringsEqual(pattern, currentSlice))
		{
			patternIndexes.push(charNumber);
			itemsAmount++;
		}
		charNumber++;
	}
	var wastedTime = new Date() - timeBefore;
	WSH.stdout.WriteLine("Time wasted: " + wastedTime + " ms;");
	WSH.stdout.WriteLine("Found " + itemsAmount + " items;");
	WSH.stdout.WriteLine("Found " + collisionsAmount + " collisions;");
	WSH.stdout.WriteLine("Indexes of pattern are: " + patternIndexes);
	return patternIndexes;
}

function GetSumHash(string)
{
	var stringHash = 0;
	for(var charNumber = 0; charNumber < string.length; charNumber++)
		stringHash += string.charCodeAt(charNumber);
	return stringHash;
}

function GetNextSumHash(hash, firstSymbolCode, nextSymbolCode, length)
{
	return hash - firstSymbolCode + nextSymbolCode;
}

function GetSumSquareHash(string)
{
	var stringHash = 0;
	for(var charNumber = 0; charNumber < string.length; charNumber++)
		stringHash += Math.pow(string.charCodeAt(charNumber), 2);
	return stringHash;
}

function GetNextSumSquareHash(hash, firstSymbolCode, nextSymbolCode, length)
{
	return hash - Math.pow(firstSymbolCode, 2) + Math.pow(nextSymbolCode, 2);
}

function GetRKHash(string)
{
	var stringHash = 0;
	var constant = 3;
	for(var charNumber = 0; charNumber < string.length; charNumber++)
		stringHash = stringHash * constant + string.charCodeAt(charNumber);
	return stringHash;
}

function GetNextRKHash(hash, firstSymbolCode, nextSymbolCode, length)
{
	var constant = 3;
	return constant * (hash - Math.pow(constant, length - 1) * firstSymbolCode) + nextSymbolCode;
}

function HashSearch(text, pattern, HashFunction, NextHashFunction)
{
	var timeBefore = new Date();
	var patternHash = HashFunction(pattern);
	var currentSliceHash = HashFunction(text.substr(0, pattern.length));
	var patternIndexes = [];
	var itemsAmount = 0;
	var collisionsAmount = 0;
	var charNumber = 0;
	while((charNumber < text.length - pattern.length + 1) && (itemsAmount < maxItemsAmount))
	{
		if (patternHash == currentSliceHash)
		{
			var currentSlice = text.substr(charNumber, pattern.length);
			collisionsAmount++;
			if (AreStringsEqual(pattern, currentSlice))
			{
				patternIndexes.push(charNumber);
				itemsAmount++;
			}
		}
		currentSliceHash = NextHashFunction(currentSliceHash, text.charCodeAt(charNumber), text.charCodeAt(charNumber + pattern.length), pattern.length);
		charNumber++;
	}
	var wastedTime = new Date() - timeBefore;
	WSH.stdout.WriteLine("Time wasted: " + wastedTime + " ms;");
	WSH.stdout.WriteLine("Found " + itemsAmount + " items;");
	WSH.stdout.WriteLine("Found " + collisionsAmount + " collisions;");
	WSH.stdout.WriteLine("Indexes of pattern are: " + patternIndexes);
	return patternIndexes;
}

HandleExceptions();

var inputFileName = WSH.arguments(0);
var patternFileName = WSH.arguments(1);
var maxItemsAmount = (WSH.arguments.length == 3)?parseInt(WSH.arguments(2)):Number.POSITIVE_INFINITY;

var text = ReadFile(inputFileName);
var pattern = ReadFile(patternFileName);

WSH.stdout.WriteLine("SumHash:");
HashSearch(text, pattern, GetSumHash, GetNextSumHash);
WSH.stdout.WriteLine();

WSH.stdout.WriteLine("SumSquareHash:");
HashSearch(text, pattern, GetSumSquareHash, GetNextSumSquareHash);
WSH.stdout.WriteLine();

WSH.stdout.WriteLine("RKHash:");
HashSearch(text, pattern, GetRKHash, GetNextRKHash);
WSH.stdout.WriteLine();

WSH.stdout.WriteLine("Brute Force:");
BruteForceSearch(text, pattern);
WSH.stdout.WriteLine();