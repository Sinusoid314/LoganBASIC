class NativeFunc
{
  constructor(ident, paramCount, funcObj)
  {
    this.ident = ident;
    this.paramCount = paramCount;
    this.funcObj = funcObj;
  }
}

stdNativeFuncList = [
                  new NativeFunc("input", 1, funcInput),
                  new NativeFunc("rnd", 0, funcRnd),
                  new NativeFunc("time", 0, funcTime),
                  new NativeFunc("int", 1, funcInt),
                  new NativeFunc("len", 1, funcLen),
                  new NativeFunc("upper", 1, funcUpper),
                  new NativeFunc("lower", 1, funcLower),
                  new NativeFunc("left", 2, funcLeft),
                  new NativeFunc("right", 2, funcRight),
                  new NativeFunc("mid", 3, funcMid),
                  new NativeFunc("trim", 1, funcTrim),
                  new NativeFunc("ltrim", 1, funcLTrim),
                  new NativeFunc("rtrim", 1, funcRTrim),
                  new NativeFunc("instr", 3, funcInstr),
                  new NativeFunc("abs", 1, funcAbs),
                  new NativeFunc("asc", 1, funcAsc),
                  new NativeFunc("chr", 1, funcChr),
                  new NativeFunc("min", 2, funcMin),
                  new NativeFunc("max", 2, funcMax),
                  new NativeFunc("sqr", 1, funcSqr),
                  new NativeFunc("str", 1, funcStr),
                  new NativeFunc("val", 1, funcVal)
                 ];

function funcInput(runtime)
//Prompt user for input from the consol
{
  var val = runtime.stack.pop();
  postMessage({msgId: MSGID_PRINT, msgData: val});
  postMessage({msgId: MSGID_INPUT_REQUEST});
  runtime.inputting = true;
}

function funcRnd(runtime)
//Return a pseudo-random number between 0 and 1
{
  runtime.stack.push(Math.random());
}

function funcTime(runtime)
//Return the number of milliseconds elapsed since January 1, 1970
{
  runtime.stack.push(Date.now());
}

function funcInt(runtime)
//Return the integer portion of a number
{
  var val = runtime.stack.pop();
  runtime.stack.push(parseInt(val));
}

function funcLen(runtime)
//Return the number of characters in a string, or the linear size of an array
{
  var val = runtime.stack.pop();
  var len;

  if(val instanceof ObjArray)
    len = val.itemList.length;
  else
    len = val.length;

  runtime.stack.push(len);
}

function funcUpper(runtime)
//Return a string with all letters converted to uppercase
{
  var str = runtime.stack.pop();
  runtime.stack.push(str.toUpperCase());
}

function funcLower(runtime)
//Return a string with all letters converted to lowercase
{
  var str = runtime.stack.pop();
  runtime.stack.push(str.toLowerCase());
}

function funcLeft(runtime)
//Return a string containing a specified number of characters from the left side of a string.
{
  var len = runtime.stack.pop();
  var str = runtime.stack.pop();

  runtime.stack.push(str.slice(0, len));
}

function funcRight(runtime)
//Return a string containing a specified number of characters from the right side of a string.
{
  var len = runtime.stack.pop();
  var str = runtime.stack.pop();

  runtime.stack.push(str.slice(-len));
}

function funcMid(runtime)
//
{

}

function funcTrim(runtime)
//
{

}

function funcLTrim(runtime)
//
{

}

function funcRTrim(runtime)
//
{

}

function funcInstr(runtime)
//
{

}

function funcAbs(runtime)
//
{

}

function funcAsc(runtime)
//
{

}

function funcChr(runtime)
//
{

}

function funcMin(runtime)
//
{

}

function funcMax(runtime)
//
{

}

function funcSqr(runtime)
//
{

}

function funcStr(runtime)
//
{

}

function funcVal(runtime)
//
{

}
