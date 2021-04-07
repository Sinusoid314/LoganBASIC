var keywordList = {
                   'print': TOKEN_PRINT
                  }

class Lexer
{
  constructor(sourceStr)
  {
    this.sourceStr = sourceStr;
    this.tokenList = [];
    this.startIndex = 0;
    this.currIndex = 0;
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
        this.startIndex = this.currIndex;
        this.scanToken();
      }
    }
    catch(errorObj)
    {
      this.errorMsg = "Scan error on line " + this.currLineNum + ": " + errorObj.message;
    }

    this.tokenList.push(new Token(TOKEN_EOS, "EOS", undefined, this.currLineNum));
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
        while((peekChar() != '\n') && (!endOfSource()))
        {
          this.consumeChar();
        }
        break;

      case '\n':
        this.addToken(TOKEN_NEWLINE);
        this.currLineNum++;
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

      case '=':
        this.addToken(TOKEN_EQUAL);
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
          throw {message: "Unrecognized character: " + firstChar};
        }
        break;
    }
  }

  addToken(type, literalVal)
  //
  {
    var lexemeStr = this.sourceStr.substring(this.startIndex, this.currIndex);
    this.tokenList.push(new Token(type, lexemeStr, literalVal, this.currLineNum));
  }

  consumeChar()
  //
  {
    return this.sourceStr.charAt(this.currIndex++);
  }

  matchChar(expectedChar)
  //
  {
    if(this.endOfSource())
    {
	  return false;
    }

    if(this.sourceStr.charAt(this.currIndex) != expectedChar)
    {
	  return false;
    }

    this.currIndex++;
    return true;
  }

  peekChar()
  //
  {
    if(this.endOfSource())
    {
      return '\0';
    }
    return this.sourceStr.charAt(this.currIndex);
  }

  peekNextChar()
  //
  {
    if((this.currIndex + 1) >= this.sourceStr.length)
    {
      return '\0';
    }
    return this.sourceStr.charAt(this.currIndex + 1);
  }

  endOfSource()
  //
  {
    return (this.currIndex >= this.sourceStr.length);
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
    {
      throw {message: "Unterminated string."};
    }

    this.consumeChar();

    literalVal = this.sourceStr.substring(this.startIndex + 1, this.currIndex - 1);
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

    literalVal = Number(this.sourceStr.substring(this.startIndex, this.currIndex));
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

    lexemeStr = this.sourceStr.substring(this.startIndex, this.currIndex);
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
