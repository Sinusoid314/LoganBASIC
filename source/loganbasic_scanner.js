var keywordList = {
                   "true": TOKEN_TRUE,
                   "false": TOKEN_FALSE,
                   "not": TOKEN_NOT,
                   "or": TOKEN_OR,
                   "and": TOKEN_AND,
                   "print": TOKEN_PRINT,
                   "input": TOKEN_INPUT,
                   "if": TOKEN_IF,
                   "then": TOKEN_THEN,
                   "else": TOKEN_ELSE,
                   "end": TOKEN_END,
                   "while": TOKEN_WHILE,
                   "wend": TOKEN_WEND,
                   "for": TOKEN_FOR,
                   "to": TOKEN_TO,
                   "step": TOKEN_STEP,
                   "next": TOKEN_NEXT
                  }

class Scanner
{
  constructor(sourceStr)
  {
    this.sourceStr = sourceStr;
    this.tokenList = [];
    this.startCharIndex = 0;
    this.currCharIndex = 0;
    this.currLineNum = 1;
    this.errorMsg = "";
  }

  scan()
  //
  {
	try
	{
      while(!this.endOfSource())
      {
        this.startCharIndex = this.currCharIndex;
        this.scanToken();
      }
    }
    catch(errorObj)
    {
      this.errorMsg = "Compile error on line " + this.currLineNum + ": " + errorObj.message;
    }

    this.tokenList.push(new Token(TOKEN_EOF, "EOF", undefined, this.currLineNum));
    return this.tokenList;
  }

  scanToken()
  //
  {
    var firstChar = this.consumeChar();

    switch(firstChar)
    {
      case ' ':
      case '\r':
      case '\t':
        break;

      case "'":
        while((this.peekChar() != '\n') && (!this.endOfSource()))
        {
          this.consumeChar();
        }
        break;

      case '\n':
        if(this.tokenList.length > 0)
        {
          if(this.tokenList[this.tokenList.length - 1].type == TOKEN_UNDERSCORE)
          {
            this.tokenList.pop();
          }
          else
          {
            if(this.tokenList[this.tokenList.length - 1].type != TOKEN_NEWLINE)
            {
              this.addToken(TOKEN_NEWLINE);
            }
          }
        }
        this.currLineNum++;
        break;

      case ':':
        if(this.tokenList.length > 0)
        {
          if(this.tokenList[this.tokenList.length - 1].type != TOKEN_COLON)
          {
            this.addToken(TOKEN_COLON);
          }
        }
        break;

      case '_':
        this.addToken(TOKEN_UNDERSCORE);
        break;

      case '(':
        this.addToken(TOKEN_LEFT_PAREN);
        break;

      case ')':
        this.addToken(TOKEN_RIGHT_PAREN);
        break;

      case ',':
        this.addToken(TOKEN_COMMA);
        break;

      case '-':
        this.addToken(TOKEN_MINUS);
        break;

      case '+':
        this.addToken(TOKEN_PLUS);
        break;

      case '/':
        this.addToken(TOKEN_SLASH);
        break;

      case '*':
        this.addToken(TOKEN_STAR);
        break;

      case '%':
        this.addToken(TOKEN_PERCENT);
        break;

      case '=':
        this.addToken(TOKEN_EQUAL);
        break;

      case '>':
        this.addToken(this.matchChar('=') ? TOKEN_GREATER_EQUAL : TOKEN_GREATER);
        break;

      case '<':
        this.addToken(this.matchChar('=') ? TOKEN_LESS_EQUAL
                                          : (this.matchChar('>') ? TOKEN_NOT_EQUAL : TOKEN_LESS));
        break;

      case '"':
        this.consumeStringLiteral();
        break;

      default:
        if(this.isDigit(firstChar))
        {
          this.consumeNumberLiteral();
        }
        else if(this.isAlpha(firstChar))
        {
          this.consumeIdentifier();
        }
        else
        {
          throw {message: "Unrecognized character: '" + firstChar + "'"};
        }
        break;
    }
  }

  addToken(type, literalVal)
  //
  {
    var lexemeStr = this.sourceStr.substring(this.startCharIndex, this.currCharIndex);
    this.tokenList.push(new Token(type, lexemeStr, literalVal, this.currLineNum));
  }

  consumeChar()
  //
  {
    return this.sourceStr.charAt(this.currCharIndex++);
  }

  matchChar(expectedChar)
  //
  {
    if(this.endOfSource())
	  return false;

    if(this.sourceStr.charAt(this.currCharIndex) != expectedChar)
	  return false;

    this.currCharIndex++;
    return true;
  }

  peekChar()
  //
  {
    if(this.endOfSource())
      return '\0';

    return this.sourceStr.charAt(this.currCharIndex);
  }

  peekNextChar()
  //
  {
    if((this.currCharIndex + 1) >= this.sourceStr.length)
      return '\0';

    return this.sourceStr.charAt(this.currCharIndex + 1);
  }

  endOfSource()
  //
  {
    return (this.currCharIndex >= this.sourceStr.length);
  }

  consumeStringLiteral()
  //
  {
    var literalVal;

    while((this.peekChar() != '"') && (this.peekChar() != '\n') && !this.endOfSource())
    {
      this.consumeChar();
    }

    if((this.peekChar() == '\n') || this.endOfSource())
      throw {message: "Unterminated string."};

    this.consumeChar();

    literalVal = this.sourceStr.substring(this.startCharIndex + 1, this.currCharIndex - 1);
    this.addToken(TOKEN_STRING_LIT, literalVal);
  }

  consumeNumberLiteral()
  //
  {
    var literalVal;

    while(this.isDigit(this.peekChar()))
    {
      this.consumeChar();
    }

    if((this.peekChar() == '.') && this.isDigit(this.peekNextChar()))
    {
      this.consumeChar();
      while(this.isDigit(this.peekChar()))
      {
        this.consumeChar();
      }
    }

    literalVal = Number(this.sourceStr.substring(this.startCharIndex, this.currCharIndex));
    this.addToken(TOKEN_NUMBER_LIT, literalVal);
  }

  consumeIdentifier()
  //
  {
    var lexemeStr;
    var tokenType;

    while(this.isAlphaNumeric(this.peekChar()))
    {
      this.consumeChar();
    }

    lexemeStr = this.sourceStr.substring(this.startCharIndex, this.currCharIndex).toLowerCase();
    if(keywordList.hasOwnProperty(lexemeStr))
    {
      tokenType = keywordList[lexemeStr];
    }
    else
    {
      tokenType = TOKEN_IDENTIFIER;
    }
    this.addToken(tokenType);
  }

  isAlpha(testChar)
  //
  {
    return /^[A-Za-z]$/.test(testChar);
  }

  isDigit(testChar)
  //
  {
    return /^[0-9]$/.test(testChar);
  }

  isAlphaNumeric(testChar)
  //
  {
    return (this.isAlpha(testChar) || this.isDigit(testChar));
  }
}
