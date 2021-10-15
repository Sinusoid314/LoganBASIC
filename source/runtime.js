const RUNTIME_STATUS_RUNNING = 1;
const RUNTIME_STATUS_PAUSED = 2;
const RUNTIME_STATUS_DONE = 3;

class CallbackContext
{
  constructor(runtime, userFunc)
  {
    this.runtime = runtime;
    this.userFunc = userFunc;
  }

  runFunc()
  //Load the user function and arguments onto the runtime's stack, call the function, and start the runtime
  {
    var argCount = arguments.length;
    var stackIndex = this.runtime.stack.length;

    this.runtime.stack.push(this.userFunc);

    for(var argIndex = 0; argIndex < argCount; argIndex++)
      this.runtime.stack.push(arguments[argIndex]);

    this.runtime.callUserFunc(this.userFunc, argCount, stackIndex);
    this.runtime.status = RUNTIME_STATUS_RUNNING;
    this.runtime.run();
  }
}

class CallFrame
{
  constructor(func, stackIndex)
  {
    this.func = func;
    this.stackIndex = stackIndex;
    this.nextOpIndex = 0;
  }
}

class Runtime
{
  constructor(bytecode)
  {
    this.bytecode = bytecode;
    this.callFrames = [];
    this.currCallFrame = null;
    this.stack = [];
    this.currOp = null;
    this.opFuncs = [null];
    this.onDoneJsFunc = null;
    this.status = RUNTIME_STATUS_RUNNING;
    this.errorMsg = "";

    //Allow the op methods to be called by indexing into a function array using the opcode constants
    this.opFuncs[OPCODE_LOAD_TRUE] = this.opLoadTrue.bind(this);
    this.opFuncs[OPCODE_LOAD_FALSE] = this.opLoadFalse.bind(this);
    this.opFuncs[OPCODE_LOAD_INT] = this.opLoadInt.bind(this);
    this.opFuncs[OPCODE_LOAD_NATIVE_FUNC] = this.opLoadNativeFunc.bind(this);
    this.opFuncs[OPCODE_LOAD_USER_FUNC] = this.opLoadUserFunc.bind(this);
    this.opFuncs[OPCODE_LOAD_LIT] = this.opLoadLit.bind(this);
    this.opFuncs[OPCODE_LOAD_VAR] = this.opLoadVar.bind(this);
    this.opFuncs[OPCODE_STORE_VAR] = this.opStoreVar.bind(this);
    this.opFuncs[OPCODE_STORE_VAR_PERSIST] = this.opStoreVarPersist.bind(this);
    this.opFuncs[OPCODE_POP] = this.opPop.bind(this);
    this.opFuncs[OPCODE_SUB] = this.opSub.bind(this);
    this.opFuncs[OPCODE_ADD] = this.opAdd.bind(this);
    this.opFuncs[OPCODE_DIV] = this.opDiv.bind(this);
    this.opFuncs[OPCODE_MUL] = this.opMul.bind(this);
    this.opFuncs[OPCODE_MOD] = this.opMod.bind(this);
    this.opFuncs[OPCODE_NEGATE] = this.opNegate.bind(this);
    this.opFuncs[OPCODE_NOT] = this.opNot.bind(this);
    this.opFuncs[OPCODE_EQUAL] = this.opEqual.bind(this);
    this.opFuncs[OPCODE_GREATER] = this.opGreater.bind(this);
    this.opFuncs[OPCODE_LESS] = this.opLess.bind(this);
    this.opFuncs[OPCODE_POW] = this.opPow.bind(this);
    this.opFuncs[OPCODE_PRINT] = this.opPrint.bind(this);
    this.opFuncs[OPCODE_JUMP] = this.opJump.bind(this);
    this.opFuncs[OPCODE_JUMP_IF_FALSE] = this.opJumpIfFalse.bind(this);
    this.opFuncs[OPCODE_JUMP_IF_FALSE_PERSIST] = this.opJumpIfFalsePersist.bind(this);
    this.opFuncs[OPCODE_JUMP_IF_TRUE] = this.opJumpIfTrue.bind(this);
    this.opFuncs[OPCODE_JUMP_IF_TRUE_PERSIST] = this.opJumpIfTruePersist.bind(this);
    this.opFuncs[OPCODE_END] = this.opEnd.bind(this);
    this.opFuncs[OPCODE_CALL_FUNC] = this.opCallFunc.bind(this);
    this.opFuncs[OPCODE_CREATE_ARRAY] = this.opCreateArray.bind(this);
    this.opFuncs[OPCODE_REDIM_ARRAY] = this.opReDimArray.bind(this);
    this.opFuncs[OPCODE_LOAD_ARRAY_ITEM] = this.opLoadArrayItem.bind(this);
    this.opFuncs[OPCODE_STORE_ARRAY_ITEM_PERSIST] = this.opStoreArrayItemPersist.bind(this);
    this.opFuncs[OPCODE_CLS] = this.opCls.bind(this);
    this.opFuncs[OPCODE_CHECK_COUNTER] = this.opCheckCounter.bind(this);
    this.opFuncs[OPCODE_INCREMENT_COUNTER] = this.opIncrementCounter.bind(this);
    this.opFuncs[OPCODE_RETURN] = this.opReturn.bind(this);
    this.opFuncs[OPCODE_PAUSE] = this.opPause.bind(this);

    //Load and call the main user function
    this.stack.push(this.bytecode.userFuncs[0]);
    this.callUserFunc(this.bytecode.userFuncs[0], 0, 0);
  }

