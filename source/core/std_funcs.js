const lbVersion = "2.0.0.113";

const stdNativeFuncs = [
                  new ObjNativeFunc("rnd", 0, 0, funcRnd),
                  new ObjNativeFunc("time", 0, 0, funcTime),
                  new ObjNativeFunc("int", 1, 1, funcInt),
                  new ObjNativeFunc("len", 1, 1, funcLen),
                  new ObjNativeFunc("upper", 1, 1, funcUpper),
                  new ObjNativeFunc("lower", 1, 1, funcLower),
                  new ObjNativeFunc("left", 2, 2, funcLeft),
                  new ObjNativeFunc("right", 2, 2, funcRight),
                  new ObjNativeFunc("mid", 2, 3, funcMid),
                  new ObjNativeFunc("trim", 1, 1, funcTrim),
                  new ObjNativeFunc("ltrim", 1, 1, funcLTrim),
                  new ObjNativeFunc("rtrim", 1, 1, funcRTrim),
                  new ObjNativeFunc("instr", 2, 3, funcInstr),
                  new ObjNativeFunc("abs", 1, 1, funcAbs),
                  new ObjNativeFunc("asc", 1, 1, funcAsc),
                  new ObjNativeFunc("chr", 1, 1, funcChr),
                  new ObjNativeFunc("min", 2, 2, funcMin),
                  new ObjNativeFunc("max", 2, 2, funcMax),
                  new ObjNativeFunc("sqr", 1, 1, funcSqr),
                  new ObjNativeFunc("str", 1, 1, funcStr),
                  new ObjNativeFunc("val", 1, 1, funcVal),
                  new ObjNativeFunc("startTimer", 2, 2, funcStartTimer),
                  new ObjNativeFunc("stopTimer", 0, 0, funcStopTimer),
                  new ObjNativeFunc("addArrayItem", 2, 3, funcAddArrayItem),
                  new ObjNativeFunc("removeArrayItem", 2, 2, funcRemoveArrayItem),
                  new ObjNativeFunc("clamp", 3, 3, funcClamp),
                  new ObjNativeFunc("pointInRect", 6, 6, funcPointInRect),
                  new ObjNativeFunc("pointInCircle", 5, 5, funcPointInCircle),
                  new ObjNativeFunc("rectsOverlap", 8, 8, funcRectsOverlap),
                  new ObjNativeFunc("circlesOverlap", 6, 6, funcCirclesOverlap),
                  new ObjNativeFunc("rectOverlapsCircle", 7, 7, funcRectOverlapsCircle),
                  new ObjNativeFunc("cos", 1, 1, funcCos),
                  new ObjNativeFunc("sin", 1, 1, funcSin),
                  new ObjNativeFunc("tan", 1, 1, funcTan),
                  new ObjNativeFunc("round", 1, 2, funcRound),
                  new ObjNativeFunc("version", 0, 0, funcVersion),
                  new ObjNativeFunc("word", 2, 3, funcWord),
                  new ObjNativeFunc("splitStr", 2, 2, funcSplitStr),
                  new ObjNativeFunc("pauseFor", 1, 1, funcPauseFor),
                  new ObjNativeFunc("import", 1, 1, funcImport),
                  new ObjNativeFunc("run", 1, 1, funcRun)
                 ];

var timerID = 0;
var timerCallback = null;
var pauseForCallback = null;
var importCallback = null;

function resetStd()
//
{
  if(timerID != 0)
    clearInterval(timerID);

  timerID = 0;
  timerCallback = null;
  pauseForCallback = null;
  importCallback = null;
}

function timer_onTick()
//
{
  if(!timerCallback)
    return;

  if(timerID == 0)
    return;

  timerCallback.resumeVM();
}

function pauseFor_onTimeout()
//Continue program execution
{
  if(!pauseForCallback)
    return;

  pauseForCallback.vm.stack.push(null);
  pauseForCallback.resumeVM();
}

function import_onLoad()
//
{
  var source, url, sourceName;

  if(!importCallback)
    return;

  source = this.responseText;
  url = new URL(this.responseURL);
  sourceName = url.pathname.split("/").pop();

  importCallback.vm.stack.push(true);
  importCallback.vm.interpret(source, sourceName);
}

function import_onError()
//
{
  if(!importCallback)
    return;

  importCallback.vm.stack.push(false);
  importCallback.resumeVM();
}

function funcRnd(vm, args)
//Return a pseudo-random number between 0 and 1
{
  return Math.random();
}

function funcTime(vm, args)
//Return the number of milliseconds elapsed since January 1, 1970
{
  return Date.now();
}

function funcInt(vm, args)
//Return the integer portion of a number
{
  return parseInt(args[0]);
}

