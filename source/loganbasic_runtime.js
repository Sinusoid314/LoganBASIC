class Runtime
{
  constructor(bytecode)
  {
    this.bytecode = bytecode;
    this.currOpIndex = 0;
    this.stack = [];
  }

  run()
  //
  {
	try
	{
      while(!this.endOfOps())
      {
        //
        currOpIndex++;
      }
    }
    catch(errorObj)
    {
      this.errorMsg = "Runtime error: " + errorObj.message;
    }
  }

  endOfOps()
  //
  {
    return (this.currOpIndex >= this.bytecode.opList.length);
  }
}
