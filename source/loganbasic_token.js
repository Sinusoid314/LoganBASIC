//Token types
const TOKEN_EOF = 1;
const TOKEN_NEWLINE = 2;
const TOKEN_LEFT_PAREN = 3;
const TOKEN_RIGHT_PAREN = 4;
const TOKEN_MINUS = 10;
const TOKEN_PLUS = 11;
const TOKEN_SLASH = 12;
const TOKEN_STAR = 13;
const TOKEN_EQUAL = 14;
const TOKEN_STRING_LIT = 30;
const TOKEN_NUMBER_LIT = 31;
const TOKEN_IDENTIFIER = 32;
const TOKEN_PRINT = 40;
const TOKEN_INPUT = 41;

class Token
{
  constructor(type, lexemeStr, literalVal, lineNum)
  {
    this.type = type;
    this.lexemeStr = lexemeStr;
    this.literalVal = literalVal;
    this.lineNum = lineNum;
  }

  toString()
  {
    return this.lineNum + " " + this.lexemeStr + " " + this.type + " " + this.literalVal;
  }
}
