function Node (name, frequency, parent, code, isUsed) 
{
	this.name = name;
	this.frequency = frequency; 
	this.parent = parent;
	this.code = code;
	this.isUsed = isUsed;
}

function CodeTableRecord (name, code, parent) 
{
	this.name = name;
	this.code = code;
	this.parent = parent;
}

function HandleExceptions()
{
	if (arguments.length < 3 || mode == "/?" )
	{
		WSH.stdout.WriteLine(help);
		WSH.stdout.WriteLine(usage);
		WSH.Quit();
	}
}

function ReadInput()
{
	var input = fso.OpenTextFile(inputFileName, 1);
	var inputString = "";
	if (!input.atEndOfStream)
		inputString = input.ReadAll();
	input.close();
	return inputString;
}

function GetFreqArray()
{
	var freqArray = new Array();
	for(var letterNumber = 0; letterNumber < inputString.length; letterNumber++)
	{
		letter = inputString.charAt(letterNumber);
		WSH.stdout.WriteLine("Letter: " + letter);
		if (freqArray[letter] == null)
		{
			WSH.stdout.WriteLine("New letter!");
			freqArray[letter] = 1;
		}
		else
			freqArray[letter]++;
	}
	return freqArray;
}

function FindMinimumNode ()
{
	var minFrequency = inputString.length; 
	var minNode;
	for (var node in tree) 
	{ 
		if (!node.used && node.frequency < minFrequency) 
		{
			WSH.stdout.WriteLine(node.name);
			minNode = node;
			minFrequency = node.frequency;
		}
	}
	tree[tree.indexOf(minNode)].isUsed = true;
	return minNode;
}

function BuildTree ()
{
	for(var letter in alphabet)
	{
		tree.push(new Node(letter, alphabet[letter], null, '', false));
	}
	while (tree[tree.length - 1].frequency < inputString.length)
	{
		var minNode1 = FindMinimumNode();
		var minNode2 = FindMinimumNode();
		WSH.stdout.WriteLine(minNode1.name);
		var sumNode = new Node(minNode1.name + minNode2.name, minNode1.frequency + minNode2.frequency, null, '', false);
		tree.push(sumNode);
		minNode1.parent = sumNode;
		minNode2.parent = sumNode;
		minNode1.code = 0;
		minNode2.code = 1;
		minNode1.isUsed = true;
		minNode2.isUsed = true;
	}
}

function FillCodeTable ()
{
	if (alphabet[0] == inputString.length)
	{
		codeTable.push(new CodeTableRecord(inputString.charAt(0), 0, null));
		return;
	}
	for(var node in tree)
	{
		if (node.name.length == 1)
			codeTable.push(new CodeTableRecord (node.name, node.code + '', node.parent));
	}
	j=1;
	while(true)
	{
		for (var record in codeTable) 
		{
			if (record.parent != null) 
			{
				record.code = tree[record.parent].code + record.code; 
				record.parent = tree[record.parent].parent;
				return;
			}
		}
	}
}
function Encode ()
{
	BuildTree ();
	FillCodeTable();
}

var mode = WSH.Arguments(0);
var inputFileName = WSH.Arguments(1);
var outputFileName = WSH.Arguments(2);

var fso = new ActiveXObject("Scripting.FileSystemObject");
var inputString = ReadInput();

var alphabet = GetFreqArray();
var tree = new Array();
var codeTable = new Array();

for(var element in alphabet)
	WSH.stdout.Write(element);

var output = fso.OpenTextFile(outputFileName, 2);

switch(mode)
{
	case "encode":
		output.Write(Encode());
	case "decode":
		output.Write(Decode());
}
output.close();