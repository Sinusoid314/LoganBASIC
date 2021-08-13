class Compiler
{
  constructor(sourceStr, nativeFuncList)
  {
	this.sourceStr = sourceStr;
	this.scanner = new Scanner(sourceStr);
    this.tokenList = [];
    this.bytecode = new Bytecode();
    this.bytecode.nativeFuncList = nativeFuncList;
    this.currTokenIndex = 0;
    this.errorMsg = "";
  }

  compile()
  //Compile the source code string to a series of bytecode ops
  {
	try
	{
      this.scanTokens();

      while(!this.endOfTokens())
        this.parseStatement();
    }
    catch(errorObj)
    {
      this.errorMsg = "Compile error on line " + this.peekToken().lineNum + ": " + errorObj.message;
    }

    return this.bytecode;
  }

  scanTokens()
  //Use the scanner to build a token list
  {
    var token;

    do
    {
      token = this.scanner.scanToken();

      switch(token.type)
      {
        case TOKEN_ERROR:
          throw {message: token.lexemeStr};
          break;

        case TOKEN_NEWLINE:
          if(this.tokenList.length > 0)
          {
            if(this.tokenList[this.tokenList.length - 1].type == TOKEN_UNDERSCORE)
            {
              this.tokenList.pop();
            }
            else
            {
              if(this.tokenList[this.tokenList.length - 1].type != TOKEN_NEWLINE)
                this.tokenList.push(token);
            }
          }
          break;

        case TOKEN_COLON:
          if(this.tokenList.length > 0)
          {
            if(this.tokenList[this.tokenList.length - 1].type != TOKEN_COLON)
              this.tokenList.push(token);
          }
          break;

        default:
          this.tokenList.push(token);
      }
    }
    while(token.type != TOKEN_EOF)
  }

  parseStatement(requireTerminator = true)
  //Determine the next statement to parse
  {
    if(this.matchToken(TOKEN_VAR))
      this.varStmt();

    else if(this.matchToken(TOKEN_ARRAY))
      this.arrayStmt();

    else if(this.matchToken(TOKEN_PRINT))
      this.printStmt();

    else if(this.matchToken(TOKEN_IF))
      this.ifStmt();

    else if(this.matchToken(TOKEN_WHILE))
      this.whileStmt();

    else if(this.matchToken(TOKEN_FOR))
      this.forStmt();

    else if(this.matchToken(TOKEN_END))
      this.endStmt();

    else if(this.matchToken(TOKEN_REDIM))
      this.reDimStmt();

    else if(this.matchToken(TOKEN_CLS))
      this.clsStmt();

    else if(this.matchToken(TOKEN_DO))
      this.doStmt();

    else
      this.exprStmt();

    if(requireTerminator)
    {
      if(!this.matchTerminator())
        throw {message: "Expected end-of-statement."};
    }
  }

  varStmt()
  //Parse a Var statement
  {
    var varIdent, varIndex;

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      varIdent = this.prevToken().lexemeStr;
      varIndex = this.getVariableIndex(varIdent, true);
    }
    else
    {
      throw {message: "Expected identifier."};
    }

    if(this.matchToken(TOKEN_EQUAL))
    {
      this.parseExpression();
      this.addOp([OPCODE_STORE_VAR, varIndex]);
    }
  }

  arrayStmt()
  //Parse an Array statement
  {
    var varIdent, varIndex, dimCount;

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      varIdent = this.prevToken().lexemeStr;
      varIndex = this.getVariableIndex(varIdent, true);
    }
    else
    {
      throw {message: "Expected identifier."};
    }

    if(!this.matchToken(TOKEN_LEFT_BRACKET))
      throw {message: "Expected '[' after identifier"};

    dimCount = this.parseArguments();
    if(dimCount == 0)
      throw {message: "Expected one or more dimension expressions."};

    if(!this.matchToken(TOKEN_RIGHT_BRACKET))
      throw {message: "Expected ']' after indexes"};

    this.addOp([OPCODE_CREATE_ARRAY, dimCount]);
    this.addOp([OPCODE_STORE_VAR, varIndex]);
  }

  exprStmt()
  //Parse an expression statement
  {
    this.parseExpression(true);
    this.addOp([OPCODE_POP]);
  }

  printStmt()
  //Parse a Print statement
  {
    this.parseExpression();
    this.addOp([OPCODE_PRINT]);
  }

  ifStmt()
  //Parse an If...Then statement
  {
    var thenJumpOpIndex;
    var elseJumpOpIndex;

    this.parseExpression();

    if(!this.matchToken(TOKEN_THEN))
      throw {message: "Expected 'then' after expression."};

    thenJumpOpIndex = this.addOp([OPCODE_JUMP_IF_FALSE, 0]);

    if(!this.matchTerminator())
    {
      this.parseStatement(false);
      this.patchJumpOp(thenJumpOpIndex);
      return;
    }

    while(!this.checkTokenPair(TOKEN_END, TOKEN_IF) && !this.checkToken(TOKEN_ELSE)
          && !this.endOfTokens())
      this.parseStatement();

    if(this.endOfTokens())
      throw {message: "Expected either 'else' or 'end if' at the end of 'if' block."};

    if(this.matchTokenPair(TOKEN_END, TOKEN_IF))
    {
	  console.log("END IF");
      this.patchJumpOp(thenJumpOpIndex);
    }
    else if(this.matchToken(TOKEN_ELSE))
    {
		if(!this.matchTerminator())
          throw {message: "Expected end-of-statement after 'else'."};

        elseJumpOpIndex = this.addOp([OPCODE_JUMP, 0]);
		this.patchJumpOp(thenJumpOpIndex);

        while(!this.checkTokenPair(TOKEN_END, TOKEN_IF) && !this.endOfTokens())
	      this.parseStatement();

        if(!this.matchTokenPair(TOKEN_END, TOKEN_IF))
          throw {message: "Expected 'end if' at the end of 'else' block."};

        this.patchJumpOp(elseJumpOpIndex);
    }
  }

  whileStmt()
  //Parse a While...Wend statement
  {
    var jumpOpIndex;
	var startOpIndex = this.bytecode.opList.length;

    this.parseExpression();

    if(!this.matchTerminator())
      throw {message: "Expected end-of-statement after expression."};

    jumpOpIndex = this.addOp([OPCODE_JUMP_IF_FALSE, 0]);

    while(!this.checkToken(TOKEN_WEND) && !this.endOfTokens())
      this.parseStatement();

    if(!this.matchToken(TOKEN_WEND))
      throw {message: "Expected 'wend' at the end of 'while' block."};

    this.addOp([OPCODE_JUMP, startOpIndex]);
    this.patchJumpOp(jumpOpIndex);
  }

  forStmt()
  //Parse a For...Next statement
  {
    var varIdent, varIndex;
    var jumpOpIndex, startOpIndex;

    if(!this.matchToken(TOKEN_IDENTIFIER))
      throw {message: "Expected identifier after 'for'."};

    varIdent = this.prevToken().lexemeStr;
    varIndex = this.getVariableIndex(varIdent, true);

    if(!this.matchToken(TOKEN_EQUAL))
      throw {message: "Expected '=' after identifier."};

 	this.parseExpression();
    this.addOp([OPCODE_STORE_VAR, varIndex]);

    if(!this.matchToken(TOKEN_TO))
      throw {message: "Expected 'to' after start expression."};

    this.parseExpression();

    if(this.matchToken(TOKEN_STEP))
      this.parseExpression();
    else
      this.addOp([OPCODE_LOAD_LIT, this.getLiteralIndex(1)]);

    if(!this.matchTerminator())
      throw {message: "Expected end-of-statement after expression."};

    startOpIndex = this.bytecode.opList.length;
    this.addOp([OPCODE_CHECK_COUNTER, varIndex]);
    jumpOpIndex = this.addOp([OPCODE_JUMP_IF_TRUE, 0]);

    while(!this.checkToken(TOKEN_NEXT) && !this.endOfTokens())
      this.parseStatement();

    if(!this.matchToken(TOKEN_NEXT))
      throw {message: "Expected 'next' at the end of 'for' block."};

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      if(varIdent != this.prevToken().lexemeStr)
        throw {message: "Identifier '" + this.prevToken().lexemeStr + "' does not match identifier '" + varIdent + "' given in 'for' statement."};
    }

    this.addOp([OPCODE_JUMP, startOpIndex]);
    this.patchJumpOp(jumpOpIndex);
    this.addOp([OPCODE_POP]);
    this.addOp([OPCODE_POP]);
  }

  endStmt()
  //Parse an End statement
  {
    this.addOp([OPCODE_END]);
  }

  reDimStmt()
  //Parse a Redim statement
  {
    var varIdent, varIndex, dimCount;

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      varIdent = this.prevToken().lexemeStr;
      varIndex = this.getVariableIndex(varIdent);
      this.addOp([OPCODE_LOAD_VAR, varIndex]);
    }
    else
    {
      throw {message: "Expected identifier."};
    }

    if(!this.matchToken(TOKEN_LEFT_BRACKET))
      throw {message: "Expected '[' after identifier"};

    dimCount = this.parseArguments();
    if(dimCount == 0)
      throw {message: "Expected one or more dimension expressions."};

    if(!this.matchToken(TOKEN_RIGHT_BRACKET))
      throw {message: "Expected ']' after indexes"};

    this.addOp([OPCODE_REDIM_ARRAY, dimCount]);
  }

  clsStmt()
  //Parse a Cls statement
  {
    this.addOp([OPCODE_CLS]);
  }

  doStmt()
  //Parse a Do...Loop While statement
  {
    var startOpIndex = this.bytecode.opList.length;

    if(!this.matchTerminator())
      throw {message: "Expected statement terminator after 'do'."};

    while(!this.endOfTokens() && !this.checkTokenPair(TOKEN_LOOP, TOKEN_WHILE))
      this.parseStatement();

    if(!this.matchTokenPair(TOKEN_LOOP, TOKEN_WHILE))
      throw {message: "Expected 'loop while' at the end of 'do' block."};

    this.parseExpression();
    this.addOp([OPCODE_JUMP_IF_TRUE, startOpIndex]);
  }

  parseExpression(isStmt = false)
  //Parse an expression
  {
    this.logicOrExpr(isStmt);
  }

  logicOrExpr(isStmt)
  //Parse a Logical OR expression
  {
    var jumpOpIndex;

    this.logicAndExpr(isStmt);

    while(this.matchToken(TOKEN_OR))
    {
      jumpOpIndex = this.addOp([OPCODE_JUMP_IF_TRUE_PERSIST, 0]);
      this.addOp([OPCODE_POP]);

      this.logicAndExpr(isStmt);

      this.patchJumpOp(jumpOpIndex);
    }
  }

  logicAndExpr(isStmt)
  //Parse a Logical AND expression
  {
    var jumpOpIndex;

    this.equalityExpr(isStmt);

    while(this.matchToken(TOKEN_AND))
    {
      jumpOpIndex = this.addOp([OPCODE_JUMP_IF_FALSE_PERSIST, 0]);
      this.addOp([OPCODE_POP]);

      this.equalityExpr(isStmt);

      this.patchJumpOp(jumpOpIndex);
    }
  }

  equalityExpr(isStmt)
  //Parse an equality expression
  {
    var operatorType;

    this.comparisonExpr(isStmt);

    while(this.matchTokenList([TOKEN_EQUAL, TOKEN_NOT_EQUAL]))
    {
      operatorType = this.prevToken().type;
      this.comparisonExpr(isStmt);

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

  comparisonExpr(isStmt)
  //Parse a comparison expression
  {
    var operatorType;

    this.termExpr(isStmt);

    while(this.matchTokenList([TOKEN_GREATER, TOKEN_GREATER_EQUAL, TOKEN_LESS, TOKEN_LESS_EQUAL]))
    {
      operatorType = this.prevToken().type;
      this.termExpr(isStmt);

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

  termExpr(isStmt)
  //Parse an addition/substraction expression
  {
    var operatorType;

    this.factorExpr(isStmt);

    while(this.matchTokenList([TOKEN_MINUS, TOKEN_PLUS]))
    {
      operatorType = this.prevToken().type;
      this.factorExpr(isStmt);

      switch(operatorType)
      {
        case TOKEN_MINUS: this.addOp([OPCODE_SUB]); break;
        case TOKEN_PLUS: this.addOp([OPCODE_ADD]); break;
      }
    }
  }

  factorExpr(isStmt)
  //Parse a multiplication/division/modulo expression
  {
    var operatorType;

    this.powerExpr(isStmt);

    while(this.matchTokenList([TOKEN_SLASH, TOKEN_STAR, TOKEN_PERCENT]))
    {
      operatorType = this.prevToken().type;
      this.powerExpr(isStmt);

      switch(operatorType)
      {
        case TOKEN_SLASH: this.addOp([OPCODE_DIV]); break;
        case TOKEN_STAR: this.addOp([OPCODE_MUL]); break;
        case TOKEN_PERCENT: this.addOp([OPCODE_MOD]); break;
      }
    }
  }

  powerExpr(isStmt)
  //Parse an exponentiation (power) expression
  {
    this.unaryExpr(isStmt);

    while(this.matchToken(TOKEN_CARET))
    {
      this.unaryExpr(isStmt);
      this.addOp([OPCODE_POW]);
    }
  }


  unaryExpr(isStmt)
  //Parse a unary expression
  {
    var operatorType;

    if(this.matchTokenList([TOKEN_MINUS, TOKEN_NOT]))
    {
      operatorType = this.prevToken().type;
      this.unaryExpr(isStmt);

      switch(operatorType)
      {
        case TOKEN_MINUS: this.addOp([OPCODE_NEGATE]); break;
        case TOKEN_NOT: this.addOp([OPCODE_NOT]); break;
      }

      return;
    }

    this.callExpr(isStmt);
  }

  callExpr(isStmt)
  //Parse a function call expression
  {
    var argCount;

    this.arrayItemExpr(isStmt);

    while(this.matchToken(TOKEN_LEFT_PAREN))
    {
      argCount = this.parseArguments();

      if(!this.matchToken(TOKEN_RIGHT_PAREN))
        throw {message: "Expected ')' after function arguments."};

      this.addOp([OPCODE_CALL_NATIVE_FUNC, argCount]);
    }
  }

  arrayItemExpr(isStmt)
  //Parse an array expression
  {
    var indexCount;

    this.primaryExpr(isStmt);

    while(this.matchToken(TOKEN_LEFT_BRACKET))
    {
      indexCount = this.parseArguments();

      if(!this.matchToken(TOKEN_RIGHT_BRACKET))
        throw {message: "Expected ']' after array indexes."};

      if(isStmt && this.matchToken(TOKEN_EQUAL))
      {
        this.parseExpression();
        this.addOp([OPCODE_STORE_ARRAY_ITEM_PERSIST, indexCount]);
      }
      else
      {
        this.addOp([OPCODE_LOAD_ARRAY_ITEM, indexCount]);
      }
    }
  }

  primaryExpr(isStmt)
  //Parse a primary expression
  {
    var ident, funcIndex, varIndex;
    var litVal, litIndex;

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      ident = this.prevToken().lexemeStr;

      //Native Function
      funcIndex = this.getNativeFuncIndex(ident);
      if(funcIndex != -1)
      {
        this.addOp([OPCODE_LOAD_NATIVE_FUNC, funcIndex]);
        return;
      }

      //Variable
      varIndex = this.getVariableIndex(ident);
      if(isStmt && this.matchToken(TOKEN_EQUAL))
      {
        this.parseExpression();
        this.addOp([OPCODE_STORE_VAR_PERSIST, varIndex]);
      }
      else
      {
        this.addOp([OPCODE_LOAD_VAR, varIndex]);
      }
      return;
    }

    //Literals
    if(this.matchToken(TOKEN_TRUE))
    {
      this.addOp([OPCODE_LOAD_TRUE]);
      return;
    }

    if(this.matchToken(TOKEN_FALSE))
    {
      this.addOp([OPCODE_LOAD_FALSE]);
      return;
    }

    if(this.matchTokenList([TOKEN_STRING_LIT, TOKEN_NUMBER_LIT]))
    {
      litVal = this.prevToken().literalVal;
      litIndex = this.getLiteralIndex(litVal);
      this.addOp([OPCODE_LOAD_LIT, litIndex]);
      return;
    }

    //Nested expression
    if(this.matchToken(TOKEN_LEFT_PAREN))
    {
      this.parseExpression();

      if(!this.matchToken(TOKEN_RIGHT_PAREN))
        throw {message: "Expected ')' after expression."};

      return;
    }

    //Invalid expression
    throw {message: "Expected expression."};
  }

  parseArguments()
  //Parse a comma-seperated list of expressions
  {
    var argCount = 0;

    if(this.checkToken(TOKEN_RIGHT_PAREN))
      return argCount;

    do
    {
      this.parseExpression()
      argCount++;
    }
    while(this.matchToken(TOKEN_COMMA));

    return argCount;
  }

  getNativeFuncIndex(funcIdent)
  //Return the index of the given native function identifier
  {
    for(var funcIndex = 0; funcIndex < this.bytecode.nativeFuncList.length; funcIndex++)
    {
      if(this.bytecode.nativeFuncList[funcIndex].ident == funcIdent.toLowerCase())
        return funcIndex;
    }

    return -1;
  }

  getVariableIndex(varIdent, addIfAbsent = false)
  //Return the index of the given variable identifier
  {
    var varIndex = this.bytecode.varIdentList.indexOf(varIdent);

    if(addIfAbsent)
    {
      if(varIndex == -1)
	  {
		if(getNativeFuncIndex(varIdent) != -1)
		{
          throw {message: "Identifier '" + varIdent + "' is already a function name."};
        }

	    this.bytecode.varIdentList.push(varIdent);
	    varIndex = this.bytecode.varIdentList.length - 1;
      }
      else
      {
        throw {message: "Variable or array '" + varIdent + "' already declared."};
      }
    }
    else
    {
      if(varIndex == -1)
        throw {message: "Variable or array '" + varIdent + "' not declared."};
    }

    return varIndex;
  }

  getLiteralIndex(litVal)
  //Return the index of the given literal value
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
  //Add a new bytecodce op
  {
    this.bytecode.opList.push(operandList);
    return this.bytecode.opList.length - 1;
  }

  patchJumpOp(opIndex)
  //Set the operand of the given jump op to the index of the next op to be added
  {
    this.bytecode.opList[opIndex][1] = this.bytecode.opList.length;
  }

  matchTerminator()
  //Return true if the current token is one of the statement terminators
  {
    return this.matchTokenList([TOKEN_NEWLINE, TOKEN_COLON, TOKEN_EOF]);
  }

  consumeToken()
  //Return the current token and advance to the next token
  {
    if(!this.endOfTokens())
      this.currTokenIndex++;

    return this.prevToken();
  }

  matchTokenList(tokenTypeList)
  //Return true if the current token's type matches any one of the given types
  {
    for(var index = 0; index < tokenTypeList.length; index++)
    {
      if(this.checkToken(tokenTypeList[index]))
      {
        this.consumeToken();
        return true;
      }
    }

    return false;
  }

  matchTokenPair(tokenType1, tokenType2)
  //Return true and advance past the next token if the current and next token's types match the given types
  {
    if(this.checkTokenPair(tokenType1, tokenType2))
    {
	  this.consumeToken();
	  this.consumeToken();
	  return true;
    }

    return false;
  }

  matchToken(tokenType)
  //Return true and advance to the next token if the current token's type matches the given type
  {
    if(this.checkToken(tokenType))
    {
      this.consumeToken();
      return true;
    }
  }

  checkTokenPair(tokenType1, tokenType2)
  //Return true if the current and next token's types match the given types
  {
    if(this.checkToken(tokenType1) && this.checkNextToken(tokenType2))
	  return true;

    return false;
  }

  checkToken(tokenType)
  //Return true if the current token's type matches the given type
  {
    return (this.peekToken().type == tokenType);
  }

  checkNextToken(tokenType)
  //Return true if the next token's type matches the given type
  {
    return (this.peekNextToken().type == tokenType);
  }

  peekToken()
  //Return the current token
  {
    return this.tokenList[this.currTokenIndex];
  }

  peekNextToken()
  //Return the token after the current token
  {
	if(!this.endOfTokens())
      return this.tokenList[this.currTokenIndex + 1];
    else
      return this.peekToken();
  }

  prevToken()
  //Return the token before the current token
  {
    return this.tokenList[this.currTokenIndex - 1];
  }

  endOfTokens()
  //Return true if the current token is the end token
  {
    return (this.peekToken().type == TOKEN_EOF)
  }
}