  run()
  //Execute the bytecode ops
  {
	try
	{
      while(this.status == RUNTIME_STATUS_RUNNING)
      {
        this.currOp = this.currCallFrame.func.ops[this.currCallFrame.nextOpIndex];
        this.currCallFrame.nextOpIndex++;
		this.opFuncs[this.currOp[0]]();
      }
    }
    catch(err)
    {
      this.errorMsg = "Runtime error on line " + err.lineNum + ": "  + err.message;
    }

    if(this.status == RUNTIME_STATUS_DONE)
    {
      this.stack.splice(0);
      this.callFrames.splice(0);
      this.onDoneJsFunc(this);
    }
  }

  opLoadTrue()
  //Push 'true' onto the stack.
  {
    this.stack.push(true);
  }

  opLoadFalse()
  //Push 'false' onto the stack.
  {
    this.stack.push(false);
  }

  opLoadInt()
  //Push an integer value onto the stack
  {
    this.stack.push(this.currOp[1]);
  }

  opLoadNativeFunc()
  //Push a reference to the given native function object onto the stack
  {
    var funcIndex = this.currOp[1];
    var func = this.bytecode.nativeFuncs[funcIndex];

    this.stack.push(func);
  }

  opLoadUserFunc()
  //Push a reference to the given user function object onto the stack
  {
    var funcIndex = this.currOp[1];
    var func = this.bytecode.userFuncs[funcIndex];

    this.stack.push(func);
  }

  opLoadLit()
  //Push the value of the given literal onto the stack
  {
    var litIndex = this.currOp[1];
    var val = this.bytecode.literals[litIndex];
    this.stack.push(val);
  }

  opLoadVar()
  //Push the value of the given variable onto the stack
  {
    var varScope = this.currOp[1]
    var varIndex = this.currOp[2] + 1;
    var val;

    if(varScope == SCOPE_GLOBAL)
      val = this.stack[varIndex];
    else
      val = this.stack[this.currCallFrame.stackIndex + varIndex];

    this.stack.push(val);
  }

  opStoreVar()
  //Pop value from the stack and store it in the given variable
  {
    var varScope = this.currOp[1]
    var varIndex = this.currOp[2] + 1;
    var val = this.stack.pop();

    if(varScope == SCOPE_GLOBAL)
      this.stack[varIndex] = val;
    else
      this.stack[this.currCallFrame.stackIndex + varIndex] = val;
  }

  opStoreVarPersist()
  //Store value from top of the stack in the given variable, keeping value on the stack
  {
    var varScope = this.currOp[1]
    var varIndex = this.currOp[2] + 1;
    var val = this.stack[this.stack.length - 1];

    if(varScope == SCOPE_GLOBAL)
      this.stack[varIndex] = val;
    else
      this.stack[this.currCallFrame.stackIndex + varIndex] = val;
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
    var res = (val1 - val2);
    this.stack.push(res);
  }

