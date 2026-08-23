//Scope types
export const SCOPE_GLOBAL = 0;
export const SCOPE_LOCAL = 1;

//Opcodes
export const OPCODE_LOAD_NOTHING = 0;
export const OPCODE_LOAD_TRUE = 1;
export const OPCODE_LOAD_FALSE = 2;
export const OPCODE_LOAD_INT = 3;
export const OPCODE_LOAD_NATIVE_FUNC = 4;
export const OPCODE_LOAD_LIT = 5;
export const OPCODE_LOAD_VAR = 6;
export const OPCODE_STORE_VAR = 7;
export const OPCODE_STORE_VAR_PERSIST = 8;
export const OPCODE_POP = 9;
export const OPCODE_DEFINE_GLOBAL_VAR = 10;
export const OPCODE_DEFINE_LOCAL_VAR = 11;

export const OPCODE_SUB = 12;
export const OPCODE_ADD = 13;
export const OPCODE_DIV = 14;
export const OPCODE_MUL = 15;
export const OPCODE_MOD = 16;

export const OPCODE_NEGATE = 17;
export const OPCODE_NOT = 18;
export const OPCODE_EQUAL = 19;
export const OPCODE_GREATER = 20;
export const OPCODE_LESS = 21;
export const OPCODE_POW = 22;

export const OPCODE_PRINT = 23;
export const OPCODE_JUMP = 24;
export const OPCODE_JUMP_IF_FALSE = 25;
export const OPCODE_JUMP_IF_FALSE_PERSIST = 26;
export const OPCODE_JUMP_IF_TRUE = 27;
export const OPCODE_JUMP_IF_TRUE_PERSIST = 28;
export const OPCODE_END = 29;
export const OPCODE_CALL_FUNC = 30;
export const OPCODE_CREATE_ARRAY = 31;
export const OPCODE_REDIM_ARRAY = 32;
export const OPCODE_LOAD_ARRAY_ITEM = 33;
export const OPCODE_STORE_ARRAY_ITEM_PERSIST = 34;
export const OPCODE_CLS = 35;
export const OPCODE_CHECK_COUNTER = 36;
export const OPCODE_INCREMENT_COUNTER = 37;
export const OPCODE_RETURN = 38;
export const OPCODE_PAUSE = 39;
export const OPCODE_CREATE_STRUCT = 40;
export const OPCODE_LOAD_STRUCT_FIELD = 41;
export const OPCODE_STORE_STRUCT_FIELD_PERSIST = 42;

export const opNames = [];
opNames[OPCODE_LOAD_NOTHING] = "LOAD_NOTHING";
opNames[OPCODE_LOAD_TRUE] = "LOAD_TRUE";
opNames[OPCODE_LOAD_FALSE] = "LOAD_FALSE";
opNames[OPCODE_LOAD_INT] = "LOAD_INT";
opNames[OPCODE_LOAD_NATIVE_FUNC] = "LOAD_NATIVE_FUNC";
opNames[OPCODE_LOAD_LIT] = "LOAD_LIT";
opNames[OPCODE_LOAD_VAR] = "LOAD_VAR";
opNames[OPCODE_STORE_VAR] = "STORE_VAR";
opNames[OPCODE_STORE_VAR_PERSIST] = "STORE_VAR_PERSIST";
opNames[OPCODE_POP] = "POP";
opNames[OPCODE_DEFINE_GLOBAL_VAR] = "DEFINE_GLOBAL_VAR";
opNames[OPCODE_DEFINE_LOCAL_VAR] = "DEFINE_LOCAL_VAR";
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

export class IndexRange
{
  constructor(startIndex, endIndex = startIndex)
  {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  }

  isInRange(index)
  //Return true if the given index is within the index range, or false otherwise
  {
    return ((index >= this.startIndex) && (index <= this.endIndex));
  }
}
