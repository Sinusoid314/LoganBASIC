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
  }

  scan()
  {
  }

  scanToken()
  {
  }

  addToken(type, literalVal)
  {
    var lexemeStr = this.sourceStr.substring(startIndex, currIndex);
    this.tokenList.push(new Token(type, lexemeStr, literalVal, currLineNum));
  }

  consumeChar()
  {
    return sourceStr.charAt(currIndex++);
  }

  matchChar(expectedChar)
  {
  }

  peekChar()
  {
  }

  peekNextChar()
  {
  }

  endOfSource()
  {
    return (currIndex >= sourceStr.length);
  }

  consumeStringLiteral()
  {
  }

  consumeNumberLiteral()
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
    return (isAlpha(testChar) || isDigit(testChar));
  }
}
