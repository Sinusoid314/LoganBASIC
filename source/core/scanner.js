import * as token from "./token.js";


export class Scanner
{
  constructor(source)
  {
    this.source = source;
    this.startCharIndex = 0;
    this.currCharIndex = 0;
    this.currLineNum = 1;
  }

  scanToken()
  //Read and return the next token from the source code
  {
    var firstChar, token;

    this.skipWhitespace();

    if(!this.skipLineJoiner())
      return this.makeErrorToken("Expected new line after '_'");

    this.startCharIndex = this.currCharIndex;

    if(this.endOfSource())
      return this.makeEOFToken();

    firstChar = this.consumeChar();

    switch(firstChar)
    {
      case '\n':
        return this.consumeNewLines();

      case ':':
        return this.makeToken(token.TOKEN_COLON);

      case '_':
        return this.makeToken(token.TOKEN_UNDERSCORE);

      case '(':
        return this.makeToken(token.TOKEN_LEFT_PAREN);

      case ')':
        return this.makeToken(token.TOKEN_RIGHT_PAREN);

      case '[':
        return this.makeToken(token.TOKEN_LEFT_BRACKET);

      case ']':
        return this.makeToken(token.TOKEN_RIGHT_BRACKET);

      case ',':
        return this.makeToken(token.TOKEN_COMMA);

      case '.':
        return this.makeToken(token.TOKEN_DOT);

      case '-':
        return this.makeToken(token.TOKEN_MINUS);

      case '+':
        return this.makeToken(token.TOKEN_PLUS);

      case '/':
        return this.makeToken(token.TOKEN_SLASH);

      case '*':
        return this.makeToken(token.TOKEN_STAR);

      case '%':
        return this.makeToken(token.TOKEN_PERCENT);

      case '=':
        return this.makeToken(token.TOKEN_EQUAL);

      case '^':
        return this.makeToken(token.TOKEN_CARET);

      case '>':
        return this.makeToken(this.matchChar('=') ? token.TOKEN_GREATER_EQUAL : token.TOKEN_GREATER);

      case '<':
        return this.makeToken(this.matchChar('=') ? token.TOKEN_LESS_EQUAL
                                          : (this.matchChar('>') ? token.TOKEN_NOT_EQUAL : token.TOKEN_LESS));

      case '"':
        return this.consumeStringLiteral();

      default:
        if(this.isDigit(firstChar))
          return this.consumeNumberLiteral();
        else if(this.isAlpha(firstChar))
          return this.consumeIdentifier();
        else
          return this.makeErrorToken("Unrecognized character: '" + firstChar + "'");
    }
  }

  makeToken(type, literal)
  //Create and return a new token
  {
    var lexeme = this.source.substring(this.startCharIndex, this.currCharIndex);
    return new token.Token(type, lexeme, literal, this.currLineNum);
  }

  makeErrorToken(errorMsg)
  //Create and return an error token
  {
    return new token.Token(token.TOKEN_ERROR, errorMsg, undefined, this.currLineNum);
  }

  makeEOFToken()
  //Create and return an EOF token
  {
    return new token.Token(token.TOKEN_EOF, "EOF", undefined, this.currLineNum);
  }

  skipWhitespace()
  //Skip over any valid characters that do not belong in a token
  {
    var tmpChar;

    while(true)
    {
      tmpChar = this.peekChar();
      switch(tmpChar)
      {
        case ' ':
        case '\r':
        case '\t':
          this.consumeChar();
          break;

        case "'":
          while((this.peekChar() != '\n') && (!this.endOfSource()))
            this.consumeChar();
          break;

        default:
          return;
      }
    }
  }

  skipLineJoiner()
  //
  {
    if(!this.matchChar('_'))
      return true;

    this.skipWhitespace();

    if(!this.matchChar('\n'))
      return false;

    this.currLineNum++;
    return true;
  }

  consumeNewLines()
  //
  {
    var token = this.makeToken(token.TOKEN_NEWLINE);

    do
    {
      this.currLineNum++;
      this.skipWhitespace();
    }
    while(this.matchChar('\n'))

    return token;
  }

