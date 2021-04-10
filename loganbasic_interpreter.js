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
	try
	{

    }
    catch(errorObj)
    {
      this.errorMsg = "Runtime error on line " + this.peekToken().lineNum + ": " + errorObj.message;
    }
  }

  runStatement()
  //
  {

  }

  printStmt
  //
  {

  }

  assignmentStmt()
  //
  {

  }

  evalExpression()
  //
  {
    return termExpr();
  }

  termExpr()
  //
  {
    var firstVal, secondVal, operatorToken;

    firstVal = this.factorExpr();

    while(this.matchTokenTypes([TOKEN_MINUS, TOKEN_PLUS]))
    {
      operatorToken = this.prevToken();
      secondVal = this.factorExpr();
      firstVal = this.evalOperation(operatorToken, firstVal, secondVal);
    }

    return firstVal;
  }

  factorExpr()
  //
  {
    var firstVal, secondVal, operatorToken;

    firstVal = this.unaryExpr();

    while(this.matchTokenTypes([TOKEN_SLASH, TOKEN_STAR]))
    {
      operatorToken = this.prevToken();
      secondVal = this.unaryExpr();
      firstVal = this.evalOperation(operatorToken, firstVal, secondVal);
    }

    return firstVal;
  }

  unaryExpr()
  //
  {
    var val, operatorToken;

    if(this.matchTokenTypes([TOKEN_MINUS]))
    {
      operatorToken = this.prevToken();
      val = this.unaryExpr();
      return this.evalOperation(operatorToken, val);
    }

    return this.primaryExpr();
  }

  primaryExpr()
  //
  {
    var val;

    //Literals
    if(this.matchTokenTypes([TOKEN_STRING_LIT, TOKEN_NUMBER_LIT]))
    {
      return this.prevToken().literalVal;
    }

    //Nested expression
    if(this.matchTokenTypes([TOKEN_LEFT_PAREN]))
    {
      val = this.evalExpression();
      if(this.checkTokenType(TOKEN_RIGHT_PAREN))
      {
		this.consumeToken();
        return val;
      }
      else
      {
        throw {message: "Expected ')' after expression."};
      }
    }
  }

  evalOperation(operatorToken, firstVal, secondVal)
  //
  {
    switch(operatorToken)
    {
      case TOKEN_MINUS:
        if(secondVal == undefined)
        {
          return -firstVal;
        }
        else
        {
          return firstVal - secondVal;
        }

      case TOKEN_PLUS:
        return firstVal + secondVal;

      case TOKEN_SLASH:
        return firstVal / secondVal;

      case TOKEN_STAR:
        return firstVal * secondVal;
    }
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
