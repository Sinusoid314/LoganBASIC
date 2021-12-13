class VariableReference
{
  constructor(scope, index)
  {
    this.scope = scope;
    this.index = index;
  }
}

class Compiler
{
  constructor(source, nativeFuncs)
  {
	this.source = source;
	this.scanner = new Scanner(source);
    this.bytecode = new Bytecode();
    this.bytecode.nativeFuncs = nativeFuncs;
    this.mainUserFunc = null;
    this.currUserFunc = null;
    this.currTokens = null;
    this.currTokenIndex = 0;
    this.exitWhileOpIndexes = [];
    this.exitForOpIndexes = [];
    this.exitDoOpIndexes = [];
    this.error = null;
  }

  compile()
  //Compile the source code string to a series of bytecode ops
  {
	try
	{
      this.scanTokens();

      this.parseStructDefs();

      this.parseUserFuncs();
    }
    catch(error)
    {
      this.error = error;
    }

    return this.bytecode;
  }

  scanTokens()
  //Use the scanner to build a token list for each user function
  {
    var currToken, prevToken, tokens;
    var inFunc = false;
    var inStructDef = false;

    this.mainUserFunc = new ObjUserFunc("<main>");
    this.bytecode.userFuncs.push(this.mainUserFunc);
    tokens = this.mainUserFunc.tokens;

    do
    {
      currToken = this.scanner.scanToken();

      switch(currToken.type)
      {
        case TOKEN_ERROR:
          this.raiseError(currToken.lexeme, currToken);
          break;

        case TOKEN_NEWLINE:
          if(tokens.length > 0)
          {
            if(tokens[tokens.length - 1].type != TOKEN_NEWLINE)
              tokens.push(currToken);
          }
          else
          {
            if(inStructDef)
              tokens.push(currToken);
          }
          break;

        case TOKEN_COLON:
          if(tokens.length > 0)
          {
            if(tokens[tokens.length - 1].type != TOKEN_COLON)
              tokens.push(currToken);
          }
          else
          {
            if(inStructDef)
              tokens.push(currToken);
          }
          break;

        case TOKEN_UNDERSCORE:
          prevToken = currToken;
          currToken = this.scanner.scanToken();

          if(currToken.type != TOKEN_NEWLINE)
          {
            tokens.push(prevToken);
            tokens.push(currToken);
          }
          break;

        case TOKEN_FUNCTION:
          if(inFunc)
            this.raiseError("Cannot have nested functions.", currToken);

          if(inStructDef)
            this.raiseError("Cannot have functions within structures.", currToken);

          currToken = this.scanner.scanToken();

          if(currToken.type != TOKEN_IDENTIFIER)
            this.raiseError("Expected identifier after 'function'.", currToken);

          if(this.getNativeFuncIndex(currToken.lexeme) != -1)
            this.raiseError("'" + currToken.lexeme + "' is already a function.", currToken);

          if(this.getUserFuncIndex(currToken.lexeme) != -1)
            this.raiseError("'" + currToken.lexeme + "' is already a function.", currToken);

          if(this.getStructDefIndex(currToken.lexeme) != -1)
            this.raiseError("'" + currToken.lexeme + "' is already a structure.", currToken);

          this.bytecode.userFuncs.push(new ObjUserFunc(currToken.lexeme));
          tokens = this.bytecode.userFuncs[this.bytecode.userFuncs.length - 1].tokens;
          inFunc = true;
          break;

        case TOKEN_STRUCTURE:
          if(inStructDef)
            this.raiseError("Cannot have nested structures.", currToken);

          if(inFunc)
            this.raiseError("Cannot have structures within functions.", currToken);

          currToken = this.scanner.scanToken();

          if(currToken.type != TOKEN_IDENTIFIER)
            this.raiseError("Expected identifier after 'structure'.", currToken);

          if(this.getNativeFuncIndex(currToken.lexeme) != -1)
            this.raiseError("'" + currToken.lexeme + "' is already a function.", currToken);

          if(this.getUserFuncIndex(currToken.lexeme) != -1)
            this.raiseError("'" + currToken.lexeme + "' is already a function.", currToken);

          if(this.getStructDefIndex(currToken.lexeme) != -1)
            this.raiseError("'" + currToken.lexeme + "' is already a structure.", currToken);

          this.bytecode.structDefs.push(new StructureDef(currToken.lexeme));
          tokens = this.bytecode.structDefs[this.bytecode.structDefs.length - 1].tokens;
          inStructDef = true;
          break;


        case TOKEN_END:
          prevToken = currToken;
          currToken = this.scanner.scanToken();

          if(currToken.type == TOKEN_FUNCTION)
          {
            if(!inFunc)
              this.raiseError("'end function' without 'function'.", currToken);

            tokens.push(this.scanner.makeEOFToken());
            tokens = this.mainUserFunc.tokens;
            inFunc = false;
          }
          else if(currToken.type == TOKEN_STRUCTURE)
          {
            if(!inStructDef)
              this.raiseError("'end structure' without 'structure'.", currToken);

            tokens.push(this.scanner.makeEOFToken());
            tokens = this.mainUserFunc.tokens;
            inStructDef = false;
          }
          else
          {
            tokens.push(prevToken);
            tokens.push(currToken);
          }
          break;

        default:
          tokens.push(currToken);
      }
    }
    while(currToken.type != TOKEN_EOF)

    if(inFunc)
      this.raiseError("'function' without 'end function'.", tokens[0]);

    if(inStructDef)
      this.raiseError("'structure' without 'end structure'.", tokens[0]);
  }

