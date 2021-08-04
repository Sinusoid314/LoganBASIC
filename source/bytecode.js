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

class Bytecode
{
  constructor()
  {
    this.nativeFuncList = [];
    this.literalList = [];
    this.varIdentList = [];
    this.opList = [];
  }
}
