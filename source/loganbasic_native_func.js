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
                  new NativeFunc("rnd", 0, funcRnd),
                  new NativeFunc("time", 0, funcTime),
                  new NativeFunc("int", 1, funcInt)
                 ];

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
