class Runtime
{
  constructor(bytecode)
  {
    this.bytecode = bytecode;
    this.currOpIndex = 0;
    this.stack = [];
    this.opFuncList = [null];
    this.errorMsg = "";

    //Allow the op methods to be called by indexing into a function array using the opcode constants
    this.opFuncList[OPCODE_LOAD_VAR] = this.opLoadVar.bind(this);
    this.opFuncList[OPCODE_LOAD_LIT] = this.opLoadLit.bind(this);
    this.opFuncList[OPCODE_STORE_VAR] = this.opStoreVar.bind(this);
    this.opFuncList[OPCODE_POP] = this.opPop.bind(this);
    this.opFuncList[OPCODE_SUB] = this.opSub.bind(this);
    this.opFuncList[OPCODE_ADD] = this.opAdd.bind(this);
    this.opFuncList[OPCODE_DIV] = this.opDiv.bind(this);
    this.opFuncList[OPCODE_MUL] = this.opMul.bind(this);
    this.opFuncList[OPCODE_NEGATE] = this.opNegate.bind(this);
    this.opFuncList[OPCODE_PRINT] = this.opPrint.bind(this);

    //Variable values are kept at the bottom of the stack and initialized to 0
    for(var n = 0; n < this.bytecode.varIdentList.length; n++)
      this.stack.push(0);
  }

  run()
  //Execute the bytecode ops
  {
	try
	{
      while(!this.endOfOps())
      {
		this.opFuncList[this.bytecode.opList[this.currOpIndex][0]]();
        this.currOpIndex++;
      }
    }
    catch(errorObj)
    {
      this.errorMsg = "Runtime error: " + errorObj.message;
    }
  }

  opLoadVar()
  //Push the value of the given variable onto the stack
  {
    var varIndex = this.bytecode.opList[this.currOpIndex][1];
    var val = this.stack[varIndex];
    this.stack.push(val);
  }

  opLoadLit()
  //Push the value of the given literal onto the stack
  {
    var litIndex = this.bytecode.opList[this.currOpIndex][1];
    var val = this.bytecode.literalList[litIndex];
    this.stack.push(val);
  }

  opStoreVar()
  //Pop value from the stack and store it in the given variable
  {
    var varIndex = this.bytecode.opList[this.currOpIndex][1];
    var val = this.stack.pop();
    this.stack[varIndex] = val;
  }

  opPop()
  //Pop value from the stack and discard it
  {
    this.stack.pop();
  }

  opSub()
  //Subract two numbers
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = val1 - val2;
    this.stack.push(res);
  }

  opAdd()
  //Add two numbers
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = val1 + val2;
    this.stack.push(res);
  }

  opDiv()
  //Divide two numbers
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = val1 / val2;
    this.stack.push(res);
  }

  opMul()
  //Multiply two numbers
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = val1 * val2;
    this.stack.push(res);
  }

  opNegate()
  //Switch the sign of a number
  {
    var val = this.stack.pop();
    var res = -val;
    this.stack.push(res);
  }

  opPrint()
  //Print a value to the console
  {
	var val = this.stack.pop();
	val += '\n';
    postMessage({msgId: MSGID_PRINT, msgData: val});
  }

  endOfOps()
  //Return true if the op index is past the end of the op list
  {
    return (this.currOpIndex >= this.bytecode.opList.length);
  }
}
