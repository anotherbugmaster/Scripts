var ordinaryString = WSH.stdin.ReadLine();
var keyString = WSH.stdin.ReadLine();
var sum = 0;
for(var index = 0; index < ordinaryString.length - keyString.length + 1; index++)
	if (ordinaryString.substring(index, keyString.length + index) == keyString)
		sum++;
WSH.stdout.WriteLine("String was found " + parseInt(sum) + " times");
