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
  constructor(vm, source, sourceName, topUserFunc)
  {
    this.vm = vm;
    this.scanner = new Scanner(source, sourceName);
    this.currUserFunc = topUserFunc;
    this.hoistedOps = [];
    this.hoistedOpsJumpOpIndex = 0;
    this.prevToken = null;
    this.currToken = null;
    this.nextToken = null;
    this.exitWhileOpIndexes = [];
    this.exitForOpIndexes = [];
    this.exitDoOpIndexes = [];
  }

  compile()
  //Compile the source code string to a series of bytecode ops
  {
    var prevStatus;
    
    if(this.status == VM_STATUS_COMPILING)
      return;

    this.vm.error = null;
    this.vm.currCompiler = this;
    prevStatus = this.vm.changeStatus(VM_STATUS_COMPILING);

    try
    {
      this.initTokens();

      this.addHoistedOpsJumpOp();

      while(!this.endOfTokens())
        this.parseHoistedDeclaration();

      this.addReturnOps();

      this.addHoistedOps();
    }
    catch(error)
    {
      console.log(error);
    }

    this.vm.changeStatus(prevStatus);
    this.vm.currCompiler = null;
  }

  parseHoistedDeclaration()
  //Determine the next hoisted declaraion to parse
  {
    if(this.matchToken(TOKEN_STRUCTURE))
      this.structDecl();

    else if(this.matchToken(TOKEN_FUNCTION))
      this.funcDecl();

    else if(this.matchTokenPair(TOKEN_END, TOKEN_STRUCTURE))
      this.compileError("'end structure' without 'structure'.");

    else if(this.matchTokenPair(TOKEN_END, TOKEN_FUNCTION))
      this.compileError("'end function' without 'function'.");

    else
    {
      this.parseDeclaration();
      return;
    }

    if(!this.matchTerminator())
      this.compileError("Expected terminator after declaration.");
  }

  structDecl()
  //Parse a Structure declaration
  {
    var structDef;
    var ident;
    var litIndex;

    if(this.matchToken(TOKEN_IDENTIFIER))
      ident = this.peekPrevToken().lexeme;
    else
      this.compileError("Expected identifier.");

    if(!this.matchTerminator())
      this.compileError("Expected terminator after identifier.");

    structDef = new ObjStructureDef(ident);

    while(!this.checkTokenPair(TOKEN_END, TOKEN_STRUCTURE) && !this.endOfTokens())
    {
      if(!this.matchToken(TOKEN_IDENTIFIER))
        this.compileError("Expected identifier.");

      structDef.fieldIdents.push(this.peekPrevToken().lexeme);

      if(!this.matchTerminator())
        this.compileError("Expected terminator after identifier.");
    }

    if(!this.matchTokenPair(TOKEN_END, TOKEN_STRUCTURE))
      this.compileError("'structure' without 'end structure'.");

    litIndex = this.getLiteralIndex(structDef);
    this.addOp([OPCODE_LOAD_LIT, litIndex], true);
    this.addVariable(ident, true);
  }

  funcDecl()
  //Parse a Function declaration
  {
    var newFunc, topUserFunc, ident, litIndex;

    if(this.matchToken(TOKEN_IDENTIFIER))
      ident = this.peekPrevToken().lexeme;
    else
      this.compileError("Expected identifier.");

    topUserFunc = this.currUserFunc;
    this.currUserFunc = new ObjUserFunc(ident, this.scanner.sourceName, SOURCE_LEVEL_FUNC);

    this.parseParameters();

    while(!this.checkTokenPair(TOKEN_END, TOKEN_FUNCTION) && !this.endOfTokens())
      this.parseDeclaration();

    if(!this.matchTokenPair(TOKEN_END, TOKEN_FUNCTION))
      this.compileError("'function' without 'end function'.");

    this.addReturnOps();

    newFunc = this.currUserFunc;
    this.currUserFunc = topUserFunc;

    litIndex = this.getLiteralIndex(newFunc);
    this.addOp([OPCODE_LOAD_LIT, litIndex], true);
    this.addVariable(ident, true);
  }

  parseDeclaration()
  //Determine the next declaration statement to parse
  {
    if(this.matchToken(TOKEN_VAR))
      this.varDecl();

    else if(this.matchToken(TOKEN_ARRAY))
      this.arrayDecl();

    else
    {
      this.parseStatement();
      return;
    }

    if(!this.matchTerminator())
      this.compileError("Expected terminator after declaration.");
  }

  varDecl()
  //Parse a Var declaration
  {
    var varIdent;

    do
    {
      if(this.matchToken(TOKEN_IDENTIFIER))
        varIdent = this.peekPrevToken().lexeme;
      else
        this.compileError("Expected identifier.");

      if(this.matchToken(TOKEN_EQUAL))
        this.parseExpression();
      else
        this.addOp([OPCODE_LOAD_NOTHING]);

      this.addVariable(varIdent);
    }
    while(this.matchToken(TOKEN_COMMA));
  }

  arrayDecl()
  //Parse an Array declaration
  {
    var varIdent, dimCount;

    if(this.matchToken(TOKEN_IDENTIFIER))
      varIdent = this.peekPrevToken().lexeme;
    else
      this.compileError("Expected identifier.");

    if(!this.matchToken(TOKEN_LEFT_BRACKET))
      this.compileError("Expected '[' after identifier.");

    dimCount = this.parseArguments();
    if(dimCount == 0)
      this.compileError("Expected one or more dimension expressions.");

    if(!this.matchToken(TOKEN_RIGHT_BRACKET))
      this.compileError("Expected ']' after dimensions.");

    this.addOp([OPCODE_CREATE_ARRAY, dimCount]);

    this.addVariable(varIdent);
  }

  parseStatement(requireTerminator = true)
  //Determine the next statement to parse
  {
    if(this.matchToken(TOKEN_PRINT))
      this.printStmt();

    else if(this.matchToken(TOKEN_IF))
      this.ifStmt();

    else if(this.matchToken(TOKEN_ELSE))
      this.compileError("'else' without matching 'if' statement.");

    else if(this.matchTokenPair(TOKEN_END, TOKEN_IF))
      this.compileError("'end if' without matching 'if' statement.");

    else if(this.matchToken(TOKEN_WHILE))
      this.whileStmt();

    else if(this.matchToken(TOKEN_WEND))
      this.compileError("'wend' without matching 'while' statement.");

    else if(this.matchToken(TOKEN_FOR))
      this.forStmt();

    else if(this.matchToken(TOKEN_NEXT))
      this.compileError("'next' without matching 'for' statement.");

    else if(this.matchToken(TOKEN_END))
      this.endStmt();

    else if(this.matchToken(TOKEN_REDIM))
      this.reDimStmt();

    else if(this.matchToken(TOKEN_CLS))
      this.clsStmt();

    else if(this.matchToken(TOKEN_WHTERBTOBJ))
      this.whteRbtObjStmt();

    else if(this.matchToken(TOKEN_DO))
      this.doStmt();

    else if(this.matchTokenPair(TOKEN_LOOP, TOKEN_WHILE))
      this.compileError("'loop while' without matching 'do' statement.");

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
        this.compileError("Expected terminator after statement.");
    }
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
      this.compileError("Expected 'then' after expression.");

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
      this.compileError("Expected either 'else' or 'end if' at the end of 'if' block.");

    if(this.matchTokenPair(TOKEN_END, TOKEN_IF))
    {
      this.patchJumpOp(thenJumpOpIndex);
    }
    else if(this.matchToken(TOKEN_ELSE))
    {
        if(!this.matchTerminator())
          this.compileError("Expected terminator after 'else'.");

        elseJumpOpIndex = this.addOp([OPCODE_JUMP, 0]);
        this.patchJumpOp(thenJumpOpIndex);

        while(!this.checkTokenPair(TOKEN_END, TOKEN_IF) && !this.endOfTokens())
          this.parseStatement();

        if(!this.matchTokenPair(TOKEN_END, TOKEN_IF))
          this.compileError("Expected 'end if' at the end of 'else' block.");

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
      this.compileError("Expected terminator after expression.");

    jumpOpIndex = this.addOp([OPCODE_JUMP_IF_FALSE, 0]);

    this.exitWhileOpIndexes.push([]);

    while(!this.checkToken(TOKEN_WEND) && !this.endOfTokens())
      this.parseStatement();

    if(!this.matchToken(TOKEN_WEND))
      this.compileError("Expected 'wend' at the end of 'while' block.");

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
      this.compileError("Expected identifier after 'for'.");

    varIdent = this.peekPrevToken().lexeme;
    varRef = this.getVariableReference(varIdent);

    if(!this.matchToken(TOKEN_EQUAL))
      this.compileError("Expected '=' after identifier.");

    this.parseExpression();
    this.addOp([OPCODE_STORE_VAR, varRef.scope, varRef.index]);

    if(!this.matchToken(TOKEN_TO))
      this.compileError("Expected 'to' after start expression.");

    this.parseExpression();

    if(this.matchToken(TOKEN_STEP))
      this.parseExpression();
    else
      this.addOp([OPCODE_LOAD_INT, 1]);

    if(!this.matchTerminator())
      this.compileError("Expected terminator after expression.");

    this.addOp([OPCODE_LOAD_VAR, varRef.scope, varRef.index]);

    startOpIndex = this.opsCount();
    this.addOp([OPCODE_CHECK_COUNTER]);
    jumpOpIndex = this.addOp([OPCODE_JUMP_IF_TRUE, 0]);

    this.exitForOpIndexes.push([]);

    while(!this.checkToken(TOKEN_NEXT) && !this.endOfTokens())
      this.parseStatement();

    if(!this.matchToken(TOKEN_NEXT))
      this.compileError("Expected 'next' at the end of 'for' block.");

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      if(varIdent != this.peekPrevToken().lexeme)
        this.compileError("Identifier '" + this.peekPrevToken().lexeme + "' does not match identifier '" + varIdent + "' given in 'for' statement.");
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
      varIdent = this.peekPrevToken().lexeme;
      varRef = this.getVariableReference(varIdent);
      this.addOp([OPCODE_LOAD_VAR, varRef.scope, varRef.index]);
    }
    else
    {
      this.compileError("Expected identifier.");
    }

    if(!this.matchToken(TOKEN_LEFT_BRACKET))
      this.compileError("Expected '[' after identifier");

    dimCount = this.parseArguments();
    if(dimCount == 0)
      this.compileError("Expected one or more dimension expressions.");

    if(!this.matchToken(TOKEN_RIGHT_BRACKET))
      this.compileError("Expected ']' after indexes");

    this.addOp([OPCODE_REDIM_ARRAY, dimCount]);
  }

  clsStmt()
  //Parse a Cls statement
  {
    this.addOp([OPCODE_CLS]);
  }

  whteRbtObjStmt()
  //mr goodbytes
  {
    for(var n = 0; n < 10; n++)
    {
      this.addOp([OPCODE_LOAD_LIT, this.getLiteralIndex("Ah ah ah, you didn't say the magic word!")]);
      this.addOp([OPCODE_PRINT]);
    }
  }

  doStmt()
  //Parse a Do...Loop While statement
  {
    var startOpIndex = this.opsCount();

    if(!this.matchTerminator())
      this.compileError("Expected statement terminator after 'do'.");

    this.exitDoOpIndexes.push([]);

    while(!this.endOfTokens() && !this.checkTokenPair(TOKEN_LOOP, TOKEN_WHILE))
      this.parseStatement();

    if(!this.matchTokenPair(TOKEN_LOOP, TOKEN_WHILE))
      this.compileError("Expected 'loop while' at the end of 'do' block.");

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
      this.compileError("'exit while' outside of 'while' block.");

    jumpOpIndex = this.addOp([OPCODE_JUMP, 0]);

    this.exitWhileOpIndexes[this.exitWhileOpIndexes.length - 1].push(jumpOpIndex);
  }

  exitForStmt()
  //Parse an Exit For statement
  {
    var jumpOpIndex;

    if(this.exitForOpIndexes.length == 0)
      this.compileError("'exit for' outside of 'for' block.");

    jumpOpIndex = this.addOp([OPCODE_JUMP, 0]);

    this.exitForOpIndexes[this.exitForOpIndexes.length - 1].push(jumpOpIndex);
  }

  exitDoStmt()
  //Parse an Exit Do statement
  {
    var jumpOpIndex;

    if(this.exitDoOpIndexes.length == 0)
      this.compileError("'exit do' outside of 'do' block.");

    jumpOpIndex = this.addOp([OPCODE_JUMP, 0]);

    this.exitDoOpIndexes[this.exitDoOpIndexes.length - 1].push(jumpOpIndex);
  }

  returnStmt()
  //Parse a Return statement
  {
    if(this.currUserFunc.sourceLevel == SOURCE_LEVEL_TOP)
      this.compileError("'return' only allowed within a function.");

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
      operatorType = this.peekPrevToken().type;
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
      operatorType = this.peekPrevToken().type;
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
      operatorType = this.peekPrevToken().type;
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
      operatorType = this.peekPrevToken().type;
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
      operatorType = this.peekPrevToken().type;
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
    var fieldLitIndex;

    this.newExpr(isStmt);

    while(true)
    {
      //Function call
      if(this.matchToken(TOKEN_LEFT_PAREN))
      {
        argCount = this.parseArguments();

        if(!this.matchToken(TOKEN_RIGHT_PAREN))
          this.compileError("Expected ')' after function arguments.");

        this.addOp([OPCODE_CALL_FUNC, argCount]);
      }
      //Structure field
      else if(this.matchToken(TOKEN_DOT))
      {
        if(!this.matchToken(TOKEN_IDENTIFIER))
          this.compileError("Expected identifier after '.'.");

        fieldIdent = this.peekPrevToken().lexeme;
        fieldLitIndex = this.getLiteralIndex(fieldIdent);

        if(isStmt && this.matchToken(TOKEN_EQUAL))
        {
          this.parseExpression();
          this.addOp([OPCODE_STORE_STRUCT_FIELD_PERSIST, fieldLitIndex]);
        }
        else
        {
          this.addOp([OPCODE_LOAD_STRUCT_FIELD, fieldLitIndex]);
        }
      }
      //Array item
      else if(this.matchToken(TOKEN_LEFT_BRACKET))
      {
        argCount = this.parseArguments();

        if(!this.matchToken(TOKEN_RIGHT_BRACKET))
          this.compileError("Expected ']' after array indexes.");

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
    var litIndex;

    if(!this.matchToken(TOKEN_NEW))
    {
      this.primaryExpr(isStmt);
      return;
    }

    if(this.matchToken(TOKEN_ARRAY))
    {
      if(!this.matchToken(TOKEN_LEFT_BRACKET))
        this.compileError("Expected '[' after 'array'.");

      dimCount = this.parseArguments();

      if(dimCount == 0)
        this.compileError("Expected one or more dimension expressions.");

      if(!this.matchToken(TOKEN_RIGHT_BRACKET))
        this.compileError("Expected ']' after dimensions.");

      this.addOp([OPCODE_CREATE_ARRAY, dimCount]);
    }
    else if(this.matchToken(TOKEN_IDENTIFIER))
    {
      structDefIdent = this.peekPrevToken().lexeme;
      litIndex = this.getLiteralIndex(structDefIdent);

      this.addOp([OPCODE_CREATE_STRUCT, litIndex]);
    }
    else
    {
      this.compileError("Expected 'array' or structure identifier after 'new'.");
    }
  }

  primaryExpr(isStmt)
  //Parse a primary expression
  {
    var ident, funcIndex, varRef;
    var litVal, litIndex;

    if(this.matchToken(TOKEN_IDENTIFIER))
    {
      ident = this.peekPrevToken().lexeme;

      //Native Function
      if(this.vm.nativeFuncs.has(ident))
      {
        litIndex = this.getLiteralIndex(ident);
        this.addOp([OPCODE_LOAD_NATIVE_FUNC, litIndex]);
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
        this.addOp([OPCODE_LOAD_VAR, varRef.scope, varRef.index]);

      return;
    }

    //Literals
    if(this.matchToken(TOKEN_NOTHING))
    {
      this.addOp([OPCODE_LOAD_NOTHING]);
      return;
    }

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
      litVal = this.peekPrevToken().literal;
      litIndex = this.getLiteralIndex(litVal);
      this.addOp([OPCODE_LOAD_LIT, litIndex]);
      return;
    }

    //Nested expression
    if(this.matchToken(TOKEN_LEFT_PAREN))
    {
      this.parseExpression();

      if(!this.matchToken(TOKEN_RIGHT_PAREN))
        this.compileError("Expected ')' after expression.");

      return;
    }

    //Invalid expression
    this.compileError("Expected expression.");
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
      this.compileError("Expected '(' after function identifier.");

    if(this.matchToken(TOKEN_RIGHT_PAREN))
    {
      if(!this.matchTerminator())
        this.compileError("Expected terminator after ')'.");
      return;
    }

    do
    {
      if(!this.matchToken(TOKEN_IDENTIFIER))
        this.compileError("Expected identifier for function parameter.");

      this.addVariable(this.peekPrevToken().lexeme);
    }
    while(this.matchToken(TOKEN_COMMA));

    if(!this.matchToken(TOKEN_RIGHT_PAREN))
      this.compileError("Expected ')' after function parameters.");

    if(!this.matchTerminator())
      this.compileError("Expected terminator after ')'.");

    this.currUserFunc.paramCount = this.currUserFunc.localIdents.length;
  }

  addVariable(varIdent, hoistOp = false)
  //Add a local variable identifier to the current user function, or a definition
  //opcode if global variable
  {
    var litIndex;

    if(this.vm.nativeFuncs.has(varIdent))
      this.compileError("'" + varIdent + "' is already a built-in function.");

    if(this.currUserFunc.sourceLevel == SOURCE_LEVEL_TOP)
    {
      litIndex = this.getLiteralIndex(varIdent);
      this.addOp([OPCODE_DEFINE_GLOBAL_VAR, litIndex], hoistOp);
    }
    else
    {
      for(var varIndex = 0; varIndex < this.currUserFunc.localIdents.length; varIndex++)
      {
        if(this.currUserFunc.localIdents[varIndex] == varIdent)
          this.compileError("Variable '" + varIdent + "' already declared.");
      }
      this.currUserFunc.localIdents.push(varIdent);
    }
  }

  getLiteralIndex(litVal)
  //Return the index of the given literal value
  {
    var litIndex = this.currUserFunc.literals.indexOf(litVal);

    if(litIndex == -1)
    {
      this.currUserFunc.literals.push(litVal);
      litIndex = this.currUserFunc.literals.length - 1;
    }

    return litIndex;
  }

  getVariableReference(varIdent)
  //Return a [scope,index] reference to the given variable identifier
  {
    var varIndex, litIndex;

    //Look for local variable
    if(this.currUserFunc.sourceLevel == SOURCE_LEVEL_FUNC)
    {
      for(varIndex = 0; varIndex < this.currUserFunc.localIdents.length; varIndex++)
      {
        if(this.currUserFunc.localIdents[varIndex] == varIdent)
          return new VariableReference(SCOPE_LOCAL, varIndex);
      }
    }

    //Assume global variable
    litIndex = this.getLiteralIndex(varIdent);
    return new VariableReference(SCOPE_GLOBAL, litIndex);
  }

  addOp(operandList, hoistOp = false)
  //Add a new bytecodce op, either to the current user function,
  //or the hoisted ops array, and return the new op's index
  {
    if(hoistOp)
    {
      this.hoistedOps.push(operandList);
      return this.hoistedOps.length - 1;
    }

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

  addHoistedOpsJumpOp()
  //Add a jump op to the beginning of the root user-function's ops that jumps to the hoisted ops
  {
    this.hoistedOpsJumpOpIndex = this.addOp([OPCODE_JUMP, 0]);
  }

  addHoistedOps()
  //Add a jump-back op to the hoisted ops, back-patch the jump op at the beginning of the
  //root user-function's ops, and append the hoisted ops to the root user function's ops
  {
    this.addOp([OPCODE_JUMP, this.hoistedOpsJumpOpIndex + 1], true);
    this.patchJumpOp(this.hoistedOpsJumpOpIndex);
    this.currUserFunc.ops = this.currUserFunc.ops.concat(this.hoistedOps);
  }

  opsCount()
  //Return the number of ops in the current user function
  {
    return this.currUserFunc.ops.length;
  }

  updateSourceLineMap()
  //Include the current op index in the current source line number's index range;
  //if a range for the current source line number doesn't exist, add it to the map
  {
    var sourceLineNum = this.peekCurrToken().lineNum;
    var opIndex = this.opsCount() - 1;
    var map = this.currUserFunc.sourceLineMap;
    var opIndexRange = map.get(sourceLineNum);

    if(opIndexRange)
      opIndexRange.endIndex = opIndex;
    else
      map.set(sourceLineNum, new IndexRange(opIndex));
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

  initTokens()
  //Read in the current and next tokens
  {
    do
    {
      this.currToken = this.scanner.scanToken();
    }
    while(this.currToken.type == TOKEN_NEWLINE)

    if(this.currToken.type == TOKEN_ERROR)
      this.compileError(this.currToken.lexeme);

    this.nextToken = this.scanner.scanToken();
  }

  consumeToken()
  //Return the current token and advance to the next token
  {
    this.prevToken = this.currToken;
    this.currToken = this.nextToken;

    if(this.currToken.type == TOKEN_ERROR)
      this.compileError(this.currToken.lexeme);

    this.nextToken = this.scanner.scanToken();

    return this.prevToken;
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
    return (this.peekCurrToken().type == tokenType);
  }

  checkNextToken(tokenType)
  //Return true if the next token's type matches the given type
  {
    return (this.peekNextToken().type == tokenType);
  }

  peekCurrToken()
  //Return the current token
  {
    return this.currToken;
  }

  peekNextToken()
  //Return the token after the current token
  {
    if(!this.endOfTokens())
      return this.nextToken;
    else
      return this.peekCurrToken();
  }

  peekPrevToken()
  //Return the token before the current token
  {
    return this.prevToken;
  }

  endOfTokens()
  //Return true if the current token is the end token
  {
    return (this.peekCurrToken().type == TOKEN_EOF)
  }

  compileError(message)
  //
  {
    var sourceLineNum = this.peekCurrToken().lineNum;
    var sourceName = this.scanner.sourceName;

    message = "Compile error on line " + sourceLineNum + ": " + message;

    this.vm.error = new VMError(message, sourceLineNum, sourceName);

    if((this.vm.onErrorHook) && (this.vm.onErrorHook(this.vm, this)))
    {
      this.vm.error = null;
      return;
    }

    throw this.vm.error;
  }
}
