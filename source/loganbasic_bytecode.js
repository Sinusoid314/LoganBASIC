//OpCodes
const OPCODE_PUSH_FROM_VAR = 1;
const OPCODE_PUSH_FROM_LIT = 2;
const OPCODE_POP_TO_VAR = 3;
const OPCODE_POP = 4;
const OPCODE_SUB = 5;
const OPCODE_ADD = 6;
const OPCODE_DIV = 7;
const OPCODE_MUL = 8;
const OPCODE_NEGATE = 9;
const OPCODE_PRINT = 10;

class Bytecode
{
  constructor()
  {
    this.literalList = [];
    this.varIdentList = [];
    this.opList = [];
  }
}