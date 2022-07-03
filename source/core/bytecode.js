//Scope types
const SCOPE_GLOBAL = 0;
const SCOPE_LOCAL = 1;

//Opcodes
const OPCODE_LOAD_TRUE = 1;
const OPCODE_LOAD_FALSE = 2;
const OPCODE_LOAD_INT = 3;
const OPCODE_LOAD_NATIVE_FUNC = 4;
const OPCODE_LOAD_USER_FUNC = 5;
const OPCODE_LOAD_LIT = 6;
const OPCODE_LOAD_VAR = 7;
const OPCODE_STORE_VAR = 8;
const OPCODE_STORE_VAR_PERSIST = 9;
const OPCODE_POP = 10;

const OPCODE_SUB = 11;
const OPCODE_ADD = 12;
const OPCODE_DIV = 13;
const OPCODE_MUL = 14;
const OPCODE_MOD = 15;

const OPCODE_NEGATE = 16;
const OPCODE_NOT = 17;
const OPCODE_EQUAL = 18;
const OPCODE_GREATER = 19;
const OPCODE_LESS = 20;
const OPCODE_POW = 21;

const OPCODE_PRINT = 22;
const OPCODE_JUMP = 23;
const OPCODE_JUMP_IF_FALSE = 24;
const OPCODE_JUMP_IF_FALSE_PERSIST = 25;
const OPCODE_JUMP_IF_TRUE = 26;
const OPCODE_JUMP_IF_TRUE_PERSIST = 27;
const OPCODE_END = 28;
const OPCODE_CALL_FUNC = 29;
const OPCODE_CREATE_ARRAY = 30;
const OPCODE_REDIM_ARRAY = 31;
const OPCODE_LOAD_ARRAY_ITEM = 32;
const OPCODE_STORE_ARRAY_ITEM_PERSIST = 33;
const OPCODE_CLS = 34;
const OPCODE_CHECK_COUNTER = 35;
const OPCODE_INCREMENT_COUNTER = 36;
const OPCODE_RETURN = 37;
const OPCODE_PAUSE = 38;
const OPCODE_CREATE_STRUCT = 39;
const OPCODE_LOAD_STRUCT_FIELD = 40;
const OPCODE_STORE_STRUCT_FIELD_PERSIST = 41;

opNames = [];
opNames[OPCODE_LOAD_TRUE] = "LOAD_TRUE";
opNames[OPCODE_LOAD_FALSE] = "LOAD_FALSE";
opNames[OPCODE_LOAD_INT] = "LOAD_INT";
opNames[OPCODE_LOAD_NATIVE_FUNC] = "LOAD_NATIVE_FUNC";
opNames[OPCODE_LOAD_USER_FUNC] = "LOAD_USER_FUNC";
opNames[OPCODE_LOAD_LIT] = "LOAD_LIT";
opNames[OPCODE_LOAD_VAR] = "LOAD_VAR";
opNames[OPCODE_STORE_VAR] = "STORE_VAR";
opNames[OPCODE_STORE_VAR_PERSIST] = "STORE_VAR_PERSIST";
opNames[OPCODE_POP] = "POP";
opNames[OPCODE_SUB] = "SUB";
opNames[OPCODE_ADD] = "ADD";
opNames[OPCODE_DIV] = "DIV";
opNames[OPCODE_MUL] = "MUL";
opNames[OPCODE_MOD] = "MOD";
opNames[OPCODE_NEGATE] = "NEGATE";
opNames[OPCODE_NOT] = "NOT";
opNames[OPCODE_EQUAL] = "EQUAL";
opNames[OPCODE_GREATER] = "GREATER";
opNames[OPCODE_LESS] = "LESS";
opNames[OPCODE_POW] = "POW";
opNames[OPCODE_PRINT] = "PRINT";
opNames[OPCODE_JUMP] = "JUMP";
opNames[OPCODE_JUMP_IF_FALSE] = "JUMP_IF_FALSE";
opNames[OPCODE_JUMP_IF_FALSE_PERSIST] = "JUMP_IF_FALSE_PERSIST";
opNames[OPCODE_JUMP_IF_TRUE] = "JUMP_IF_TRUE";
opNames[OPCODE_JUMP_IF_TRUE_PERSIST] = "JUMP_IF_TRUE_PERSIST";
opNames[OPCODE_END] = "END";
opNames[OPCODE_CALL_FUNC] = "CALL_FUNC";
opNames[OPCODE_CREATE_ARRAY] = "CREATE_ARRAY";
opNames[OPCODE_REDIM_ARRAY] = "REDIM_ARRAY";
opNames[OPCODE_LOAD_ARRAY_ITEM] = "LOAD_ARRAY_ITEM";
opNames[OPCODE_STORE_ARRAY_ITEM_PERSIST] = "STORE_ARRAY_ITEM_PERSIST";
opNames[OPCODE_CLS] = "CLS";
opNames[OPCODE_CHECK_COUNTER] = "CHECK_COUNTER";
opNames[OPCODE_INCREMENT_COUNTER] = "INCREMENT_COUNTER";
opNames[OPCODE_RETURN] = "RETURN";
opNames[OPCODE_PAUSE] = "PAUSE";
opNames[OPCODE_CREATE_STRUCT] = "CREATE_STRUCT";
opNames[OPCODE_LOAD_STRUCT_FIELD] = "LOAD_STRUCT_FIELD";
opNames[OPCODE_STORE_STRUCT_FIELD_PERSIST] = "STORE_STRUCT_FIELD_PERSIST";

class StructureDef
{
  constructor(ident)
  {
    this.ident = ident;
    this.fieldIdents = [];
    this.tokens = [];
  }

  toString()
  //Return the function as a string
  {
    var retStr = "";

    retStr += "Name: " + this.ident + "\n";

    retStr += "Fields:\n------------\n";
    for(var fieldIndex = 0; fieldIndex < this.varIdents.length; fieldIndex++)
      retStr += fieldIndex + ":  " + this.fieldIdents[fieldIndex] + "\n";
    retStr += '\n';

    return retStr;
  }
}

class Bytecode
{
  constructor()
  {
    this.nativeFuncs = [];
    this.literals = [];
    this.structDefs = [];
    this.userFuncs = [];    
  }

  init()
  //Clear all bytecode data, except the native functions array
  {
    this.userFuncs.splice(0);
    this.structDefs.splice(0);
    this.literals.splice(0);
  }

  toString()
  //Return the bytecode as a string
  {
    var retStr = "";

    retStr += "Literals:\n-----------\n";
    for(var litIndex = 0; litIndex < this.literals.length; litIndex++)
      retStr += litIndex + ":  " + this.literals[litIndex] + "\n";
    retStr += '\n\n';

    retStr += "Structure Defs:\n------------\n\n";
    for(var structDefIndex = 0; structDefIndex < this.structDefs.length; structDefIndex++)
      retStr += this.structDefs[structDefIndex].toString() + "\n";

    retStr += "Functions:\n------------\n\n";
    for(var funcIndex = 0; funcIndex < this.userFuncs.length; funcIndex++)
      retStr += this.userFuncs[funcIndex].toString() + "\n";

    return retStr;
  }
}
