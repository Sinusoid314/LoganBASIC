class Interpreter
{
  constructor(tokenList)
  {
    this.tokenList = tokenList;
    this.currTokenIndex = 0;
    this.variableMap = new Map();
    this.errorMsg = "";
  }

  run()
  //
  {
	try
	{
      while(!this.endOfTokens())
      {
        this.runStatement();
      }
    }
    catch(errorObj)
    {
      this.errorMsg = "Runtime error on line " + this.peekToken().lineNum + ": " + errorObj.message;
    }
  }

  runStatement()
  //
  {
    if(this.matchTokenTypes([TOKEN_PRINT]))
    {
      this.printStmt();
    }
    else
    {
      this.assignmentStmt();
    }
  }

  matchTerminator()
  {
    return this.matchTokenTypes([TOKEN_NEWLINE, TOKEN_EOF]);
  }

  printStmt()
  //
  {
    var val = this.evalExpression();

    if(!this.matchTerminator())
      throw {message: "Expected end-of-statement after expression."};

    val += '\n';
    postMessage({msgId: MSGID_PRINT, msgData: val});
  }

  assignmentStmt()
  //
  {
    var ident, val;

    if(!this.matchTokenTypes([TOKEN_IDENTIFIER]))
      throw {message: "Expected identifier."};

    ident = this.prevToken().lexemeStr;

    if(!this.matchTokenTypes([TOKEN_EQUAL]))
      throw {message: "Expected '=' after identifier."};

    val = this.evalExpression();

    if(!this.matchTerminator())
      throw {message: "Expected end-of-statement after value."};

    this.variableMap.set(ident, val);
  }

  evalExpression()
  //
  {
    return this.termExpr();
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
    var ident, val;

    //Variable
    if(this.matchTokenTypes([TOKEN_IDENTIFIER]))
    {
      ident = this.prevToken().lexemeStr;

      //Default to number with value of 0 if variable doesn't exist yet
      if(!this.variableMap.has(ident))
        this.variableMap.set(ident, 0);

      return this.variableMap.get(ident);
    }

    //Literals
    if(this.matchTokenTypes([TOKEN_STRING_LIT, TOKEN_NUMBER_LIT]))
      return this.prevToken().literalVal;

    //Nested expression
    if(this.matchTokenTypes([TOKEN_LEFT_PAREN]))
    {
      val = this.evalExpression();

      if(!this.matchTokenTypes([TOKEN_RIGHT_PAREN]))
      {
        throw {message: "Expected ')' after expression."};
      }
      else
      {
        return val;
      }
    }

    //Invalid expression
    throw {message: "Expected expression."};
  }

  evalOperation(operatorToken, firstVal, secondVal)
  //
  {
    switch(operatorToken.type)
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
      this.currTokenIndex++;

    return this.prevToken();
  }

  matchTokenTypes(tokenTypeList)
  //
  {
    //console.log(tokenTypeList);
    for(var index = 0; index < tokenTypeList.length; index++)
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
    return (this.peekToken().type == tokenType);
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
