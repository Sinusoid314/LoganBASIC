class Runtime
{
  constructor(bytecode)
  {
    this.bytecode = bytecode;
    this.currOpIndex = 0;
    this.stack = [];
    this.opFuncs = [null];
    this.errorMsg = "";

    //Allow the op methods to be called by indexing into a function array using the opcode constants
    this.opFuncs[OPCODE_LOAD_TRUE] = this.opLoadTrue.bind(this);
    this.opFuncs[OPCODE_LOAD_FALSE] = this.opLoadFalse.bind(this);
    this.opFuncs[OPCODE_LOAD_NATIVE_FUNC] = this.opLoadNativeFunc.bind(this);
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
    this.opFuncs[OPCODE_CALL_NATIVE_FUNC] = this.opCallNativeFunc.bind(this);
    this.opFuncs[OPCODE_CREATE_ARRAY] = this.opCreateArray.bind(this);
    this.opFuncs[OPCODE_REDIM_ARRAY] = this.opReDimArray.bind(this);
    this.opFuncs[OPCODE_LOAD_ARRAY_ITEM] = this.opLoadArrayItem.bind(this);
    this.opFuncs[OPCODE_STORE_ARRAY_ITEM_PERSIST] = this.opStoreArrayItemPersist.bind(this);
    this.opFuncs[OPCODE_CLS] = this.opCls.bind(this);
    this.opFuncs[OPCODE_CHECK_COUNTER] = this.opCheckCounter.bind(this);
    this.opFuncs[OPCODE_INCREMENT_COUNTER] = this.opIncrementCounter.bind(this);

    //Variable values are kept at the bottom of the stack and initialized to 0
    for(var n = 0; n < this.bytecode.varIdents.length; n++)
      this.stack.push(0);
  }

  run()
  //Execute the bytecode ops
  {
	try
	{
      while(!this.endOfOps() && !this.inputting)
      {
		this.opFuncs[this.getOperand(0)]();
        this.currOpIndex++;
      }
    }
    catch(errorObj)
    {
      this.errorMsg = "Runtime error: " + errorObj.message;
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

  opLoadNativeFunc()
  //Push a reference to the given native function object onto the stack
  {
    var funcIndex = this.getOperand(1);
    var funcRef = this.bytecode.nativeFuncs[funcIndex];

    this.stack.push(funcRef);
  }

  opLoadLit()
  //Push the value of the given literal onto the stack
  {
    var litIndex = this.getOperand(1);
    var val = this.bytecode.literals[litIndex];
    this.stack.push(val);
  }

  opLoadVar()
  //Push the value of the given variable onto the stack
  {
    var varIndex = this.getOperand(1);
    var val = this.stack[varIndex];
    this.stack.push(val);
  }

  opStoreVar()
  //Pop value from the stack and store it in the given variable
  {
    var varIndex = this.getOperand(1);
    var val = this.stack.pop();
    this.stack[varIndex] = val;
  }

  opStoreVarPersist()
  //Pop value from the stack and store it in the given variable, keeping value on the stack
  {
    var varIndex = this.getOperand(1);
    var val = this.stack[this.stack.length - 1];
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
    var opIndex = this.getOperand(1);
    this.currOpIndex = opIndex - 1;
  }

  opJumpIfFalse()
  //Jump to the instruction at opIndex if value is false
  {
    var opIndex = this.getOperand(1);
    var val = this.stack.pop();

    if(!val)
      this.currOpIndex = opIndex - 1;
  }

  opJumpIfFalsePersist()
  //Jump to the instruction at opIndex if value is false, keeping value on the stack
  {
    var opIndex = this.getOperand(1);
    var val = this.stack[this.stack.length - 1];

    if(!val)
      this.currOpIndex = opIndex - 1;
  }

  opJumpIfTrue()
  //Jump to the instruction at opIndex if value is true
  {
    var opIndex = this.getOperand(1);
    var val = this.stack.pop();

    if(val)
      this.currOpIndex = opIndex - 1;
  }

  opJumpIfTruePersist()
  //Jump to the instruction at opIndex if value is true, keeping value on the stack
  {
    var opIndex = this.getOperand(1);
    var val = this.stack[this.stack.length - 1];

    if(val)
      this.currOpIndex = opIndex - 1;
  }

  opEnd()
  //Trigger the program to end
  {
    this.currOpIndex = this.bytecode.ops.length;
  }

  opCallNativeFunc()
  //Call the given native function object with the given arguments
  {
    var argCount = this.getOperand(1);
    var args = this.stack.splice(this.stack.length - argCount, argCount)
    var funcRef = this.stack.pop();
    var retVal;

    if(!(funcRef instanceof ObjNativeFunc))
      throw {message: "Expected function."};

    if((argCount < funcRef.paramMin) || (argCount > funcRef.paramMax))
      throw {message: "Wrong number of arguments for function " + funcRef.ident + "()."};

    retVal = funcRef.func(this, args);

    this.stack.push(retVal);
  }

  opCreateArray()
  //Create an array with the given dimensions
  {
    var dimCount = this.getOperand(1);
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
    var dimCount = this.getOperand(1);
    var dimSizes = new Array(dimCount).fill(0);
    var arrayRef;

    for(var n = dimCount - 1; n >= 0; n--)
      dimSizes[n] = this.stack.pop();

    arrayRef = this.stack.pop();

    if(!(arrayRef instanceof ObjArray))
      throw {message: "Expected array."};

    arrayRef.reDim(dimSizes);
  }

  opLoadArrayItem()
  //Push the value of the given array item onto the stack
  {
    var indexCount = this.getOperand(1);
    var indexList = new Array(indexCount).fill(0);
    var arrayRef, linearIndex;

    for(var n = indexCount - 1; n >= 0; n--)
      indexList[n] = this.stack.pop();

    arrayRef = this.stack.pop();

    if(!(arrayRef instanceof ObjArray))
      throw {message: "Expected array."};

    linearIndex = arrayRef.getLinearIndex(indexList);

    if(linearIndex < 0)
      throw {message: "Array index out of bounds."};

    this.stack.push(arrayRef.items[linearIndex]);
  }

  opStoreArrayItemPersist()
  //Set the given array item to the given value, keeping value on the stack
  {
    var indexCount = this.getOperand(1);
    var indexList = new Array(indexCount).fill(0);
    var arrayRef, linearIndex;
    var itemVal = this.stack.pop();

    for(var n = indexCount - 1; n >= 0; n--)
      indexList[n] = this.stack.pop();

    arrayRef = this.stack.pop();

    if(!(arrayRef instanceof ObjArray))
      throw {message: "Expected array."};

    linearIndex = arrayRef.getLinearIndex(indexList);

    if(linearIndex < 0)
      throw {message: "Array index out of bounds."};

    arrayRef.items[linearIndex] = itemVal;
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

  getOperand(operandIndex)
  //Return the operand at the given index of the current op
  {
    return this.bytecode.ops[this.currOpIndex][operandIndex];
  }

  endOfOps()
  //Return true if the op index is past the end of the op list
  {
    return (this.currOpIndex >= this.bytecode.ops.length);
  }
}