function funcLen(vm, args)
//Return the number of characters in a string, or the linear size of an array
{
  var len;

  if(args[0] instanceof ObjArray)
    len = args[0].items.length;
  else
    len = args[0].length;

  return len;
}

function funcUpper(vm, args)
//Return a string with all letters converted to uppercase
{
  return args[0].toUpperCase();
}

function funcLower(vm, args)
//Return a string with all letters converted to lowercase
{
  return args[0].toLowerCase();
}

function funcLeft(vm, args)
//Return a string containing a specified number of characters from the left side of a string
{
  return args[0].slice(0, args[1]);
}

function funcRight(vm, args)
//Return a string containing a specified number of characters from the right side of a string
{
  return args[0].slice(-args[1]);
}

function funcMid(vm, args)
//Return a string containing a specified number of characters from a string
{
  if(args.length == 2)
  {
    return args[0].slice(args[1] - 1);
  }
  else
  {
    return args[0].slice(args[1] - 1, args[1] + args[2] - 1);
  }
}

function funcTrim(vm, args)
//Return a string with the whitespace removed from both ends
{
  return args[0].trim();
}

function funcLTrim(vm, args)
//Return a string with the whitespace removed from its left side.
{
  return args[0].trimStart();
}

function funcRTrim(vm, args)
//Return a string with the whitespace removed from its right side
{
  return args[0].trimEnd();
}

function funcInstr(vm, args)
//Return the position of the first occurence of one string within another
{
  if(args.length == 2)
  {
    return args[0].indexOf(args[1]) + 1;
  }
  else
  {
    return args[0].indexOf(args[1], args[2] - 1) + 1;
  }
}

function funcAbs(vm, args)
//Return the absolute value of a number
{
  return Math.abs(args[0]);
}

function funcAsc(vm, args)
//Return the ASCII value of the first character in a string
{
  return args[0].charCodeAt(0);
}

function funcChr(vm, args)
//Return the character of an ASCII number
{
  return String.fromCharCode(args[0]);
}

function funcMin(vm, args)
//Return the minimum of two numbers
{
  return Math.min(args[0], args[1]);
}

function funcMax(vm, args)
//Return the maximun of two numbers
{
  return Math.max(args[0], args[1]);
}

function funcSqr(vm, args)
//Return the square root of a number
{
  return Math.sqrt(args[0]);
}

function funcStr(vm, args)
//Return the string representation of a number
{
  return args[0].toString();
}

function funcVal(vm, args)
//Return the number contained in a string
{
  return parseFloat(args[0]);
}

function funcStartTimer(vm, args)
//Set the timer to call the given user function at the interval
{
  var timeout = args[0];
  var callbackUserFunc = args[1];

  if(!(callbackUserFunc instanceof ObjUserFunc))
    vm.runError("Second argument of startTimer() must be a function.");

  if(callbackUserFunc.paramCount != 0)
    vm.runError("Callback function for startTimer() must have zero parameters.");

  if(timerID != 0)
    clearInterval(timerID);

  if(!timerCallback)
  {
    timerCallback = new CallbackContext(vm, callbackUserFunc);
  }
  else
  {
    timerCallback.vm = vm;
    timerCallback.userFunc = callbackUserFunc;
  }

  timerID = setInterval(timer_onTick, timeout);

  return null;
}

function funcStopTimer(vm, args)
//Stop the timer
{
  if(timerID == 0)
    return 0;

  clearInterval(timerID);
  timerID = 0;

  return null;
}

function funcAddArrayItem(vm, args)
//
{
  var array = args[0];
  var newVal = args[1];
  var beforeIndex = -1;
  var errorMsg = "";

  if(args.length == 3)
    beforeIndex = args[2];

  if(!(array instanceof ObjArray))
    vm.runError("First argument of addArrayItem() must be an array.");

  errorMsg = array.addItem(newVal, beforeIndex);

  if(errorMsg != "")
    vm.runError(errorMsg);

  return null;
}

function funcRemoveArrayItem(vm, args)
//
{
  var array = args[0];
  var itemIndex = args[1];
  var errorMsg = "";

  if(!(array instanceof ObjArray))
    vm.runError("First argument of removeArrayItem() must be an array.");

  errorMsg = array.removeItem(itemIndex);

  if(errorMsg != "")
    vm.runError(errorMsg);

  return null;
}

function funcClamp(vm, args)
//
{
  var val = args[0];
  var min = args[1];
  var max = args[2];

  return Math.max(min, Math.min(val, max));
}

function funcPointInRect(vm, args)
//
{
  var pointX = args[0];
  var pointY = args[1];
  var rectX = args[2];
  var rectY = args[3];
  var rectWidth = args[4];
  var rectHeight = args[5];

  if((pointX <= rectX) || (pointX >= (rectX + rectWidth)))
    return false;

  if((pointY <= rectY) || (pointY >= (rectY + rectHeight)))
    return false;

  return true;
}