  parseStructDefs()
  //
  {
    for(var structDefIndex = 0; structDefIndex < this.bytecode.structDefs.length; structDefIndex++)
    {
      this.currTokens = this.bytecode.structDefs[structDefIndex].tokens;

      if(!this.matchTerminator())
        this.raiseError("Expected terminator.");

      while(!this.endOfTokens())
      {
        if(!this.matchToken(TOKEN_IDENTIFIER))
          this.raiseError("Expected identifier.");

        this.bytecode.structDefs[structDefIndex].fieldIdents.push(this.prevToken().lexeme);

		if(!this.matchTerminator())
          this.raiseError("Expected terminator after identifier.");
      }

      this.currTokens.splice(0);
      this.currTokenIndex = 0;
    }
  }

  parseUserFuncs()
  //
  {
    for(var funcIndex = 0; funcIndex < this.bytecode.userFuncs.length; funcIndex++)
    {
      this.currUserFunc = this.bytecode.userFuncs[funcIndex];
      this.currTokens = this.currUserFunc.tokens;

      if(this.currUserFunc != this.mainUserFunc)
        this.parseParameters();

      while(!this.endOfTokens())
        this.parseStatement();

      this.addReturnOps();
      this.currTokens.splice(0);
      this.currTokenIndex = 0;
    }
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

    else if(this.matchToken(TOKEN_ELSE))
      this.raiseError("'else' without matching 'if' statement.");

    else if(this.matchTokenPair(TOKEN_END, TOKEN_IF))
      this.raiseError("'end if' without matching 'if' statement.");

    else if(this.matchToken(TOKEN_WHILE))
      this.whileStmt();

    else if(this.matchToken(TOKEN_WEND))
      this.raiseError("'wend' without matching 'while' statement.");

    else if(this.matchToken(TOKEN_FOR))
      this.forStmt();

    else if(this.matchToken(TOKEN_NEXT))
      this.raiseError("'next' without matching 'for' statement.");

    else if(this.matchToken(TOKEN_END))
      this.endStmt();

    else if(this.matchToken(TOKEN_REDIM))
      this.reDimStmt();

    else if(this.matchToken(TOKEN_CLS))
      this.clsStmt();

    else if(this.matchToken(TOKEN_DO))
      this.doStmt();

    else if(this.matchTokenPair(TOKEN_LOOP, TOKEN_WHILE))
      this.raiseError("'loop while' without matching 'do' statement.");

    else if(this.matchTokenPair(TOKEN_EXIT, TOKEN_WHILE))
      this.exitWhileStmt();

    else if(this.matchTokenPair(TOKEN_EXIT, TOKEN_FOR))
      this.exitForStmt();

    else if(this.matchTokenPair(TOKEN_EXIT, TOKEN_DO))
      this.exitDoStmt();

    else if(this.matchToken(TOKEN_RETURN))
      this.returnStmt();

    else if(this.matchToken(TOKEN_WAIT))
      this.waitStmt();

    else
      this.exprStmt();

    if(requireTerminator)
    {
      if(!this.matchTerminator())
        this.raiseError("Expected terminator after statement.");
    }
  }

