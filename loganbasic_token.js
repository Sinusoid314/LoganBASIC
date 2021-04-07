//Token types
const TOKEN_NEWLINE = 1;
const TOKEN_MINUS = 2;
const TOKEN_PLUS = 3;
const TOKEN_SLASH = 4;
const TOKEN_STAR = 5;
const TOKEN_EQUAL = 6;
const TOKEN_SINGLE_QUOTE = 7;
const TOKEN_STRING_LIT = 30;
const TOKEN_NUMBER_LIT = 31;
const TOKEN_IDENTIFIER = 32;
const TOKEN_PRINT = 40;
const TOKEN_EOS = 100;

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
