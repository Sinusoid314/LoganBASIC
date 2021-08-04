//Opcodes
const OPCODE_LOAD_TRUE = 1;
const OPCODE_LOAD_FALSE = 2;
const OPCODE_LOAD_LIT = 3;
const OPCODE_LOAD_VAR = 4;
const OPCODE_STORE_VAR = 5;
const OPCODE_POP = 6;

const OPCODE_SUB = 7;
const OPCODE_ADD = 8;
const OPCODE_DIV = 9;
const OPCODE_MUL = 10;
const OPCODE_MOD = 11;

const OPCODE_NEGATE = 12;
const OPCODE_NOT = 13;
const OPCODE_EQUAL = 14;
const OPCODE_GREATER = 15;
const OPCODE_LESS = 16;
const OPCODE_POW = 17;

const OPCODE_PRINT = 18;
const OPCODE_JUMP = 19;
const OPCODE_JUMP_IF_FALSE = 20;
const OPCODE_JUMP_IF_FALSE_PERSIST = 21;
const OPCODE_JUMP_IF_TRUE = 22;
const OPCODE_JUMP_IF_TRUE_PERSIST = 23;
const OPCODE_END = 24;
const OPCODE_CALL_NATIVE_FUNC = 25;
const OPCODE_CREATE_ARRAY = 26;
const OPCODE_REDIM_ARRAY = 27;
const OPCODE_LOAD_ARRAY_ITEM = 28;
const OPCODE_STORE_ARRAY_ITEM = 29;
const OPCODE_CLS = 30;
const OPCODE_CHECK_COUNTER = 31;

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
