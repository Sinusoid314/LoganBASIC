var keywordList = {
                   "true": TOKEN_TRUE,
                   "false": TOKEN_FALSE,
                   "not": TOKEN_NOT,
                   "or": TOKEN_OR,
                   "and": TOKEN_AND,
                   "var": TOKEN_VAR,
                   "array": TOKEN_ARRAY,
                   "print": TOKEN_PRINT,
                   "if": TOKEN_IF,
                   "then": TOKEN_THEN,
                   "else": TOKEN_ELSE,
                   "end": TOKEN_END,
                   "while": TOKEN_WHILE,
                   "wend": TOKEN_WEND,
                   "for": TOKEN_FOR,
                   "to": TOKEN_TO,
                   "step": TOKEN_STEP,
                   "next": TOKEN_NEXT,
                   "redim": TOKEN_REDIM,
                   "cls": TOKEN_CLS,
                   "do": TOKEN_DO,
                   "loop": TOKEN_LOOP,
                   "exit": TOKEN_EXIT
                  }

class Scanner
{
  constructor(sourceStr)
  {
    this.sourceStr = sourceStr;
    this.startCharIndex = 0;
    this.currCharIndex = 0;
    this.currLineNum = 1;
  }

  scanToken()
  //Read and return the next token from the source code
  {
    var firstChar;

    this.skipWhitespace();
    this.startCharIndex = this.currCharIndex;

    if(this.endOfSource())
      return this.makeToken(TOKEN_EOF);

    firstChar = this.consumeChar();

    switch(firstChar)
    {
      case '\n':
        this.currLineNum++;
        return this.makeToken(TOKEN_NEWLINE);

      case ':':
        return this.makeToken(TOKEN_COLON);

      case '_':
        return this.makeToken(TOKEN_UNDERSCORE);

      case '(':
        return this.makeToken(TOKEN_LEFT_PAREN);

      case ')':
        return this.makeToken(TOKEN_RIGHT_PAREN);

      case '[':
        return this.makeToken(TOKEN_LEFT_BRACKET);

      case ']':
        return this.makeToken(TOKEN_RIGHT_BRACKET);

      case ',':
        return this.makeToken(TOKEN_COMMA);

      case '-':
        return this.makeToken(TOKEN_MINUS);

      case '+':
        return this.makeToken(TOKEN_PLUS);

      case '/':
        return this.makeToken(TOKEN_SLASH);

      case '*':
        return this.makeToken(TOKEN_STAR);

      case '%':
        return this.makeToken(TOKEN_PERCENT);

      case '=':
        return this.makeToken(TOKEN_EQUAL);

      case '^':
        return this.makeToken(TOKEN_CARET);

      case '>':
        return this.makeToken(this.matchChar('=') ? TOKEN_GREATER_EQUAL : TOKEN_GREATER);

      case '<':
        return this.makeToken(this.matchChar('=') ? TOKEN_LESS_EQUAL
                                          : (this.matchChar('>') ? TOKEN_NOT_EQUAL : TOKEN_LESS));

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

  makeToken(type, literalVal)
  //Create and return a new token
  {
    var lexemeStr = this.sourceStr.substring(this.startCharIndex, this.currCharIndex);
    return new Token(type, lexemeStr, literalVal, this.currLineNum);
  }

  makeErrorToken(errorMsg)
  //Create and return an error token
  {
    return new Token(TOKEN_ERROR, errorMsg, undefined, this.currLineNum);
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

  consumeStringLiteral()
  //Read and return a string literal token
  {
    var literalVal;

    while((this.peekChar() != '"') && (this.peekChar() != '\n') && !this.endOfSource())
      this.consumeChar();

    if((this.peekChar() == '\n') || this.endOfSource())
      return this.makeErrorToken("Unterminated string.");

    this.consumeChar();

    literalVal = this.sourceStr.substring(this.startCharIndex + 1, this.currCharIndex - 1);
    return this.makeToken(TOKEN_STRING_LIT, literalVal);
  }

  consumeNumberLiteral()
  //Read and return a number literal token
  {
    var literalVal;

    while(this.isDigit(this.peekChar()))
      this.consumeChar();

    if((this.peekChar() == '.') && this.isDigit(this.peekNextChar()))
    {
      this.consumeChar();
      while(this.isDigit(this.peekChar()))
        this.consumeChar();
    }

    literalVal = Number(this.sourceStr.substring(this.startCharIndex, this.currCharIndex));
    return this.makeToken(TOKEN_NUMBER_LIT, literalVal);
  }

  consumeIdentifier()
  //Read and return an identifier token
  {
    var lexemeStr;
    var tokenType;

    while(this.isAlphaNumeric(this.peekChar()))
      this.consumeChar();

    lexemeStr = this.sourceStr.substring(this.startCharIndex, this.currCharIndex).toLowerCase();

    if(keywordList.hasOwnProperty(lexemeStr))
      tokenType = keywordList[lexemeStr];
    else
      tokenType = TOKEN_IDENTIFIER;

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
    return this.sourceStr.charAt(this.currCharIndex++);
  }

  matchChar(expectedChar)
  //Return true and advance to the next character if the current character matches the given one
  {
    if(this.endOfSource())
	  return false;

    if(this.sourceStr.charAt(this.currCharIndex) != expectedChar)
	  return false;

    this.currCharIndex++;
    return true;
  }

  peekChar()
  //Return the current character
  {
    if(this.endOfSource())
      return '\0';

    return this.sourceStr.charAt(this.currCharIndex);
  }

  peekNextChar()
  //Return the character after the current character
  {
    if((this.currCharIndex + 1) >= this.sourceStr.length)
      return '\0';

    return this.sourceStr.charAt(this.currCharIndex + 1);
  }

  endOfSource()
  //Return true if the current character index is past the end of the source string
  {
    return (this.currCharIndex >= this.sourceStr.length);
  }
}