function funcPointInCircle(vm, args)
//
{
  var pointX = args[0];
  var pointY = args[1];
  var circleX = args[2];
  var circleY = args[3];
  var circleRadius = args[4];
  var distance = Math.pow(circleX - pointX, 2) + Math.pow(circleY - pointY, 2);

  return distance < Math.pow(circleRadius, 2);
}

function funcRectsOverlap(vm, args)
//
{
  var rectX1 = args[0];
  var rectY1 = args[1];
  var rectWidth1 = args[2];
  var rectHeight1 = args[3];
  var rectX2 = args[4];
  var rectY2 = args[5];
  var rectWidth2 = args[6];
  var rectHeight2 = args[7];

  if(((rectX1 + rectWidth1) <= rectX2) || (rectX1 >= (rectX2 + rectWidth2)))
    return false;

  if(((rectY1 + rectHeight1) <= rectY2) || (rectY1 >= (rectY2 + rectHeight2)))
    return false;

  return true;
}

function funcCirclesOverlap(vm, args)
//
{
  var circleX1 = args[0];
  var circleY1 = args[1];
  var circleRadius1 = args[2];
  var circleX2 = args[3];
  var circleY2 = args[4];
  var circleRadius2 = args[5];
  var distance = Math.pow(circleX1 - circleX2, 2) + Math.pow(circleY1 - circleY2, 2);

  return distance < Math.pow(circleRadius1 + circleRadius2, 2);
}

function funcRectOverlapsCircle(vm, args)
//
{
  var rectX = args[0];
  var rectY = args[1];
  var rectWidth = args[2];
  var rectHeight = args[3];
  var circleX = args[4];
  var circleY = args[5];
  var circleRadius = args[6];
  var closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
  var closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
  var distance = Math.pow(circleX - closestX, 2) + Math.pow(circleY - closestY, 2);

  return distance < Math.pow(circleRadius, 2);
}

function funcCos(vm, args)
//Return the sine of an angle specified in radians
{
  var rads = args[0];
  return Math.cos(rads);
}

function funcSin(vm, args)
//Return the cosine of an angle specified in radians
{
  var rads = args[0];
  return Math.sin(rads);
}

function funcTan(vm, args)
//Return the tangent of an angle specified in radians
{
  var rads = args[0];
  return Math.tan(rads);
}

function funcRound(vm, args)
//Return a number rounded to either the nearest integer or given decimal place
{
  var num = args[0];
  var places;

  if(args.length == 1)
    return Math.round(num);
  else
  {
    places = args[1];
    return parseFloat(parseFloat(num).toFixed(places));
  }
}

function funcVersion(vm, args)
//Return the current Logan BASIC version
{
  return lbVersion;
}

function funcWord(vm, args)
//Returns the word at the given position within the given string
{
  var string = args[0];
  var wordIndex = args[1] - 1;
  var delimiter = " ";
  var words;

  if(args.length == 3)
    delimiter = args[2];

  words = string.split(delimiter);

  if((wordIndex < 0) || (wordIndex >= words.length))
    return "";
  else
    return words[wordIndex];
}

function funcSplitStr(vm, args)
//Split a string into an array of sub strings
{
  var string = args[0];
  var delimiter = args[1];
  var words;
  var wordArray;

  words = string.split(delimiter);

  wordArray = new ObjArray();
  wordArray.reDim([words.length]);

  words.forEach((word, index) => wordArray.items[index] = word);

  return wordArray;
}

function funcPauseFor(vm, args)
//Pause program execution for the given amount of milliseconds
{
  var timeout = args[0];

  if(!pauseForCallback)
    pauseForCallback = new CallbackContext(vm);
  else
    pauseForCallback.vm = vm;

  vm.runLoopExitFlag = true;

  setTimeout(pauseFor_onTimeout, timeout);

  return undefined;
}

function funcImport(vm, args)
//
{
  var sourceFile = args[0];
  var httpReq = new XMLHttpRequest();

  if(!importCallback)
    importCallback = new CallbackContext(vm);
  else
    importCallback.vm = vm;

  vm.runLoopExitFlag = true;

  httpReq.addEventListener("load", import_onLoad);
  httpReq.addEventListener("error", import_onError);

  httpReq.open("GET", sourceFile);
  httpReq.send();

  return undefined;
}

function funcRun(vm, args)
//
{
  var source = args[0];
  var sourceName = vm.currCallFrame.func.sourceName  + ":" + vm.getCurrOpSourceLineNum() + ":eval";
  var result;

  vm.stack.push(null);

  result = vm.interpret(source, sourceName);

  if(result == INTERPRET_COMPILE_ERROR)
    vm.runLoopExitFlag = true;

  return undefined;
}