  varStmt()
  //Parse a Var statement
  {
    var varIdent, varRef;

    do
    {
      if(this.matchToken(TOKEN_IDENTIFIER))
      {
        varIdent = this.prevToken().lexeme;
        varRef = this.addVariable(varIdent);
      }
      else
      {
        this.raiseError("Expected identifier.");
      }

      if(this.matchToken(TOKEN_EQUAL))
      {
        this.parseExpression();
        this.addOp([OPCODE_STORE_VAR, varRef.scope, varRef.index]);
      }
    }
    while(this.matchToken(TOKEN_COMMA));
  }

  arrayStmt()
  //Parse an Array statement
  {
    var varIdent, varRef, dimCount;

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      varIdent = this.prevToken().lexeme;
      varRef = this.addVariable(varIdent);
    }
    else
    {
      this.raiseError("Expected identifier.");
    }

    if(!this.matchToken(TOKEN_LEFT_BRACKET))
      this.raiseError("Expected '[' after identifier.");

    dimCount = this.parseArguments();
    if(dimCount == 0)
      this.raiseError("Expected one or more dimension expressions.");

    if(!this.matchToken(TOKEN_RIGHT_BRACKET))
      this.raiseError("Expected ']' after dimensions.");

    this.addOp([OPCODE_CREATE_ARRAY, dimCount]);
    this.addOp([OPCODE_STORE_VAR, varRef.scope, varRef.index]);
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
      this.raiseError("Expected 'then' after expression.");

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
      this.raiseError("Expected either 'else' or 'end if' at the end of 'if' block.");