  opAdd()
  //Add two numbers
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = (val1 + val2);
    this.stack.push(res);
  }

  opDiv()
  //Divide two numbers
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = (val1 / val2);
    this.stack.push(res);
  }

  opMul()
  //Multiply two numbers
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = (val1 * val2);
    this.stack.push(res);
  }

  opMod()
  //Return the remainder of dividing two numbers
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = (val1 % val2);
    this.stack.push(res);
  }

  opNegate()
  //Switch the sign of a number
  {
    var val = this.stack.pop();
    var res = -val;
    this.stack.push(res);
  }

  opNot()
  //Return the logical opposite of a boolean value.
  {
    var val = this.stack.pop();
    var res = !val;
    this.stack.push(res);
  }

  opEqual()
  //Return true if the two values are equal, false otherwise.
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = (val1 == val2);
    this.stack.push(res);
  }

  opGreater()
  //Return true if value1 is greater than value2, false otherwise.
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = (val1 > val2);
    this.stack.push(res);
  }

  opLess()
  //Return true if value1 is less than value2, false otherwise.
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = (val1 < val2);
    this.stack.push(res);
  }

  opPow()
  //Return value1 raised to the power of value2
  {
    var val2 = this.stack.pop();
    var val1 = this.stack.pop();
    var res = Math.pow(val1, val2);
    this.stack.push(res);
  }

  opPrint()
  //Print a value to the console
  {
	var val = this.stack.pop();
	val += '\n';
    postMessage({msgId: MSGID_PRINT, msgData: val});
  }

  opJump()
  //Jump to the instruction at opIndex
  {
    var opIndex = this.currOp[1];
    this.currCallFrame.nextOpIndex = opIndex;
  }

  opJumpIfFalse()
  //Jump to the instruction at opIndex if value is false
  {
    var opIndex = this.currOp[1];
    var val = this.stack.pop();

    if(!val)
      this.currCallFrame.nextOpIndex = opIndex;
  }

  opJumpIfFalsePersist()
  //Jump to the instruction at opIndex if value is false, keeping value on the stack
  {
    var opIndex = this.currOp[1];
    var val = this.stack[this.stack.length - 1];

    if(!val)
      this.currCallFrame.nextOpIndex = opIndex;
  }

  opJumpIfTrue()
  //Jump to the instruction at opIndex if value is true
  {
    var opIndex = this.currOp[1];
    var val = this.stack.pop();

    if(val)
      this.currCallFrame.nextOpIndex = opIndex;
  }

  opJumpIfTruePersist()
  //Jump to the instruction at opIndex if value is true, keeping value on the stack
  {
    var opIndex = this.currOp[1];
    var val = this.stack[this.stack.length - 1];

    if(val)
      this.currCallFrame.nextOpIndex = opIndex;
  }

  opEnd()
  //Trigger the program to end
  {
    this.status = RUNTIME_STATUS_DONE;
  }

  opCallFunc()
  //Call the given function object with the given arguments
  {
    var argCount = this.currOp[1];
    var stackIndex = this.stack.length - argCount - 1;
    var func = this.stack[stackIndex];

    if(func instanceof ObjNativeFunc)
      this.callNativeFunc(func, argCount);
    else if(func instanceof ObjUserFunc)
      this.callUserFunc(func, argCount, stackIndex);
    else
      this.raiseError("Can only call functions.");
  }

  opCreateArray()
  //Create an array with the given dimensions
  {
    var dimCount = this.currOp[1];
    var dimSizes = new Array(dimCount).fill(0);
    var arrayRef;

    for(var n = dimCount - 1; n >= 0; n--)
      dimSizes[n] = this.stack.pop();

    arrayRef = new ObjArray();
    arrayRef.reDim(dimSizes);

    this.stack.push(arrayRef);
  }

  opReDimArray()
  //Set the dimensions of the given array
  {
    var dimCount = this.currOp[1];
    var dimSizes = new Array(dimCount).fill(0);
    var arrayRef;

    for(var n = dimCount - 1; n >= 0; n--)
      dimSizes[n] = this.stack.pop();

    arrayRef = this.stack.pop();

    if(!(arrayRef instanceof ObjArray))
      this.raiseError("Expected array.");

    arrayRef.reDim(dimSizes);
  }

  opLoadArrayItem()
  //Push the value of the given array item onto the stack
  {
    var indexCount = this.currOp[1];
    var indexList = new Array(indexCount).fill(0);
    var arrayRef, linearIndex;

    for(var n = indexCount - 1; n >= 0; n--)
      indexList[n] = this.stack.pop();

    arrayRef = this.stack.pop();

    if(!(arrayRef instanceof ObjArray))
      this.raiseError("Expected array.");

    linearIndex = arrayRef.getLinearIndex(indexList);

    if(linearIndex < 0)
      this.raiseError("Array index out of bounds.");

    this.stack.push(arrayRef.items[linearIndex]);
  }

  opStoreArrayItemPersist()
  //Set the given array item to the given value, keeping value on the stack
  {
    var indexCount = this.currOp[1];
    var indexList = new Array(indexCount).fill(0);
    var arrayRef, linearIndex;
    var itemVal = this.stack.pop();

    for(var n = indexCount - 1; n >= 0; n--)
      indexList[n] = this.stack.pop();

    arrayRef = this.stack.pop();

    if(!(arrayRef instanceof ObjArray))
      this.raiseError("Expected array.");

    linearIndex = arrayRef.getLinearIndex(indexList);

    if(linearIndex < 0)
      this.raiseError("Array index out of bounds.");

    arrayRef.items[linearIndex] = itemVal;
    this.stack.push(itemVal);
  }

  opCls()
  //Clear the console window
  {
    postMessage({msgId: MSGID_CLEAR_CONSOLE});
  }

  opCheckCounter()
  //Return true if the counter value is past the end value
  {
    var counterVal = this.stack[this.stack.length - 1];
    var stepVal = this.stack[this.stack.length - 2];
    var endVal = this.stack[this.stack.length - 3];

    if(stepVal > 0)
    {
      if(counterVal > endVal)
        this.stack.push(true);
      else
        this.stack.push(false);
    }
    else
    {
      if(counterVal < endVal)
        this.stack.push(true);
      else
        this.stack.push(false);
    }
  }

  opIncrementCounter()
  //Add a value to the counter value
  {
    var counterVal = this.stack[this.stack.length - 1];
    var stepVal = this.stack[this.stack.length - 2];
    var newCounterVal = counterVal + stepVal;

    this.stack[this.stack.length - 1] = newCounterVal;
  }

  opReturn()
  //Return from the currently running user function
  {
    this.stack.splice(this.currCallFrame.stackIndex, this.stack.length - this.currCallFrame.stackIndex - 1);
    this.callFrames.pop();

    if(this.callFrames.length == 0)
    {
      this.currCallFrame = null;
      this.status = RUNTIME_STATUS_DONE;
    }
    else
    {
      this.currCallFrame = this.callFrames[this.callFrames.length - 1];
    }
  }

  opPause()
  //Pause program execution and exit from the main runtime loop
  {
    this.status = RUNTIME_STATUS_PAUSED;
  }

  callNativeFunc(func, argCount)
  //Call the given native function
  {
    var args, retVal;

    if((argCount < func.paramMin) || (argCount > func.paramMax))
      this.raiseError("Wrong number of arguments for function '" + func.ident + "'.");

    args = this.stack.splice(this.stack.length - argCount, argCount);
    this.stack.pop();
    retVal = func.jsFunc(this, args);
    this.stack.push(retVal);
  }

  callUserFunc(func, argCount, stackIndex)
  //Load a new call frame for the given user function
  {
    if(argCount != func.paramCount)
      this.raiseError("Wrong number of arguments for function '" + func.ident + "'.");

    this.callFrames.push(new CallFrame(func, stackIndex));

    for(var n = func.paramCount; n < func.varIdents.length; n++)
      this.stack.push(0);

    this.currCallFrame = this.callFrames[this.callFrames.length - 1];
  }

  getSourceLine()
  //
  {
    var opIndex = this.currCallFrame.nextOpIndex - 1;
    var map = this.currCallFrame.func.sourceLineMap;

    for(let [lineNum, indexRange] of map)
    {
      if((opIndex >= indexRange.startOpIndex) && (opIndex <= indexRange.endOpIndex))
        return lineNum;
    }
  }

  raiseError(message)
  //
  {
    this.status = RUNTIME_STATUS_DONE;
    throw {message: message, lineNum: this.getSourceLine()};
  }
}

