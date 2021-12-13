//Token types
const TOKEN_ERROR = 0;
const TOKEN_EOF = 1;
const TOKEN_NEWLINE = 2;
const TOKEN_COLON = 3;
const TOKEN_UNDERSCORE = 4;
const TOKEN_LEFT_PAREN = 5;
const TOKEN_RIGHT_PAREN = 6;
const TOKEN_LEFT_BRACKET = 7;
const TOKEN_RIGHT_BRACKET = 8;
const TOKEN_COMMA = 9;
const TOKEN_DOT = 10;

const TOKEN_MINUS = 11;
const TOKEN_PLUS = 12;
const TOKEN_SLASH = 13;
const TOKEN_STAR = 14;
const TOKEN_PERCENT = 15;

const TOKEN_EQUAL = 16;
const TOKEN_NOT_EQUAL = 17;
const TOKEN_GREATER = 18;
const TOKEN_GREATER_EQUAL = 19;
const TOKEN_LESS = 20;
const TOKEN_LESS_EQUAL = 21;
const TOKEN_NOT = 22;
const TOKEN_OR = 23;
const TOKEN_AND = 24;
const TOKEN_CARET = 25;

const TOKEN_TRUE = 30;
const TOKEN_FALSE = 31;
const TOKEN_STRING_LIT = 32;
const TOKEN_NUMBER_LIT = 33;
const TOKEN_IDENTIFIER = 34;

const TOKEN_VAR = 40;
const TOKEN_ARRAY = 41;
const TOKEN_PRINT = 42;
const TOKEN_IF = 43;
const TOKEN_THEN = 44;
const TOKEN_ELSE = 45;
const TOKEN_END = 46;
const TOKEN_WHILE = 47;
const TOKEN_WEND = 48;
const TOKEN_FOR = 49;
const TOKEN_TO = 50;
const TOKEN_STEP = 51;
const TOKEN_NEXT = 52;
const TOKEN_REDIM = 53;
const TOKEN_CLS = 54;
const TOKEN_DO = 55;
const TOKEN_LOOP = 56;
const TOKEN_EXIT = 57;
const TOKEN_FUNCTION = 58;
const TOKEN_RETURN = 59;
const TOKEN_WAIT = 60;
const TOKEN_STRUCTURE = 61;
const TOKEN_NEW = 62;

class Token
{
  constructor(type, lexeme, literal, lineNum)
  {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.lineNum = lineNum;
  }

  toString()
  //Return the token info as a string
  {
    return this.lineNum + " " + this.lexeme + " " + this.type + " " + this.literal;
  }
}
