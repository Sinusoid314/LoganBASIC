//Token types
const TOKEN_MINUS = 1;
const TOKEN_PLUS = 2;
const TOKEN_SLASH = 3;
const TOKEN_STAR = 4;
const TOKEN_EQUAL = 5;
const TOKEN_SINGLE_QUOTE = 6
const TOKEN_IDENTIFIER = 7;
const TOKEN_STRING_LIT = 8;
const TOKEN_NUMBER_LIT = 9;
const TOKEN_PRINT = 10;
const TOKEN_NEWLINE = 11;
const TOKEN_EOF = 12;

class Token
{
  constructor(type, lexemeStr, literalVal, lineNum)
  {
    this.type = type;
    this.lexemeStr = lexemeStr;
    this.literalVal = literalVal;
    this.lineNum = lineNum;
  }
}
