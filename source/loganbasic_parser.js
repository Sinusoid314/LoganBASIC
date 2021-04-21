class Parser
{
  constructor(tokenList)
  {
    this.tokenList = tokenList;
    this.bytecode = new Bytecode();
    this.currTokenIndex = 0;
    this.errorMsg = "";
  }

  parse()
  //
  {
	try
	{
      while(!this.endOfTokens())
      {
        this.parseStatement();
      }
    }
    catch(errorObj)
    {
      this.errorMsg = "Compile error on line " + this.peekToken().lineNum + ": " + errorObj.message;
    }

    return this.bytecode;
  }

  parseStatement()
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

  printStmt()
  //
  {
    this.parseExpression();

    if(!this.matchTerminator())
      throw {message: "Expected end-of-statement after expression."};

    this.addOp([OPCODE_PRINT]);
  }

  assignmentStmt()
  //
  {
    var varIdent, varIndex;

    if(!this.matchTokenTypes([TOKEN_IDENTIFIER]))
      throw {message: "Expected identifier."};

    varIdent = this.prevToken().lexemeStr;
    varIndex = this.getVariableIndex(varIdent);

    if(!this.matchTokenTypes([TOKEN_EQUAL]))
      throw {message: "Expected '=' after identifier."};

    this.parseExpression();

    if(!this.matchTerminator())
      throw {message: "Expected end-of-statement after value."};

    this.addOp([OPCODE_STORE_VAR, varIndex]);
  }

  parseExpression()
  //
  {
    this.termExpr();
  }

  termExpr()
  //
  {
    var operatorType;

    this.factorExpr();

    while(this.matchTokenTypes([TOKEN_MINUS, TOKEN_PLUS]))
    {
      operatorType = this.prevToken().type;
      this.factorExpr();
      switch(operatorType)
      {
        case TOKEN_MINUS: this.addOp([OPCODE_SUB]); break;
        case TOKEN_PLUS: this.addOp([OPCODE_ADD]); break;
      }
    }
  }

  factorExpr()
  //
  {
    var operatorType;

    this.unaryExpr();

    while(this.matchTokenTypes([TOKEN_SLASH, TOKEN_STAR]))
    {
      operatorType = this.prevToken().type;
      this.unaryExpr();
      switch(operatorType)
      {
        case TOKEN_SLASH: this.addOp([OPCODE_DIV]); break;
        case TOKEN_STAR: this.addOp([OPCODE_MUL]); break;
      }
    }
  }

  unaryExpr()
  //
  {
    var operatorType;

    if(this.matchTokenTypes([TOKEN_MINUS]))
    {
      operatorType = this.prevToken().type;
      this.unaryExpr();
      switch(operatorType)
      {
        case TOKEN_MINUS: this.addOp([OPCODE_NEGATE]); break;
      }
    }

    this.primaryExpr();
  }

  primaryExpr()
  //
  {
    var varIdent, varIndex;
    var litVal, litIndex;

    //Variable
    if(this.matchTokenTypes([TOKEN_IDENTIFIER]))
    {
      varIdent = this.prevToken().lexemeStr;
      varIndex = this.getVariableIndex(varIdent);
      this.addOp([OPCODE_LOAD_VAR, varIndex]);
      return;
    }

    //Literals
    if(this.matchTokenTypes([TOKEN_STRING_LIT, TOKEN_NUMBER_LIT]))
    {
      litVal = this.prevToken().literalVal;
      litIndex = this.getLiteralIndex(litVal);
      this.addOp([OPCODE_LOAD_LIT, litIndex]);
      return;
    }

    //Nested expression
    if(this.matchTokenTypes([TOKEN_LEFT_PAREN]))
    {
      this.parseExpression();
      if(!this.matchTokenTypes([TOKEN_RIGHT_PAREN]))
      {
        throw {message: "Expected ')' after expression."};
      }
      return;
    }

    //Invalid expression
    throw {message: "Expected expression."};
  }

  getVariableIndex(varIdent)
  //
  {
    var varIndex = this.bytecode.varIdentList.indexOf(varIdent);

    if(varIndex == -1)
    {
      this.bytecode.varIdentList.push(varIdent);
      varIndex = this.bytecode.varIdentList.length - 1;
    }

    return varIndex;
  }

  getLiteralIndex(litVal)
  //
  {
    var litIndex = this.bytecode.literalList.indexOf(litVal);

    if(litIndex == -1)
    {
      this.bytecode.literalList.push(litVal);
      litIndex = this.bytecode.literalList.length - 1;
    }

    return litIndex;
  }

  addOp(opArray)
  //
  {
    this.bytecode.opList.push(opArray);
  }

  matchTerminator()
  {
    return this.matchTokenTypes([TOKEN_NEWLINE, TOKEN_EOF]);
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
