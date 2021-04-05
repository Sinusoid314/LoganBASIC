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
  {
    while(!this.endOfSource())
    {
      this.startIndex = this.currIndex;
      this.scanToken();
    }

    this.tokenList.push(new Token(TOKEN_EOF, "", undefined, this.currLineNum));
    return this.tokenList;
  }

  scanToken()
  {
  }

  addToken(type, literalVal)
  {
    var lexemeStr = this.sourceStr.substring(this.startIndex, this.currIndex);
    this.tokenList.push(new Token(type, lexemeStr, literalVal, this.currLineNum));
  }

  consumeChar()
  {
    return this.sourceStr.charAt(this.currIndex++);
  }

  matchChar(expectedChar)
  {
    if(this.endOfSource())
	  return false;

    if(this.sourceStr.charAt(this.currIndex) != expectedChar)
	  return false;

    this.currIndex++;
    return true;
  }

  peekChar()
  {
    if(this.endOfSource())
      return '\0';
    return this.sourceStr.charAt(this.currIndex);
  }

  peekNextChar()
  {
    if((this.currIndex + 1) >= this.sourceStr.length)
      return '\0';
    return this.sourceStr.charAt(this.currIndex + 1);
  }

  endOfSource()
  {
    return (this.currIndex >= this.sourceStr.length);
  }

  consumeStringLiteral()
  {
  }

  consumeNumberLiteral()
  {
  }

  consumeIdentifier()
  {
  }

  isAlpha(testChar)
  {
    return /^[A-Za-z]$/.test(testChar);
  }

  isDigit(testChar)
  {
    return /^[0-9]$/.test(testChar);
  }

  isAlphaNumeric(testChar)
  {
    return (this.isAlpha(testChar) || this.isDigit(testChar));
  }
}
