//Opcodes
const OPCODE_LOAD_TRUE = 1;
const OPCODE_LOAD_FALSE = 2;
const OPCODE_LOAD_NATIVE_FUNC = 3;
const OPCODE_LOAD_LIT = 4;
const OPCODE_LOAD_VAR = 5;
const OPCODE_STORE_VAR = 6;
const OPCODE_STORE_VAR_PERSIST = 7;
const OPCODE_POP = 8;

const OPCODE_SUB = 9;
const OPCODE_ADD = 10;
const OPCODE_DIV = 11;
const OPCODE_MUL = 12;
const OPCODE_MOD = 13;

const OPCODE_NEGATE = 14;
const OPCODE_NOT = 15;
const OPCODE_EQUAL = 16;
const OPCODE_GREATER = 17;
const OPCODE_LESS = 18;
const OPCODE_POW = 19;

const OPCODE_PRINT = 20;
const OPCODE_JUMP = 21;
const OPCODE_JUMP_IF_FALSE = 22;
const OPCODE_JUMP_IF_FALSE_PERSIST = 23;
const OPCODE_JUMP_IF_TRUE = 24;
const OPCODE_JUMP_IF_TRUE_PERSIST = 25;
const OPCODE_END = 26;
const OPCODE_CALL_NATIVE_FUNC = 27;
const OPCODE_CREATE_ARRAY = 28;
const OPCODE_REDIM_ARRAY = 29;
const OPCODE_LOAD_ARRAY_ITEM = 30;
const OPCODE_STORE_ARRAY_ITEM_PERSIST = 31;
const OPCODE_CLS = 32;
const OPCODE_CHECK_COUNTER = 33;

opNameList = [];
opNameList[OPCODE_LOAD_TRUE] = "LOAD_TRUE";
opNameList[OPCODE_LOAD_FALSE] = "LOAD_FALSE";
opNameList[OPCODE_LOAD_NATIVE_FUNC] = "LOAD_NATIVE_FUNC";
opNameList[OPCODE_LOAD_LIT] = "LOAD_LIT";
opNameList[OPCODE_LOAD_VAR] = "LOAD_VAR";
opNameList[OPCODE_STORE_VAR] = "STORE_VAR";
opNameList[OPCODE_STORE_VAR_PERSIST] = "STORE_VAR_PERSIST";
opNameList[OPCODE_POP] = "POP";
opNameList[OPCODE_SUB] = "SUB";
opNameList[OPCODE_ADD] = "ADD";
opNameList[OPCODE_DIV] = "DIV";
opNameList[OPCODE_MUL] = "MUL";
opNameList[OPCODE_MOD] = "MOD";
opNameList[OPCODE_NEGATE] = "NEGATE";
opNameList[OPCODE_NOT] = "NOT";
opNameList[OPCODE_EQUAL] = "EQUAL";
opNameList[OPCODE_GREATER] = "GREATER";
opNameList[OPCODE_LESS] = "LESS";
opNameList[OPCODE_POW] = "POW";
opNameList[OPCODE_PRINT] = "PRINT";
opNameList[OPCODE_JUMP] = "JUMP";
opNameList[OPCODE_JUMP_IF_FALSE] = "JUMP_IF_FALSE";
opNameList[OPCODE_JUMP_IF_FALSE_PERSIST] = "JUMP_IF_FALSE_PERSIST";
opNameList[OPCODE_JUMP_IF_TRUE] = "JUMP_IF_TRUE";
opNameList[OPCODE_JUMP_IF_TRUE_PERSIST] = "JUMP_IF_TRUE_PERSIST";
opNameList[OPCODE_END] = "END";
opNameList[OPCODE_CALL_NATIVE_FUNC] = "CALL_NATIVE_FUNC";
opNameList[OPCODE_CREATE_ARRAY] = "CREATE_ARRAY";
opNameList[OPCODE_REDIM_ARRAY] = "REDIM_ARRAY";
opNameList[OPCODE_LOAD_ARRAY_ITEM] = "LOAD_ARRAY_ITEM";
opNameList[OPCODE_STORE_ARRAY_ITEM_PERSIST] = "STORE_ARRAY_ITEM_PERSIST";
opNameList[OPCODE_CLS] = "CLS";
opNameList[OPCODE_CHECK_COUNTER] = "CHECK_COUNTER";

class Bytecode
{
  constructor()
  {
    this.nativeFuncList = [];
    this.literalList = [];
    this.varIdentList = [];
    this.opList = [];
  }

  toString()
  //Return the bytecode as a string
  {
    var retStr = "";

    retStr += "Literals:\n";
    retStr += "-----------\n";
    for(var litIndex = 0; litIndex < this.literalList.length; litIndex++)
    {
      retStr += litIndex + ":  " + this.literalList[litIndex];
      retStr += '\n';
    }
    retStr += '\n\n';

    retStr += "Variables:\n";
    retStr += "------------\n";
    for(var varIndex = 0; varIndex < this.varIdentList.length; varIndex++)
    {
      retStr += varIndex + ":  " + this.varIdentList[varIndex];
      retStr += '\n';
    }
    retStr += '\n\n';

    retStr += "Ops:\n";
    retStr += "------\n";
    for(var opIndex = 0; opIndex < this.opList.length; opIndex++)
    {
      retStr += opNameList[this.opList[opIndex][0]];
      for(var operandIndex = 1; operandIndex < this.opList[opIndex].length; operandIndex++)
      {
        retStr += ", " + this.opList[opIndex][operandIndex];
      }
      retStr += '\n';
    }
    retStr += '\n\n';

    return retStr;
  }
}
