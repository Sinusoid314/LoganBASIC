class NativeFunc
{
  constructor(ident, paramMin, paramMax, func)
  {
    this.ident = ident;
    this.paramMin = paramMin;
    this.paramMax = paramMax;
    this.func = func;
  }
}

stdNativeFuncList = [
                  new NativeFunc("input", 1, 1, funcInput),
                  new NativeFunc("rnd", 0, 0, funcRnd),
                  new NativeFunc("time", 0, 0, funcTime),
                  new NativeFunc("int", 1, 1, funcInt),
                  new NativeFunc("len", 1, 1, funcLen),
                  new NativeFunc("upper", 1, 1, funcUpper),
                  new NativeFunc("lower", 1, 1, funcLower),
                  new NativeFunc("left", 2, 2, funcLeft),
                  new NativeFunc("right", 2, 2, funcRight),
                  new NativeFunc("mid", 2, 3, funcMid),
                  new NativeFunc("trim", 1, 1, funcTrim),
                  new NativeFunc("ltrim", 1, 1, funcLTrim),
                  new NativeFunc("rtrim", 1, 1, funcRTrim),
                  new NativeFunc("instr", 2, 3, funcInstr),
                  new NativeFunc("abs", 1, 1, funcAbs),
                  new NativeFunc("asc", 1, 1, funcAsc),
                  new NativeFunc("chr", 1, 1, funcChr),
                  new NativeFunc("min", 2, 2, funcMin),
                  new NativeFunc("max", 2, 2, funcMax),
                  new NativeFunc("sqr", 1, 1, funcSqr),
                  new NativeFunc("str", 1, 1, funcStr),
                  new NativeFunc("val", 1, 1, funcVal)
                 ];

function funcInput(args)
//Prompt user for input from the consol
{
  postMessage({msgId: MSGID_PRINT, msgData: args[0]});
  postMessage({msgId: MSGID_INPUT_REQUEST});
  runtime.inputting = true;
}

function funcRnd(args)
//Return a pseudo-random number between 0 and 1
{
  return Math.random();
}

function funcTime(args)
//Return the number of milliseconds elapsed since January 1, 1970
{
  return Date.now();
}

function funcInt(args)
//Return the integer portion of a number
{
  return parseInt(args[0]);
}

function funcLen(args)
//Return the number of characters in a string, or the linear size of an array
{
  var len;

  if(args[0] instanceof ObjArray)
    len = args[0].itemList.length;
  else
    len = args[0].length;

  return len;
}

function funcUpper(args)
//Return a string with all letters converted to uppercase
{
  return args[0].toUpperCase();
}

function funcLower(args)
//Return a string with all letters converted to lowercase
{
  return args[0].toLowerCase();
}

function funcLeft(args)
//Return a string containing a specified number of characters from the left side of a string
{
  return args[0].slice(0, args[1]);
}

function funcRight(args)
//Return a string containing a specified number of characters from the right side of a string
{
  return args[0].slice(-args[1]);
}

function funcMid(args)
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

function funcTrim(args)
//Return a string with the whitespace removed from both ends
{
  return args[0].trim();
}

function funcLTrim(args)
//Return a string with the whitespace removed from its left side.
{
  return args[0].trimStart();
}

function funcRTrim(args)
//Return a string with the whitespace removed from its right side
{
  return args[0].trimEnd();
}

function funcInstr(args)
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

function funcAbs(args)
//Return the absolute value of a number
{
  return Math.abs(args[0]);
}

function funcAsc(args)
//Return the ASCII value of the first character in a string
{
  return args[0].charCodeAt(0);
}

function funcChr(args)
//Return the character of an ASCII number
{
  return String.fromCharCode(args[0]);
}

function funcMin(args)
//Return the minimum of two numbers
{
  return Math.min(args[0], args[1]);
}

function funcMax(args)
//Return the maximun of two numbers
{
  return Math.max(args[0], args[1]);
}

function funcSqr(args)
//Return the square root of a number
{
  return Math.sqrt(args[0]);
}

function funcStr(args)
//Return the string representation of a number
{
  return args[0].toString();
}

function funcVal(args)
//Return the number contained in a string
{
  return parseFloat(args[0]);
}
