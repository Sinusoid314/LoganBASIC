class Compiler
{
  constructor(sourceStr)
  {
	this.sourceStr = sourceStr;
	this.scanner = new Scanner(sourceStr);
    this.tokenList = [];
    this.bytecode = new Bytecode();
    this.currTokenIndex = 0;
    this.errorMsg = "";
  }

  compile()
  //Compile the source code string to a series of bytecodes
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
  //
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

    else if(this.checkTokenPair(TOKEN_IDENTIFIER, TOKEN_LEFT_PAREN))
      this.callStmt();

    else if(this.checkToken(TOKEN_IDENTIFIER))
      this.assignmentStmt();

    else
      throw {message: "Expected statement."};

    if(requireTerminator)
    {
      if(!this.matchTerminator())
        throw {message: "Expected end-of-statement."};
    }
  }

  varStmt()
  //
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
  //
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
      throw {message: "Expected one or more index expressions."};

    if(!this.matchToken(TOKEN_RIGHT_BRACKET))
      throw {message: "Expected ']' after indexes"};

    this.addOp([OPCODE_CREATE_ARRAY, dimCount]);
    this.addOp([OPCODE_STORE_VAR, varIndex]);
  }

  assignmentStmt()
  //
  {
    var varIdent, varIndex;
    var indexCount, storeOp;

    if(this.checkTokenPair(TOKEN_IDENTIFIER, TOKEN_LEFT_BRACKET))
    {
      indexCount = this.parseArrayItem();
      storeOp = [OPCODE_STORE_ARRAY_ITEM, indexCount];
    }
    else
    {
      varIdent = this.consumeToken().lexemeStr;
      varIndex = this.getVariableIndex(varIdent);
      storeOp = [OPCODE_STORE_VAR, varIndex];
    }

    if(!this.matchToken(TOKEN_EQUAL))
      throw {message: "Expected '=' after variable or array item."};

    this.parseExpression();
    this.addOp(storeOp);
  }

  callStmt()
  //
  {
    this.parseFuncCall();
    this.addOp([OPCODE_POP]);
  }

  printStmt()
  //
  {
    this.parseExpression();
    this.addOp([OPCODE_PRINT]);
  }

  ifStmt()
  //
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
  //
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
  //
  {

  }

  endStmt()
  //
  {
    this.addOp([OPCODE_END]);
  }

  reDimStmt()
  //
  {
    var dimCount = this.parseArrayItem();
    this.addOp([OPCODE_REDIM_ARRAY, dimCount]);
  }

  clsStmt()
  //
  {
    this.addOp([OPCODE_CLS]);
  }

  doStmt()
  //
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

    while(this.matchToken(TOKEN_OR))
    {
      jumpOpIndex = this.addOp([OPCODE_JUMP_IF_TRUE_PERSIST, 0]);
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

    while(this.matchToken(TOKEN_AND))
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

    while(this.matchTokenList([TOKEN_EQUAL, TOKEN_NOT_EQUAL]))
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

    while(this.matchTokenList([TOKEN_GREATER, TOKEN_GREATER_EQUAL, TOKEN_LESS, TOKEN_LESS_EQUAL]))
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

    while(this.matchTokenList([TOKEN_MINUS, TOKEN_PLUS]))
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

    while(this.matchTokenList([TOKEN_SLASH, TOKEN_STAR, TOKEN_PERCENT]))
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

    if(this.matchTokenList([TOKEN_MINUS, TOKEN_NOT]))
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

    this.callExpr();
  }

  callExpr()
  //
  {
	if(this.checkTokenPair(TOKEN_IDENTIFIER, TOKEN_LEFT_PAREN))
      this.parseFuncCall();
    else
      this.arrayExpr();
  }

  arrayExpr()
  //
  {
    var indexCount;

    if(this.checkTokenPair(TOKEN_IDENTIFIER, TOKEN_LEFT_BRACKET))
    {
      indexCount = this.parseArrayItem();
      this.addOp([OPCODE_LOAD_ARRAY_ITEM, indexCount]);
    }
    else
    {
      this.primaryExpr();
    }
  }

  primaryExpr()
  //
  {
    var varIdent, varIndex;
    var litVal, litIndex;

    //Variable
    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      varIdent = this.prevToken().lexemeStr;
      varIndex = this.getVariableIndex(varIdent);
      this.addOp([OPCODE_LOAD_VAR, varIndex]);
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

  parseFuncCall()
  //
  {
	var funcIdent, funcIndex, argCount;

    if(this.matchToken(TOKEN_IDENTIFIER))
      funcIdent = this.prevToken().lexemeStr;
    else
      throw {message: "Expected identifier."};

    if(!this.matchToken(TOKEN_LEFT_PAREN))
      throw {message: "Expected '(' after function name."};

    argCount = this.parseArguments();

    if(!this.matchToken(TOKEN_RIGHT_PAREN))
      throw {message: "Expected ')' after function arguments."};

    funcIndex = this.getNativeFuncIndex(funcIdent);
    if(funcIndex == -1)
      throw {message: "Function " + funcIdent + "() does not exist."};

    if((argCount < nativeFuncList[funcIndex].paramMin) || (argCount > nativeFuncList[funcIndex].paramMax))
      throw {message: "Wrong number of arguments for function " + funcIdent + "()."};

    this.addOp([OPCODE_CALL_NATIVE_FUNC, funcIndex, argCount]);
  }

  parseArrayItem()
  //
  {
    var varIdent, varIndex, indexCount;

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

    indexCount = this.parseArguments();
    if(indexCount == 0)
      throw {message: "Expected one or more index expressions."};

    if(!this.matchToken(TOKEN_RIGHT_BRACKET))
      throw {message: "Expected ']' after indexes"};

    return indexCount;
  }

  parseArguments()
  //
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
  //
  {
    for(var funcIndex = 0; funcIndex < nativeFuncList.length; funcIndex++)
    {
      if(nativeFuncList[funcIndex].ident == funcIdent.toLowerCase())
        return funcIndex;
    }

    return -1;
  }

  getVariableIndex(varIdent, addIfAbsent = false)
  //
  {
    var varIndex = this.bytecode.varIdentList.indexOf(varIdent);

    if(addIfAbsent)
    {
      if(varIndex == -1)
	  {
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
  //Add a new bytecodce op
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