  consumeStringLiteral()
  //Read and return a string literal token
  {
    var literal;

    while((this.peekChar() != '"') && (this.peekChar() != '\n') && !this.endOfSource())
      this.consumeChar();

    if((this.peekChar() == '\n') || this.endOfSource())
      return this.makeErrorToken("Unterminated string.");

    this.consumeChar();

    literal = this.source.substring(this.startCharIndex + 1, this.currCharIndex - 1);
    return this.makeToken(token.TOKEN_STRING_LIT, literal);
  }

  consumeNumberLiteral()
  //Read and return a number literal token
  {
    var literal;

    while(this.isDigit(this.peekChar()))
      this.consumeChar();

    if((this.peekChar() == '.') && this.isDigit(this.peekNextChar()))
    {
      this.consumeChar();
      while(this.isDigit(this.peekChar()))
        this.consumeChar();
    }

    literal = Number(this.source.substring(this.startCharIndex, this.currCharIndex));
    return this.makeToken(token.TOKEN_NUMBER_LIT, literal);
  }

  consumeIdentifier()
  //Read and return an identifier token
  {
    var lexeme;
    var tokenType;

    while(this.isAlphaNumeric(this.peekChar()))
      this.consumeChar();

    lexeme = this.source.substring(this.startCharIndex, this.currCharIndex).toLowerCase();

    if(keywordList.hasOwnProperty(lexeme))
      tokenType = keywordList[lexeme];
    else
      tokenType = token.TOKEN_IDENTIFIER;

    return this.makeToken(tokenType);
  }

  isAlpha(testChar)
  //Return true if the given character is a letter
  {
    return /^[A-Za-z]$/.test(testChar);
  }

  isDigit(testChar)
  //Return true if the given character is a number
  {
    return /^[0-9]$/.test(testChar);
  }

  isAlphaNumeric(testChar)
  //Return true if the given character is a letter or number
  {
    return (this.isAlpha(testChar) || this.isDigit(testChar));
  }

  consumeChar()
  //Return the current character and advance to the next character
  {
    return this.source.charAt(this.currCharIndex++);
  }

  matchChar(expectedChar)
  //Return true and advance to the next character if the current character matches the given one
  {
    if(this.endOfSource())
      return false;

    if(this.source.charAt(this.currCharIndex) != expectedChar)
      return false;

    this.currCharIndex++;
    return true;
  }

  peekChar()
  //Return the current character
  {
    if(this.endOfSource())
      return '\0';

    return this.source.charAt(this.currCharIndex);
  }

  peekNextChar()
  //Return the character after the current character
  {
    if((this.currCharIndex + 1) >= this.source.length)
      return '\0';

    return this.source.charAt(this.currCharIndex + 1);
  }

  endOfSource()
  //Return true if the current character index is past the end of the source string
  {
    return (this.currCharIndex >= this.source.length);
  }
}


const keywordList = {
                   "nothing": token.TOKEN_NOTHING,
                   "true": token.TOKEN_TRUE,
                   "false": token.TOKEN_FALSE,
                   "not": token.TOKEN_NOT,
                   "or": token.TOKEN_OR,
                   "and": token.TOKEN_AND,
                   "var": token.TOKEN_VAR,
                   "array": token.TOKEN_ARRAY,
                   "print": token.TOKEN_PRINT,
                   "if": token.TOKEN_IF,
                   "then": token.TOKEN_THEN,
                   "else": token.TOKEN_ELSE,
                   "end": token.TOKEN_END,
                   "while": token.TOKEN_WHILE,
                   "wend": token.TOKEN_WEND,
                   "for": token.TOKEN_FOR,
                   "to": token.TOKEN_TO,
                   "step": token.TOKEN_STEP,
                   "next": token.TOKEN_NEXT,
                   "redim": token.TOKEN_REDIM,
                   "cls": token.TOKEN_CLS,
                   "whterbtobj": token.TOKEN_WHTERBTOBJ,
                   "do": token.TOKEN_DO,
                   "loop": token.TOKEN_LOOP,
                   "exit": token.TOKEN_EXIT,
                   "function": token.TOKEN_FUNCTION,
                   "return": token.TOKEN_RETURN,
                   "wait": token.TOKEN_WAIT,
                   "structure": token.TOKEN_STRUCTURE,
                   "new": token.TOKEN_NEW
                  };
