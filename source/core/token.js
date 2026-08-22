//Token types
export const TOKEN_ERROR = 0;
export const TOKEN_EOF = 1;
export const TOKEN_NEWLINE = 2;
export const TOKEN_COLON = 3;
export const TOKEN_UNDERSCORE = 4;
export const TOKEN_LEFT_PAREN = 5;
export const TOKEN_RIGHT_PAREN = 6;
export const TOKEN_LEFT_BRACKET = 7;
export const TOKEN_RIGHT_BRACKET = 8;
export const TOKEN_COMMA = 9;
export const TOKEN_DOT = 10;

export const TOKEN_MINUS = 11;
export const TOKEN_PLUS = 12;
export const TOKEN_SLASH = 13;
export const TOKEN_STAR = 14;
export const TOKEN_PERCENT = 15;

export const TOKEN_EQUAL = 16;
export const TOKEN_NOT_EQUAL = 17;
export const TOKEN_GREATER = 18;
export const TOKEN_GREATER_EQUAL = 19;
export const TOKEN_LESS = 20;
export const TOKEN_LESS_EQUAL = 21;
export const TOKEN_NOT = 22;
export const TOKEN_OR = 23;
export const TOKEN_AND = 24;
export const TOKEN_CARET = 25;

export const TOKEN_NOTHING = 30;
export const TOKEN_TRUE = 31;
export const TOKEN_FALSE = 32;
export const TOKEN_STRING_LIT = 33;
export const TOKEN_NUMBER_LIT = 34;
export const TOKEN_IDENTIFIER = 35;

export const TOKEN_VAR = 40;
export const TOKEN_ARRAY = 41;
export const TOKEN_PRINT = 42;
export const TOKEN_IF = 43;
export const TOKEN_THEN = 44;
export const TOKEN_ELSE = 45;
export const TOKEN_END = 46;
export const TOKEN_WHILE = 47;
export const TOKEN_WEND = 48;
export const TOKEN_FOR = 49;
export const TOKEN_TO = 50;
export const TOKEN_STEP = 51;
export const TOKEN_NEXT = 52;
export const TOKEN_REDIM = 53;
export const TOKEN_CLS = 54;
export const TOKEN_WHTERBTOBJ = 55;
export const TOKEN_DO = 56;
export const TOKEN_LOOP = 57;
export const TOKEN_EXIT = 58;
export const TOKEN_FUNCTION = 59;
export const TOKEN_RETURN = 60;
export const TOKEN_WAIT = 61;
export const TOKEN_STRUCTURE = 62;
export const TOKEN_NEW = 63;

export class Token
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
