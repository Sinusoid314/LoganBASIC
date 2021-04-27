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
      this.printStmt();
    else if(this.matchTokenTypes([TOKEN_INPUT]))
      this.inputStmt();
    else if(this.matchTokenTypes([TOKEN_IF]))
      this.ifStmt();
    else
      this.assignmentStmt();
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

  printStmt()
  //
  {
    this.parseExpression();

    if(!this.matchTerminator())
      throw {message: "Expected end-of-statement after expression."};

    this.addOp([OPCODE_PRINT]);
  }

  inputStmt()
  //
  {
    var varIdent, varIndex;

    this.parseExpression();

    if(!this.matchTokenTypes([TOKEN_COMMA]))
      throw {message: "Expected ',' after prompt expression."};

    if(!this.matchTokenTypes([TOKEN_IDENTIFIER]))
	  throw {message: "Expected identifier."};

	varIdent = this.prevToken().lexemeStr;
    varIndex = this.getVariableIndex(varIdent);

    if(!this.matchTerminator())
      throw {message: "Expected end-of-statement after identifier."};

    this.addOp([OPCODE_INPUT]);
    this.addOp([OPCODE_STORE_VAR, varIndex]);
  }

  ifStmt()
  //
  {
    var jumpOpIndex;

    this.parseExpression();

    if(!this.matchTokenTypes([TOKEN_THEN]))
      throw {message: "Expected 'then' after expression."};

    jumpOpIndex = this.addOp([OPCODE_JUMP_IF_FALSE, 0]);

    if(!this.matchTerminator())
    {
      this.parseStatement();
    }
    else
    {
      while(!(this.checkTokenType(TOKEN_END) && this.checkNextTokenType(TOKEN_IF))
            && !this.endOfTokens())
      {
        this.parseStatement();
      }

      if(this.endOfTokens())
        throw {message: "Expected 'end if' after 'if' block."};

      this.consumeToken(); //TOKEN_END
      this.consumeToken(); //TOKEN_IF

      if(!this.matchTerminator())
        throw {message: "Expected end-of-statement after 'end if'."};
    }

    this.patchJumpOp(jumpOpIndex);
  }

  parseExpression()
  //
  {
    this.logicOrExpr();
  }

  logicOrExpr()
  //
  {
    var jumpOpIndex;

    this.logicAndExpr();

    while(this.matchTokenTypes([TOKEN_AND]))
    {
      jumpOpIndex = this.addOp([OPCODE_JUMP_IF_FALSE_PERSIST, 0]);
      this.addOp([OPCODE_POP]);

      this.logicAndExpr();

      this.patchJumpOp(jumpOpIndex);
    }
  }

  logicAndExpr()
  //
  {
    var jumpOpIndex;

    this.equalityExpr();

    while(this.matchTokenTypes([TOKEN_AND]))
    {
      jumpOpIndex = this.addOp([OPCODE_JUMP_IF_FALSE_PERSIST, 0]);
      this.addOp([OPCODE_POP]);

      this.equalityExpr();

      this.patchJumpOp(jumpOpIndex);
    }
  }

  equalityExpr()
  //
  {
    var operatorType;

    this.comparisonExpr();

    while(this.matchTokenTypes([TOKEN_EQUAL, TOKEN_NOT_EQUAL]))
    {
      operatorType = this.prevToken().type;
      this.comparisonExpr();

      switch(operatorType)
      {
        case TOKEN_EQUAL:
          this.addOp([OPCODE_EQUAL]);
          break;

        case TOKEN_NOT_EQUAL:
          this.addOp([OPCODE_EQUAL]);
          this.addOp([OPCODE_NOT]);
          break;
      }
    }
  }

  comparisonExpr()
  //
  {
    var operatorType;

    this.termExpr();

    while(this.matchTokenTypes([TOKEN_GREATER, TOKEN_GREATER_EQUAL, TOKEN_LESS, TOKEN_LESS_EQUAL]))
    {
      operatorType = this.prevToken().type;
      this.termExpr();

      switch(operatorType)
      {
        case TOKEN_GREATER:
          this.addOp([OPCODE_GREATER]);
          break;

        case TOKEN_GREATER_EQUAL:
          this.addOp([OPCODE_LESS]);
          this.addOp([OPCODE_NOT]);
          break;

        case TOKEN_LESS:
          this.addOp([OPCODE_LESS]);
          break;

        case TOKEN_LESS_EQUAL:
          this.addOp([OPCODE_GREATER]);
          this.addOp([OPCODE_NOT]);
          break;
      }
    }
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

    while(this.matchTokenTypes([TOKEN_SLASH, TOKEN_STAR, TOKEN_PERCENT]))
    {
      operatorType = this.prevToken().type;
      this.unaryExpr();

      switch(operatorType)
      {
        case TOKEN_SLASH: this.addOp([OPCODE_DIV]); break;
        case TOKEN_STAR: this.addOp([OPCODE_MUL]); break;
        case TOKEN_PERCENT: this.addOp([OPCODE_MOD]); break;
      }
    }
  }

  unaryExpr()
  //
  {
    var operatorType;

    if(this.matchTokenTypes([TOKEN_MINUS, TOKEN_NOT]))
    {
      operatorType = this.prevToken().type;
      this.unaryExpr();

      switch(operatorType)
      {
        case TOKEN_MINUS: this.addOp([OPCODE_NEGATE]); break;
        case TOKEN_NOT: this.addOp([OPCODE_NOT]); break;
      }

      return;
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
    if(this.matchTokenTypes([TOKEN_TRUE]))
    {
      this.addOp([OPCODE_LOAD_TRUE]);
      return;
    }

    if(this.matchTokenTypes([TOKEN_FALSE]))
    {
      this.addOp([OPCODE_LOAD_FALSE]);
      return;
    }

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
        throw {message: "Expected ')' after expression."};

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

  addOp(operandList)
  //
  {
    this.bytecode.opList.push(operandList);
    return this.bytecode.opList.length - 1;
  }

  patchJumpOp(opIndex)
  //
  {
    this.bytecode.opList[opIndex][1] = this.bytecode.opList.length;
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

  checkNextTokenType(tokenType)
  //
  {
    return (this.peekNextToken().type == tokenType);
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

  peekNextToken()
  //
  {
	if(!this.endOfTokens())
      return this.tokenList[this.currTokenIndex + 1];
    else
      return this.peekToken();
  }

  prevToken()
  //
  {
    return this.tokenList[this.currTokenIndex - 1];
  }
}
