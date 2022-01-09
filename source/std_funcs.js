var stdNativeFuncs = [
                  new ObjNativeFunc("showeditor", 0, 0, funcShowEditor),
                  new ObjNativeFunc("hideeditor", 0, 0, funcHideEditor),
                  new ObjNativeFunc("showconsole", 0, 0, funcShowConsole),
                  new ObjNativeFunc("hideconsole", 0, 0, funcHideConsole),
                  new ObjNativeFunc("input", 1, 1, funcInput),
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
                  new ObjNativeFunc("starttimer", 2, 2, funcStartTimer),
                  new ObjNativeFunc("stoptimer", 0, 0, funcStopTimer),
                  new ObjNativeFunc("addarrayitem", 2, 3, funcAddArrayItem),
                  new ObjNativeFunc("removearrayitem", 2, 2, funcRemoveArrayItem),
                  new ObjNativeFunc("clamp", 3, 3, funcClamp),
                  new ObjNativeFunc("pointinrect", 6, 6, funcPointInRect),
                  new ObjNativeFunc("pointincircle", 5, 5, funcPointInCircle),
                  new ObjNativeFunc("rectsoverlap", 8, 8, funcRectsOverlap),
                  new ObjNativeFunc("circlesoverlap", 6, 6, funcCirclesOverlap),
                  new ObjNativeFunc("rectoverlapscircle", 7, 7, funcRectOverlapsCircle)
                 ];

var inputCallback = null;
var timerID = 0;
var timerCallback = null;

function onInputResult(inputStr)
//Process input sent from the console
{
  inputCallback.runtime.stack[inputCallback.runtime.stack.length - 1] = inputStr;
  inputCallback.runFunc();
}

function timer_onTick()
//
{
  if(timerID == 0)
    return;

  timerCallback.runFunc();
}

function funcShowEditor(runtime, args)
//Tell the UI thread to show the program editor pane
{
  postMessage({msgId: MSGID_SHOW_EDITOR});
  return 0;
}

function funcHideEditor(runtime, args)
//Tell the UI thread to hide the program editor pane
{
  postMessage({msgId: MSGID_HIDE_EDITOR});
  return 0;
}

function funcShowConsole(runtime, args)
//Tell the UI thread to show the console pane
{
  postMessage({msgId: MSGID_SHOW_CONSOLE});
  return 0;
}

function funcHideConsole(runtime, args)
//Tell the UI thread to hide the console pane
{
  postMessage({msgId: MSGID_HIDE_CONSOLE});
  return 0;
}

function funcInput(runtime, args)
//Prompt user for input from the consol
{
  if(inputCallback == null)
    inputCallback = new CallbackContext(runtime);
  else
    inputCallback.runtime = runtime;

  postMessage({msgId: MSGID_PRINT, msgData: args[0]});
  postMessage({msgId: MSGID_INPUT_REQUEST});

  runtime.status = RUNTIME_STATUS_PAUSED;

  return "";
}

function funcRnd(runtime, args)
//Return a pseudo-random number between 0 and 1
{
  return Math.random();
}

function funcTime(runtime, args)
//Return the number of milliseconds elapsed since January 1, 1970
{
  return Date.now();
}

function funcInt(runtime, args)
//Return the integer portion of a number
{
  return parseInt(args[0]);
}

function funcLen(runtime, args)
//Return the number of characters in a string, or the linear size of an array
{
  var len;

  if(args[0] instanceof ObjArray)
    len = args[0].items.length;
  else
    len = args[0].length;

  return len;
}

function funcUpper(runtime, args)
//Return a string with all letters converted to uppercase
{
  return args[0].toUpperCase();
}

function funcLower(runtime, args)
//Return a string with all letters converted to lowercase
{
  return args[0].toLowerCase();
}

function funcLeft(runtime, args)
//Return a string containing a specified number of characters from the left side of a string
{
  return args[0].slice(0, args[1]);
}

function funcRight(runtime, args)
//Return a string containing a specified number of characters from the right side of a string
{
  return args[0].slice(-args[1]);
}

function funcMid(runtime, args)
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

function funcTrim(runtime, args)
//Return a string with the whitespace removed from both ends
{
  return args[0].trim();
}

function funcLTrim(runtime, args)
//Return a string with the whitespace removed from its left side.
{
  return args[0].trimStart();
}

function funcRTrim(runtime, args)
//Return a string with the whitespace removed from its right side
{
  return args[0].trimEnd();
}

function funcInstr(runtime, args)
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

function funcAbs(runtime, args)
//Return the absolute value of a number
{
  return Math.abs(args[0]);
}

function funcAsc(runtime, args)
//Return the ASCII value of the first character in a string
{
  return args[0].charCodeAt(0);
}

function funcChr(runtime, args)
//Return the character of an ASCII number
{
  return String.fromCharCode(args[0]);
}

function funcMin(runtime, args)
//Return the minimum of two numbers
{
  return Math.min(args[0], args[1]);
}

function funcMax(runtime, args)
//Return the maximun of two numbers
{
  return Math.max(args[0], args[1]);
}

function funcSqr(runtime, args)
//Return the square root of a number
{
  return Math.sqrt(args[0]);
}

function funcStr(runtime, args)
//Return the string representation of a number
{
  return args[0].toString();
}

function funcVal(runtime, args)
//Return the number contained in a string
{
  return parseFloat(args[0]);
}

function funcStartTimer(runtime, args)
//Set the timer to call the given user function at the interval
{
  var timeout = args[0];
  var callbackUserFunc = args[1];

  if(!(callbackUserFunc instanceof ObjUserFunc))
    runtime.endWithError("Second argument of startTimer() must be a function.");

  if(callbackUserFunc.paramCount != 0)
    runtime.endWithError("Callback function for startTimer() must have zero parameters.");

  if(timerID != 0)
    clearInterval(timerID);

  if(timerCallback == null)
  {
    timerCallback = new CallbackContext(runtime, callbackUserFunc);
  }
  else
  {
    timerCallback.runtime = runtime;
    timerCallback.userFunc = callbackUserFunc;
  }

  timerID = setInterval(timer_onTick, timeout);

  return 0;
}

function funcStopTimer(runtime, args)
//Stop the timer
{
  if(timerID == 0)
    return 0;

  clearInterval(timerID);
  timerID = 0;

  return 0;
}

function funcAddArrayItem(runtime, args)
//
{
  var array = args[0];
  var newVal = args[1];
  var beforeIndex = -1;
  var errorMsg = "";

  if(args.length == 3)
    beforeIndex = args[2];

  if(!(array instanceof ObjArray))
    runtime.endWithError("First argument of addArrayItem() must be an array.");

  errorMsg = array.addItem(newVal, beforeIndex);

  if(errorMsg != "")
    runtime.endWithError(errorMsg);

  return 0;
}

function funcRemoveArrayItem(runtime, args)
//
{
  var array = args[0];
  var itemIndex = args[1];
  var errorMsg = "";

  if(!(array instanceof ObjArray))
    runtime.endWithError("First argument of removeArrayItem() must be an array.");

  errorMsg = array.removeItem(itemIndex);

  if(errorMsg != "")
    runtime.endWithError(errorMsg);

  return 0;
}

function funcClamp(runtime, args)
//
{
  var val = args[0];
  var min = args[1];
  var max = args[2];

  return Math.max(min, Math.min(val, max));
}

function funcPointInRect(runtime, args)
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

function funcPointInCircle(runtime, args)
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

function funcRectsOverlap(runtime, args)
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

function funcCirclesOverlap(runtime, args)
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

function funcRectOverlapsCircle(runtime, args)
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