    if(this.matchTokenPair(TOKEN_END, TOKEN_IF))
    {
      this.patchJumpOp(thenJumpOpIndex);
    }
    else if(this.matchToken(TOKEN_ELSE))
    {
		if(!this.matchTerminator())
          this.raiseError("Expected terminator after 'else'.");

        elseJumpOpIndex = this.addOp([OPCODE_JUMP, 0]);
		this.patchJumpOp(thenJumpOpIndex);

        while(!this.checkTokenPair(TOKEN_END, TOKEN_IF) && !this.endOfTokens())
	      this.parseStatement();

        if(!this.matchTokenPair(TOKEN_END, TOKEN_IF))
          this.raiseError("Expected 'end if' at the end of 'else' block.");

        this.patchJumpOp(elseJumpOpIndex);
    }
  }

  whileStmt()
  //Parse a While...Wend statement
  {
    var jumpOpIndex;
	var startOpIndex = this.opsCount();

    this.parseExpression();

    if(!this.matchTerminator())
      this.raiseError("Expected terminator after expression.");

    jumpOpIndex = this.addOp([OPCODE_JUMP_IF_FALSE, 0]);

    this.exitWhileOpIndexes.push([]);

    while(!this.checkToken(TOKEN_WEND) && !this.endOfTokens())
      this.parseStatement();

    if(!this.matchToken(TOKEN_WEND))
      this.raiseError("Expected 'wend' at the end of 'while' block.");

    this.addOp([OPCODE_JUMP, startOpIndex]);
    this.patchJumpOp(jumpOpIndex);

    for(var n = 0; n < this.exitWhileOpIndexes[this.exitWhileOpIndexes.length - 1].length; n++)
      this.patchJumpOp(this.exitWhileOpIndexes[this.exitWhileOpIndexes.length - 1][n]);
    this.exitWhileOpIndexes.pop();
  }

  forStmt()
  //Parse a For...Next statement
  {
    var varIdent, varRef;
    var jumpOpIndex, startOpIndex;

    if(!this.matchToken(TOKEN_IDENTIFIER))
      this.raiseError("Expected identifier after 'for'.");

    varIdent = this.prevToken().lexeme;
    varRef = this.getVariableReference(varIdent);

    if(!this.matchToken(TOKEN_EQUAL))
      this.raiseError("Expected '=' after identifier.");

 	this.parseExpression();
    this.addOp([OPCODE_STORE_VAR, varRef.scope, varRef.index]);

    if(!this.matchToken(TOKEN_TO))
      this.raiseError("Expected 'to' after start expression.");

    this.parseExpression();

    if(this.matchToken(TOKEN_STEP))
      this.parseExpression();
    else
      this.addOp([OPCODE_LOAD_INT, 1]);

    if(!this.matchTerminator())
      this.raiseError("Expected terminator after expression.");

    this.addOp([OPCODE_LOAD_VAR, varRef.scope, varRef.index]);

    startOpIndex = this.opsCount();
    this.addOp([OPCODE_CHECK_COUNTER]);
    jumpOpIndex = this.addOp([OPCODE_JUMP_IF_TRUE, 0]);

    this.exitForOpIndexes.push([]);

    while(!this.checkToken(TOKEN_NEXT) && !this.endOfTokens())
      this.parseStatement();

    if(!this.matchToken(TOKEN_NEXT))
      this.raiseError("Expected 'next' at the end of 'for' block.");

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      if(varIdent != this.prevToken().lexeme)
        this.raiseError("Identifier '" + this.prevToken().lexeme + "' does not match identifier '" + varIdent + "' given in 'for' statement.");
    }

    this.addOp([OPCODE_INCREMENT_COUNTER]);
    this.addOp([OPCODE_STORE_VAR_PERSIST, varRef.scope, varRef.index]);
    this.addOp([OPCODE_JUMP, startOpIndex]);
    this.patchJumpOp(jumpOpIndex);

    for(var n = 0; n < this.exitForOpIndexes[this.exitForOpIndexes.length - 1].length; n++)
      this.patchJumpOp(this.exitForOpIndexes[this.exitForOpIndexes.length - 1][n]);
    this.exitForOpIndexes.pop();

    this.addOp([OPCODE_POP]);
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
    var varIdent, varRef, dimCount;

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      varIdent = this.prevToken().lexeme;
      varRef = this.getVariableReference(varIdent);
      this.addOp([OPCODE_LOAD_VAR, varRef.scope, varRef.index]);
    }
    else
    {
      this.raiseError("Expected identifier.");
    }

    if(!this.matchToken(TOKEN_LEFT_BRACKET))
      this.raiseError("Expected '[' after identifier");

    dimCount = this.parseArguments();
    if(dimCount == 0)
      this.raiseError("Expected one or more dimension expressions.");

    if(!this.matchToken(TOKEN_RIGHT_BRACKET))
      this.raiseError("Expected ']' after indexes");

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
    var startOpIndex = this.opsCount();

    if(!this.matchTerminator())
      this.raiseError("Expected statement terminator after 'do'.");

    this.exitDoOpIndexes.push([]);

    while(!this.endOfTokens() && !this.checkTokenPair(TOKEN_LOOP, TOKEN_WHILE))
      this.parseStatement();

    if(!this.matchTokenPair(TOKEN_LOOP, TOKEN_WHILE))
      this.raiseError("Expected 'loop while' at the end of 'do' block.");

    this.parseExpression();
    this.addOp([OPCODE_JUMP_IF_TRUE, startOpIndex]);

    for(var n = 0; n < this.exitDoOpIndexes[this.exitDoOpIndexes.length - 1].length; n++)
      this.patchJumpOp(this.exitDoOpIndexes[this.exitDoOpIndexes.length - 1][n]);
    this.exitDoOpIndexes.pop();
  }

  exitWhileStmt()
  //Parse an Exit While statement
  {
    var jumpOpIndex;

    if(this.exitWhileOpIndexes.length == 0)
      this.raiseError("'exit while' outside of 'while' block.");

    jumpOpIndex = this.addOp([OPCODE_JUMP, 0]);

    this.exitWhileOpIndexes[this.exitWhileOpIndexes.length - 1].push(jumpOpIndex);
  }

  exitForStmt()
  //Parse an Exit For statement
  {
    var jumpOpIndex;

    if(this.exitForOpIndexes.length == 0)
      this.raiseError("'exit for' outside of 'for' block.");

    jumpOpIndex = this.addOp([OPCODE_JUMP, 0]);

    this.exitForOpIndexes[this.exitForOpIndexes.length - 1].push(jumpOpIndex);
  }

  exitDoStmt()
  //Parse an Exit Do statement
  {
    var jumpOpIndex;

    if(this.exitDoOpIndexes.length == 0)
      this.raiseError("'exit do' outside of 'do' block.");

    jumpOpIndex = this.addOp([OPCODE_JUMP, 0]);

    this.exitDoOpIndexes[this.exitDoOpIndexes.length - 1].push(jumpOpIndex);
  }

  returnStmt()
  //Parse a Return statement
  {
    if(this.currUserFunc == this.mainUserFunc)
      this.raiseError("'return' only allowed within a function.");

    if(this.checkTerminator())
    {
      this.addReturnOps();
    }
    else
    {
      this.parseExpression();
      this.addOp([OPCODE_RETURN]);
    }
  }

  waitStmt()
  //Parse a Wait statement
  {
    var pauseOpIndex;

    pauseOpIndex = this.addOp([OPCODE_PAUSE]);
    this.addOp([OPCODE_JUMP, pauseOpIndex]);
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

    this.postfixExpr(isStmt);
  }

  postfixExpr(isStmt)
  //Parse a function call, array item, or structure field expression
  {
    var argCount;
    var fieldIdent;

    this.newExpr(isStmt);

    while(true)
    {
      //Function call
      if(this.matchToken(TOKEN_LEFT_PAREN))
      {
        argCount = this.parseArguments();

        if(!this.matchToken(TOKEN_RIGHT_PAREN))
          this.raiseError("Expected ')' after function arguments.");

        this.addOp([OPCODE_CALL_FUNC, argCount]);
      }
      //Structure field
      else if(this.matchToken(TOKEN_DOT))
      {
        if(!this.matchToken(TOKEN_IDENTIFIER))
          this.raiseError("Expected identifier after '.'.");

        fieldIdent = this.prevToken().lexeme;

        this.addOp([OPCODE_LOAD_LIT, this.getLiteralIndex(fieldIdent)]);

        if(isStmt && this.matchToken(TOKEN_EQUAL))
        {
          this.parseExpression();
          this.addOp([OPCODE_STORE_STRUCT_FIELD_PERSIST]);
        }
        else
        {
          this.addOp([OPCODE_LOAD_STRUCT_FIELD]);
        }
      }
      //Array item
      else if(this.matchToken(TOKEN_LEFT_BRACKET))
      {
        argCount = this.parseArguments();

        if(!this.matchToken(TOKEN_RIGHT_BRACKET))
          this.raiseError("Expected ']' after array indexes.");

        if(isStmt && this.matchToken(TOKEN_EQUAL))
        {
          this.parseExpression();
          this.addOp([OPCODE_STORE_ARRAY_ITEM_PERSIST, argCount]);
        }
        else
        {
          this.addOp([OPCODE_LOAD_ARRAY_ITEM, argCount]);
        }
      }
      else
      {
        break;
      }
    }
  }

  newExpr(isStmt)
  //Parse a New expression
  {
    var dimCount;
    var structDefIdent;
    var structDefIndex;

    if(!this.matchToken(TOKEN_NEW))
    {
      this.primaryExpr(isStmt);
      return;
    }

    if(this.matchToken(TOKEN_ARRAY))
    {
      if(!this.matchToken(TOKEN_LEFT_BRACKET))
        this.raiseError("Expected '[' after 'array'.");

      dimCount = this.parseArguments();

      if(dimCount == 0)
        this.raiseError("Expected one or more dimension expressions.");

      if(!this.matchToken(TOKEN_RIGHT_BRACKET))
        this.raiseError("Expected ']' after dimensions.");

      this.addOp([OPCODE_CREATE_ARRAY, dimCount]);
    }
    else if(this.matchToken(TOKEN_IDENTIFIER))
    {
      structDefIdent = this.prevToken().lexeme;
      structDefIndex = this.getStructDefIndex(structDefIdent);

      if(structDefIndex == -1)
        this.raiseError("Structure '" + structDefIdent + "' not defined.");

      this.addOp([OPCODE_CREATE_STRUCT, structDefIndex]);
    }
    else
    {
      this.raiseError("Expected 'array' or structure identifier after 'new'.");
    }
  }

  primaryExpr(isStmt)
  //Parse a primary expression
  {
    var ident, funcIndex, varRef;
    var litVal, litIndex;

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      ident = this.prevToken().lexeme;

      //Native Function
      funcIndex = this.getNativeFuncIndex(ident);
      if(funcIndex != -1)
      {
        this.addOp([OPCODE_LOAD_NATIVE_FUNC, funcIndex]);
        return;
      }

      //User Function
      funcIndex = this.getUserFuncIndex(ident);
      if(funcIndex != -1)
      {
        this.addOp([OPCODE_LOAD_USER_FUNC, funcIndex]);
        return;
      }

      //Variable
      varRef = this.getVariableReference(ident);
      if(isStmt && this.matchToken(TOKEN_EQUAL))
      {
        this.parseExpression();
        this.addOp([OPCODE_STORE_VAR_PERSIST, varRef.scope, varRef.index]);
      }
      else
      {
        this.addOp([OPCODE_LOAD_VAR, varRef.scope, varRef.index]);
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
      litVal = this.prevToken().literal;
      litIndex = this.getLiteralIndex(litVal);
      this.addOp([OPCODE_LOAD_LIT, litIndex]);
      return;
    }

    //Nested expression
    if(this.matchToken(TOKEN_LEFT_PAREN))
    {
      this.parseExpression();

      if(!this.matchToken(TOKEN_RIGHT_PAREN))
        this.raiseError("Expected ')' after expression.");

      return;
    }

    //Invalid expression
    this.raiseError("Expected expression.");
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

  parseParameters()
  //Parse a comma-seperated list of identifiers surrounded in parentheses
  {
    if(!this.matchToken(TOKEN_LEFT_PAREN))
      this.raiseError("Expected '(' after function identifier.");

    if(this.matchToken(TOKEN_RIGHT_PAREN))
    {
      if(!this.matchTerminator())
        this.raiseError("Expected terminator after ')'.");
      return;
    }

    do
    {
      if(!this.matchToken(TOKEN_IDENTIFIER))
        this.raiseError("Expected identifier for function parameter.");

      this.addVariable(this.prevToken().lexeme);
    }
    while(this.matchToken(TOKEN_COMMA));

    if(!this.matchToken(TOKEN_RIGHT_PAREN))
      this.raiseError("Expected ')' after function parameters.");

    if(!this.matchTerminator())
      this.raiseError("Expected terminator after ')'.");

    this.currUserFunc.paramCount = this.currUserFunc.varIdents.length;
  }

  addVariable(varIdent)
  //Add a variable identifier to the current user function
  {
    var varScope, varIndex;

    if(this.getNativeFuncIndex(varIdent) != -1)
      this.raiseError("'" + varIdent + "' is already a function.");

    if(this.getUserFuncIndex(varIdent) != -1)
      this.raiseError("'" + varIdent + "' is already a function.");

    if(this.getStructDefIndex(varIdent) != -1)
      this.raiseError("'" + varIdent + "' is already a structure.");

    for(varIndex = 0; varIndex < this.currUserFunc.varIdents.length; varIndex++)
    {
      if(this.currUserFunc.varIdents[varIndex].toLowerCase() == varIdent.toLowerCase())
        this.raiseError("Variable or array '" + varIdent + "' already declared.");
    }

    this.currUserFunc.varIdents.push(varIdent);

    varIndex = this.currUserFunc.varIdents.length - 1;
    if(this.currUserFunc == this.mainUserFunc)
      varScope = SCOPE_GLOBAL;
    else
      varScope = SCOPE_LOCAL;

    return new VariableReference(varScope, varIndex);
  }

  getNativeFuncIndex(funcIdent)
  //Return the index of the given native function identifier
  {
    funcIdent = funcIdent.toLowerCase();

    for(var funcIndex = 0; funcIndex < this.bytecode.nativeFuncs.length; funcIndex++)
    {
      if(this.bytecode.nativeFuncs[funcIndex].ident.toLowerCase() == funcIdent)
        return funcIndex;
    }

    return -1;
  }

  getUserFuncIndex(funcIdent)
  //Return the index of the given user function identifier
  {
    funcIdent = funcIdent.toLowerCase();

    for(var funcIndex = 0; funcIndex < this.bytecode.userFuncs.length; funcIndex++)
    {
      if(this.bytecode.userFuncs[funcIndex].ident.toLowerCase() == funcIdent)
        return funcIndex;
    }

    return -1;
  }

  getStructDefIndex(structDefIdent)
  //Return the index of the given structure definition identifier
  {
    structDefIdent = structDefIdent.toLowerCase();

    for(var structDefIndex = 0; structDefIndex < this.bytecode.structDefs.length; structDefIndex++)
    {
      if(this.bytecode.structDefs[structDefIndex].ident.toLowerCase() == structDefIdent)
        return structDefIndex;
    }

    return -1;
  }

  getLiteralIndex(litVal)
  //Return the index of the given literal value
  {
    var litIndex = this.bytecode.literals.indexOf(litVal);

    if(litIndex == -1)
    {
      this.bytecode.literals.push(litVal);
      litIndex = this.bytecode.literals.length - 1;
    }

    return litIndex;
  }

  getVariableReference(varIdent)
  //Return a [scope,index] reference to the given variable identifier
  {
    var varIndex;

    if(this.currUserFunc != this.mainUserFunc)
    {
      for(varIndex = 0; varIndex < this.currUserFunc.varIdents.length; varIndex++)
      {
        if(this.currUserFunc.varIdents[varIndex].toLowerCase() == varIdent.toLowerCase())
          return new VariableReference(SCOPE_LOCAL, varIndex);
      }
    }

    for(varIndex = 0; varIndex < this.mainUserFunc.varIdents.length; varIndex++)
    {
      if(this.mainUserFunc.varIdents[varIndex].toLowerCase() == varIdent.toLowerCase())
        return new VariableReference(SCOPE_GLOBAL, varIndex);
    }

    this.raiseError("Variable or array '" + varIdent + "' not declared.");
  }

  addOp(operandList)
  //Add a new bytecodce op
  {
    this.currUserFunc.ops.push(operandList);
    this.updateSourceLineMap();
    return this.opsCount() - 1;
  }

  patchJumpOp(opIndex)
  //Set the operand of the given jump op to the index of the next op to be added
  {
    this.currUserFunc.ops[opIndex][1] = this.opsCount();
  }

  addReturnOps()
  //Add bytecode ops for returning from a user function
  {
    this.addOp([OPCODE_LOAD_INT, 0]);
    this.addOp([OPCODE_RETURN]);
  }

  opsCount()
  //Return the number of ops in the current user function
  {
    return this.currUserFunc.ops.length;
  }

  matchTerminator()
  //Return true and advance to the next token if the current token is one of the statement terminators
  {
    return this.matchTokenList([TOKEN_NEWLINE, TOKEN_COLON, TOKEN_EOF]);
  }

  checkTerminator()
  //Return true if the current token is one of the statement terminators
  {
    return this.checkTokenList([TOKEN_NEWLINE, TOKEN_COLON, TOKEN_EOF]);
  }

  consumeToken()
  //Return the current token and advance to the next token
  {
    if(!this.endOfTokens())
      this.currTokenIndex++;

    return this.prevToken();
  }

  matchTokenList(tokenTypeList)
  //Return true and advance to the next token if the current token's type matches any one of the given types
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

  checkTokenList(tokenTypeList)
  //Return true if the current token's type matches any one of the given types
  {
    for(var index = 0; index < tokenTypeList.length; index++)
    {
      if(this.checkToken(tokenTypeList[index]))
        return true;
    }

    return false;
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
    return this.currTokens[this.currTokenIndex];
  }

  peekNextToken()
  //Return the token after the current token
  {
	if(!this.endOfTokens())
      return this.currTokens[this.currTokenIndex + 1];
    else
      return this.peekToken();
  }

  prevToken()
  //Return the token before the current token
  {
    return this.currTokens[this.currTokenIndex - 1];
  }

  endOfTokens()
  //Return true if the current token is the end token
  {
    return (this.peekToken().type == TOKEN_EOF)
  }

  updateSourceLineMap()
  //
  {
    var lineNum = this.peekToken().lineNum;
    var opIndex = this.opsCount() - 1;
    var map = this.currUserFunc.sourceLineMap;
    var indexRange;

    if(map.has(lineNum))
      indexRange = {startOpIndex: map.get(lineNum).startOpIndex, endOpIndex: opIndex};
    else
      indexRange = {startOpIndex: opIndex, endOpIndex: opIndex};

    map.set(lineNum, indexRange);
  }

  raiseError(message, token = null)
  //
  {
    var lineNum;

    if(token == null)
      lineNum = this.peekToken().lineNum;
    else
      lineNum = token.lineNum;

    message = "Compile error on line " + lineNum + ": " + message;

    throw {message: message, lineNum: lineNum};
  }
}
