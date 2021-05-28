class NativeFunc
{
  constructor(ident, paramCount, funcObj)
  {
    this.ident = ident;
    this.paramCount = paramCount;
    this.funcObj = funcObj;
  }
}

nativeFuncList = [
                  new NativeFunc("input", 1, funcInput),
                  new NativeFunc("rnd", 0, funcRnd),
                  new NativeFunc("time", 0, funcTime),
                  new NativeFunc("int", 1, funcInt),
                  new NativeFunc("len", 1, funcLen),
                  new NativeFunc("upper", 1, funcUpper),
                  new NativeFunc("lower", 1, funcLower)
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
  var val = runtime.stack.pop();
  runtime.stack.push(val.toUpperCase());
}

function funcLower(runtime)
//Return a string with all letters converted to lowercase
{
  var val = runtime.stack.pop();
  runtime.stack.push(val.toLowerCase());
}
