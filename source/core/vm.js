const VM_STATUS_IDLE = 1;
const VM_STATUS_COMPILING = 2;
const VM_STATUS_RUNNING = 3;

const INTERPRET_COMPILE_ERROR = 1;
const INTERPRET_RUNTIME_ERROR = 2;
const INTERPRET_SUCCESS = 3;

class VMError
{
  constructor(message, sourceLineNum, sourceName)
  {
    this.message = message;
    this.sourceLineNum = sourceLineNum;
    this.sourceName = sourceName;
  }
}

class CallbackContext
{
  constructor(vm, userFunc = null)
  {
    this.vm = vm;
    this.userFunc = userFunc;
  }

  runFunc(args = [])
  //Load the user function and arguments onto the vm's stack, call the function, and start the vm
  {
    var argCount = args.length;
    var stackIndex = this.vm.stack.length;

    if(this.vm.status != VM_STATUS_IDLE)
      return;

    if(this.userFunc != null)
    {
      this.vm.stack.push(this.userFunc);

      for(var argIndex = 0; argIndex < argCount; argIndex++)
        this.vm.stack.push(args[argIndex]);

      this.vm.callUserFunc(this.userFunc, argCount, stackIndex);
    }

    this.vm.run();
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

class VM
{
  constructor()
  {
    this.onStatusChangeHook = null;
    this.onRuntimeEndHook = null;
    this.onRuntimeErrorHook = null;
    this.onPrintHook = null;
    this.status = VM_STATUS_IDLE;
    this.error = null;
    this.nativeFuncs = new Map();
    this.globals = new Map();
    this.stack = [];
    this.callFrames = [];
    this.currCallFrame = null;
    this.currOp = null;
    
    //Allow the op methods to be called by indexing into a function array using the opcode constants
    this.opFuncs = [null];
    this.opFuncs[OPCODE_LOAD_NOTHING] = this.opLoadNothing.bind(this);
    this.opFuncs[OPCODE_LOAD_TRUE] = this.opLoadTrue.bind(this);
    this.opFuncs[OPCODE_LOAD_FALSE] = this.opLoadFalse.bind(this);
    this.opFuncs[OPCODE_LOAD_INT] = this.opLoadInt.bind(this);
    this.opFuncs[OPCODE_LOAD_NATIVE_FUNC] = this.opLoadNativeFunc.bind(this);
    this.opFuncs[OPCODE_LOAD_LIT] = this.opLoadLit.bind(this);
    this.opFuncs[OPCODE_LOAD_VAR] = this.opLoadVar.bind(this);
    this.opFuncs[OPCODE_STORE_VAR] = this.opStoreVar.bind(this);
    this.opFuncs[OPCODE_STORE_VAR_PERSIST] = this.opStoreVarPersist.bind(this);
    this.opFuncs[OPCODE_POP] = this.opPop.bind(this);
    this.opFuncs[OPCODE_DEFINE_GLOBAL_VAR] = this.opDefineGlobalVar.bind(this);
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
    this.opFuncs[OPCODE_CREATE_STRUCT] = this.opCreateStruct.bind(this);
    this.opFuncs[OPCODE_LOAD_STRUCT_FIELD] = this.opLoadStructField.bind(this);
    this.opFuncs[OPCODE_STORE_STRUCT_FIELD_PERSIST] = this.opStoreStructFieldPersist.bind(this);
  }

  interpret(source, sourceName = "")
  //Compile and run the given source code
  {
    var rootUserFunc = new ObjUserFunc("<root>");;
    var compiler = new Compiler(this, source, sourceName, rootUserFunc);

    compiler.compile();
    if(this.error != null)
      return INTERPRET_COMPILE_ERROR;

    this.stack.push(rootUserFunc);
    this.callUserFunc(rootUserFunc, 0, 0);

    this.run();
    if(this.error != null)
      return INTERPRET_RUNTIME_ERROR;

    return INTERPRET_SUCCESS;
  }

  run()
  //Execute the bytecode ops
  {
    if(this.status == VM_STATUS_RUNNING)
      return;

    this.error = null;
    this.changeStatus(VM_STATUS_RUNNING);

    try
    {
      while((this.status == VM_STATUS_RUNNING) && (!this.endOfOps()))
      {
        this.currOp = this.currCallFrame.func.ops[this.currCallFrame.nextOpIndex];
        this.currCallFrame.nextOpIndex++;
        this.opFuncs[this.currOp[0]]();
      }
    }
    catch(error)
    {
    }

    this.changeStatus(VM_STATUS_IDLE);

    if(this.onRuntimeEndHook)
    {
      if((this.callFrames.length == 0) && (!this.error))
        this.onRuntimeEndHook(this);
    }
  }

  opLoadNothing()
  //Push 'null' onto the stack.
  {
    this.stack.push(null);
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
    var litIndex = this.currOp[1];
    var ident = this.currCallFrame.func.literals[litIndex];
    var func = this.nativeFuncs.get(ident);

    if(!func)
      this.endWithError("Built-in function '" + ident + "' not defined.");

    this.stack.push(func);
  }

  opLoadLit()
  //Push the value of the given literal onto the stack
  {
    var litIndex = this.currOp[1];
    var val = this.currCallFrame.func.literals[litIndex];
    this.stack.push(val);
  }

  opLoadVar()
  //Push the value of the given variable onto the stack
  {
    var scope = this.currOp[1];
    var index = this.currOp[2];
    var ident, val;

    if(scope == SCOPE_GLOBAL)
    {
      ident = this.currCallFrame.func.literals[index];

      val = this.globals.get(ident);

      if(!val)
        this.endWithError("Variable '" + ident + "' not defined.");
    }
    else
      val = this.stack[this.currCallFrame.stackIndex + index + 1];

    this.stack.push(val);
  }

  opStoreVar()
  //Pop value from the stack and store it in the given variable
  {
    var scope = this.currOp[1];
    var index = this.currOp[2];
    var val = this.stack.pop();
    var ident;

    if(scope == SCOPE_GLOBAL)
    {
      ident = this.currCallFrame.func.literals[index];

      if(!this.globals.has(ident))
        this.endWithError("Variable '" + ident + "' not defined.");

      this.globals.set(ident, val);
    }
    else
      this.stack[this.currCallFrame.stackIndex + index + 1] = val;
  }

  opStoreVarPersist()
  //Store value from top of the stack in the given variable, keeping value on the stack
  {
    var scope = this.currOp[1];
    var index = this.currOp[2];
    var val = this.stack[this.stack.length - 1];
    var ident;

    if(scope == SCOPE_GLOBAL)
    {
      ident = this.currCallFrame.func.literals[index];

      if(!this.globals.has(ident))
        this.endWithError("Variable '" + ident + "' not defined.");

      this.globals.set(ident, val);
    }
    else
      this.stack[this.currCallFrame.stackIndex + index + 1] = val;
  }

  opPop()
  //Pop value from the stack and discard it
  {
    this.stack.pop();
  }

  opDefineGlobalVar()
  //Add an entry to the globals table
  {
    var litIndex = this.currOp[1];
    var ident = this.currCallFrame.func.literals[litIndex];
    var initVal = this.stack.pop();

    this.globals.set(ident, initVal)
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

    if(this.onPrintHook != null)
      this.onPrintHook(this, val, false);
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
    this.clearStacks();
    this.changeStatus(VM_STATUS_IDLE);
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
      this.endWithError("Can only call functions.");
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
      this.endWithError("Expected array.");

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
      this.endWithError("Expected array.");

    linearIndex = arrayRef.getLinearIndex(indexList);

    if(linearIndex < 0)
      this.endWithError("Array index out of bounds.");

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
      this.endWithError("Expected array.");

    linearIndex = arrayRef.getLinearIndex(indexList);

    if(linearIndex < 0)
      this.endWithError("Array index out of bounds.");

    arrayRef.items[linearIndex] = itemVal;
    this.stack.push(itemVal);
  }

  opCls()
  //Clear the console window
  {
    if(this.onPrintHook != null)
      this.onPrintHook(this, "", true);
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
      this.changeStatus(VM_STATUS_IDLE);
    }
    else
    {
      this.currCallFrame = this.callFrames[this.callFrames.length - 1];
    }
  }

  opPause()
  //Pause program execution and exit from the main VM loop
  {
    this.changeStatus(VM_STATUS_IDLE);
  }

  opCreateStruct()
  //Create an instance of the given structure definition
  {
    var litIndex = this.currOp[1];
    var ident = this.currCallFrame.func.literals[litIndex];
    var structDef = this.globals.get(ident);

    if(!structDef)
      this.endWithError("Structure definition '" + ident + "' not defined.");

    if(!(structDef instanceof ObjStructureDef))
      this.endWithError("'" + ident + "' is not a structure definition.");

    this.stack.push(new ObjStructure(structDef));
  }

  opLoadStructField()
  //Push the value of the given structure field onto the stack
  {
    var fieldLitIndex = this.currOp[1];
    var fieldIdent = this.currCallFrame.func.literals[fieldLitIndex];
    var struct = this.stack.pop();

    if(!(struct instanceof ObjStructure))
      this.endWithError("Expected structure.");

    if(!struct.fieldMap.has(fieldIdent))
      this.endWithError("Structure field '" + fieldIdent + "' not defined.");

    this.stack.push(struct.fieldMap.get(fieldIdent));
  }

  opStoreStructFieldPersist()
  //Set the given structure field to the given value, keeping value on the stack
  {
    var fieldLitIndex = this.currOp[1];
    var fieldIdent = this.currCallFrame.func.literals[fieldLitIndex];
    var fieldVal = this.stack.pop();
    var struct = this.stack.pop();

    if(!(struct instanceof ObjStructure))
      this.endWithError("Expected structure.");

    if(!struct.fieldMap.has(fieldIdent))
      this.endWithError("Structure field '" + fieldIdent + "' not defined.");

    struct.fieldMap.set(fieldIdent, fieldVal);

    this.stack.push(fieldVal);
  }

  callNativeFunc(func, argCount)
  //Call the given native function
  {
    var args, retVal;

    if((argCount < func.paramMin) || (argCount > func.paramMax))
      this.endWithError("Wrong number of arguments for function '" + func.ident + "'.");

    args = this.stack.splice(this.stack.length - argCount, argCount);
    this.stack.pop();
    retVal = func.jsFunc(this, args);
    this.stack.push(retVal);
  }

  callUserFunc(func, argCount, stackIndex)
  //Load a new call frame for the given user function
  {
    if(argCount != func.paramCount)
      this.endWithError("Wrong number of arguments for function '" + func.ident + "'.");

    this.callFrames.push(new CallFrame(func, stackIndex));

    if(this.callFrames.length == 1)
    {
      for(var varIndex = func.paramCount; varIndex < func.localIdents.length; varIndex++)
        this.globals.set(func.localIdents[varIndex], 0);
    }
    else
    {
      for(var varIndex = func.paramCount; varIndex < func.localIdents.length; varIndex++)
        this.stack.push(0);
    }

    this.currCallFrame = this.callFrames[this.callFrames.length - 1];
  }

  endWithError(message)
  //
  {
    var hookResult;
    var sourceLineNum = this.getSourceLineNum();
    var sourceName = this.currCallFrame.func.sourceName;

    message = "Runtime error on line " + sourceLineNum + ": "  + message;

    if(!this.error)
      this.error = new VMError(message, sourceLineNum, sourceName);

    if(this.onRuntimeErrorHook)
    {
      hookResult = this.onRuntimeErrorHook(this);
      if(hookResult)
      {
        this.error = null;
        return;
      }
    }

    this.clearStacks();

    if(this.status == VM_STATUS_RUNNING)
      throw this.error;
  }

  getSourceLineNum(opIndex = this.currCallFrame.nextOpIndex - 1)
  //Return the source line number that corresponds to the given op index;
  //if the op index does not have an associated source line number, return 0
  {
    var map = this.currCallFrame.func.sourceLineMap;

    for(const [sourceLineNum, opIndexRange] of map)
    {
      if(opIndexRange.isInRange(opIndex))
        return sourceLineNum;
    }

    return 0;
  }

  changeStatus(newStatus)
  //Change the VM status and run the status-change hook, if present;
  //return the previous status
  {
    var prevStatus = this.status;
    
    if(prevStatus == newStatus)
      return;

    this.status = newStatus;

    if(this.onStatusChangeHook)
      this.onStatusChangeHook(this, prevStatus);
  
    return prevStatus;
  }

  clearStacks()
  //Clear the value and call stacks
  {
    this.stack = [];
    this.callFrames = [];
    this.currCallFrame = null;
  }

  endOfOps()
  //Return true if either the next op index is out of bounds, or there is
  //no current call frame; return false otherwise
  {
    return ((this.callFrames.length == 0) ||
            (this.currCallFrame.nextOpIndex >= this.currCallFrame.func.ops.length));
  }

  addNativeFunc(ident, paramMin, paramMax, jsFunc)
  //Add a new native function object to the VM
  {
    this.nativeFuncs.set(ident, new ObjNativeFunc(ident, paramMin, paramMax, jsFunc));
  }

  addNativeFuncArray(funcArray)
  //Add multiple native function objects to the VM
  {
    funcArray.forEach((func) => this.nativeFuncs.set(func.ident, func))
  }
}

