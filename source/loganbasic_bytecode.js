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

const OPCODE_NEGATE = 11;
const OPCODE_NOT = 12;
const OPCODE_EQUAL = 13;
const OPCODE_GREATER = 14;
const OPCODE_LESS = 15;

const OPCODE_PRINT = 16;
const OPCODE_INPUT = 17;

class Bytecode
{
  constructor()
  {
    this.literalList = [];
    this.varIdentList = [];
    this.opList = [];
  }
}
