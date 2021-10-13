var stdNativeFuncList = [
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
                  new ObjNativeFunc("stoptimer", 0, 0, funcStopTimer)
                 ];

var timerID = 0;
var timerCallback = null;

function timer_onTick()
//
{
  if(timerID == 0)
    return;

  timerCallback.callFunc();
}

function funcInput(runtime, args)
//Prompt user for input from the consol
{
  postMessage({msgId: MSGID_PRINT, msgData: args[0]});
  postMessage({msgId: MSGID_INPUT_REQUEST});
  runtime.paused = true;
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
  if(!(args[1] instanceof ObjUserFunc))
    runtime.raiseError("Second argument of StartTimer() must be a function.");

  if(timerID != 0)
  {
    clearInterval(timerID);
    timerID = 0;
    timerCallback = null;
  }

  timerCallback = new CallbackContext(runtime, args[1]);
  timerID = setInterval(timer_onTick, args[0]);
}

function funcStopTimer(runtime, args)
//Stop the timer
{
  if(timerID == 0)
    return 0;

  clearInterval(timerID);
  timerID = 0;
  timerCallback = null;
}

