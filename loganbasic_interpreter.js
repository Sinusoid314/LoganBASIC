class Interpreter
{
  constructor(tokenList)
  {
    this.tokenList = tokenList;
    this.currTokenIndex = 0;
    this.errorMsg = "";
  }

  run()
  //
  {

  }

  consumeToken()
  //
  {
    if(!this.endOfTokens())
    {
      this.currTokenIndex++;
    }

    return this.prevToken();
  }

  matchTokenTypes(tokenTypeList)
  //
  {
    for(index = 0; index <= tokenTypeList.length; index++)
    {
      if(this.checkTokenType(tokenTypeList[index]))
      {
        this.consumeToken();
        return true;
      }
    }

    return false;
  }

  checkTokenType(tokenType)
  //
  {
    if(this.endOfTokens())
    {
      return false;
    }

    return (this.peekToken().type == tokenType))
  }

  endOfTokens()
  //
  {
    return (this.peekToken().type == TOKEN_EOF)
  }

  peekToken()
  //
  {
    return this.tokenList[this.currTokenIndex];
  }

  prevToken()
  //
  {
    return this.tokenList[this.currTokenIndex - 1];
  }
}
