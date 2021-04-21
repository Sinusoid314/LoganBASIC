//Opcodes
const OPCODE_LOAD_VAR = 1;
const OPCODE_LOAD_LIT = 2;
const OPCODE_STORE_VAR = 3;
const OPCODE_POP = 4;
const OPCODE_SUB = 5;
const OPCODE_ADD = 6;
const OPCODE_DIV = 7;
const OPCODE_MUL = 8;
const OPCODE_NEGATE = 9;
const OPCODE_PRINT = 10;
const OPCODE_INPUT = 11;

class Bytecode
{
  constructor()
  {
    this.literalList = [];
    this.varIdentList = [];
    this.opList = [];
  }
}
