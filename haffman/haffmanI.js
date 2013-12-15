function node (name, fr, par, code, used) 
{
this.name = name;
this.fr = fr; 
this.par = par;
this.code = code;
this.used = used;
}
function codes (name, code, par) 
{
this.name = name;
this.code = code;
this.par = par;
}
function Encode(str)
{ 
var alphabet = new Array;
for (i=0;i<str.length;i++) 
alphabet[str.charAt(i)]=0; 
for (i=0;i<str.length;i++) 
alphabet[str.charAt(i)]++;
var tree = new Array(); 
var table = new Array();
var i = 0;
if (alphabet[str.charAt(0)] !== str.length) 
{
for(x in alphabet) 
{ 
var n = new node(x,alphabet[x], -1,'',0); 
tree.push(n);
}
while(tree[tree.length-1].fr < str.length) 
{ 
var tmp = str.length; 
var min = 0;
for (i=0;i<tree.length;i++) 
{ 
if (tree[i].used == 0 && tree[i].fr < tmp) 
{
min = i;
tmp = tree[i].fr;
}
}
tree[min].used = 1;
tmp = str.length;
var min1 = 0;
for (i=0;i<tree.length;i++) 
{
if (tree[i].used == 0 && tree[i].fr < tmp) 
{
min1=i;
tmp = tree[i].fr;
}
}
var n = new node(tree[min].name + tree[min1].name, tree[min].fr + tree[min1].fr, -1,'',0);
tree.push(n);
tree[min].par = tree.length - 1;
tree[min1].par = tree.length - 1;
tree[min].code = 0;
tree[min1].code = 1;
tree[min1].used = 1;
}
i=0; 
while(i < tree.length) 
{ 
if (tree[i].name.length == 1) 
table.push(new codes (tree[i].name,tree[i].code + '',tree[i].par));
i++;
}
j=1;
while(j) 
{
for (i=0;i<table.length;i++) 
{
j=0;
if (table[i].par != -1) 
{
table[i].code = tree[table[i].par].code + table[i].code; 
table[i].par = tree[table[i].par].par;
j=1;
}
}
}
}
else 
{ 
c = new codes (str.charAt(0), 0, -1);
table.push(c);
}
var fso = new ActiveXObject("Scripting.FileSystemObject");
var file = fso.OpenTextFile("codes.txt",2);
var file2 = fso.OpenTextFile("letters.txt",2);
for(i=0;i<table.length;i++) 
{
file2.write(table[i].name);
file.write(table[i].code + ' ');
}
file.close();
file2.close();
var res = '';
for (i=0;i<str.length;i++)
for (j=0;j<table.length;j++)
if(str.charAt(i) == table[j].name)
res += table[j].code;
return res;
}
function Decode(str,adress,adress2)
{
var table = new Array();
var fso = new ActiveXObject("Scripting.FileSystemObject");
var file = fso.OpenTextFile(adress);
var file2 = fso.OpenTextFile(adress2);
var codestr = file.ReadAll().split(' ');
var letterstr = file2.ReadAll();
var fortable = [];
for (var i = 0; i < letterstr.length; i++)
{
fortable.push(letterstr.charAt(i));
fortable.push(codestr[i]);
}
file.close();
for (var i = 0; i < fortable.length-1; i+=2)
{
table.push(new codes(fortable[i],fortable[i+1] + '',null));
}
for(var j=0;j<table.length;j++) 
if ('' == table[j].name) table[j].name = '\n';
var res1='';
var tmp='';
for(var i=0;i<str.length;i++) 
{
tmp += str.charAt(i); 
for(var j=0;j<table.length;j++) 
if (tmp == table[j].code)
{
res1 += table[j].name;
tmp = "";
}
}
return res1;
}
function Enthropy(str) 
{
var table = [];
for (var i = 0; i < str.length; i++) {
if (str.charAt(i) in table) 
table[str.charAt(i)]++;
else
table[str.charAt(i)] = 1;
}
var p = 0;
for (var i in table) 
{ 
var relation = table[i] / str.length;
p += relation * Math.log(relation) / Math.log(2);
}
return -p;
}

var mode = WScript.Arguments(0);
var input = WScript.Arguments(1);
var output = WScript.Arguments(2);
var fso = new ActiveXObject("Scripting.FileSystemObject");
var file = fso.OpenTextFile(input);
var inp = file.ReadAll();
file.close();
if (mode == "encode") var result = Encode(inp); else var result = Decode(inp,WScript.Arguments(3),WScript.Arguments(4));
if (mode == "encode") 
{
WSH.echo("Compressing rate: " + inp.length * 8 / result.length);
WSH.echo("Input enthrophy: " + Enthropy(inp));
WSH.echo("Output enthrophy: " + Enthropy(result));
}
file = fso.OpenTextFile(output, 2,
12:57:00	
true);
file.write(result);
file.close();