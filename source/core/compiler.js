import * as Token from "./token.js";
import * as Scanner from "./scanner.js";
import * as Bytecode from "./bytecode.js";
import * as Objects from "./objects.js";
import * as VM from "./wm.js";


export class Compiler
{
  constructor(vm, source, sourceName)
  {
    this.vm = vm;
    this.scanner = new Scanner.Scanner(source);
    this.sourceName = sourceName;
    this.topUserFunc = null;
    this.currUserFunc = null;
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
    
    if(this.status == VM.VM_STATUS_COMPILING)
      return;

    this.vm.error = null;
    this.vm.currCompiler = this;
    prevStatus = this.vm.changeStatus(VM.VM_STATUS_COMPILING);

    try
    {
      this.topUserFunc = new Objects.ObjUserFunc(this.sourceName, this.sourceName, Objects.SOURCE_LEVEL_TOP);
      this.currUserFunc = this.topUserFunc;

      this.initTokens();

      this.addHoistedOpsJumpOp();

      while(!this.endOfTokens())
        this.parseHoistedDeclaration();

      this.addReturnOps(false);

      this.addHoistedOps();
    }
    catch(error)
    {
      this.topUserFunc = null;
      this.currUserFunc = null;
      console.log(error);
    }

    this.vm.changeStatus(prevStatus);
    this.vm.currCompiler = null;

    return this.topUserFunc;
  }

  parseHoistedDeclaration()
  //Determine the next hoisted declaraion to parse
  {
    if(this.matchToken(Token.TOKEN_STRUCTURE))
      this.structDecl();

    else if(this.matchToken(Token.TOKEN_FUNCTION))
      this.funcDecl();

    else if(this.matchTokenPair(Token.TOKEN_END, Token.TOKEN_STRUCTURE))
      this.compileError("'end structure' without 'structure'.");

    else if(this.matchTokenPair(Token.TOKEN_END, Token.TOKEN_FUNCTION))
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

    if(this.matchToken(Token.TOKEN_IDENTIFIER))
      ident = this.peekPrevToken().lexeme;
    else
      this.compileError("Expected identifier.");

    if(!this.matchTerminator())
      this.compileError("Expected terminator after identifier.");

    structDef = new Objects.ObjStructureDef(ident);

    while(!this.checkTokenPair(Token.TOKEN_END, Token.TOKEN_STRUCTURE) && !this.endOfTokens())
    {
      if(!this.matchToken(Token.TOKEN_IDENTIFIER))
        this.compileError("Expected identifier.");

      structDef.fieldIdents.push(this.peekPrevToken().lexeme);

      if(!this.matchTerminator())
        this.compileError("Expected terminator after identifier.");
    }

    if(!this.matchTokenPair(Token.TOKEN_END, Token.TOKEN_STRUCTURE))
      this.compileError("'structure' without 'end structure'.");

    litIndex = this.getLiteralIndex(structDef);
    this.addOp([Bytecode.OPCODE_LOAD_LIT, litIndex], true);
    this.addVariable(ident, false, true);
  }

  funcDecl()
  //Parse a Function declaration
  {
    var newFunc, ident, litIndex;

    if(this.matchToken(Token.TOKEN_IDENTIFIER))
      ident = this.peekPrevToken().lexeme;
    else
      this.compileError("Expected identifier.");

    this.currUserFunc = new Objects.ObjUserFunc(ident, this.sourceName, Objects.SOURCE_LEVEL_FUNC, this.peekPrevToken().lineNum);

    this.parseParameters();

    while(!this.checkTokenPair(Token.TOKEN_END, Token.TOKEN_FUNCTION) && !this.endOfTokens())
      this.parseDeclaration();

    if(!this.matchTokenPair(Token.TOKEN_END, Token.TOKEN_FUNCTION))
      this.compileError("'function' without 'end function'.");

    this.addReturnOps(false);

    newFunc = this.currUserFunc;
    this.currUserFunc = this.topUserFunc;

    litIndex = this.getLiteralIndex(newFunc);
    this.addOp([Bytecode.OPCODE_LOAD_LIT, litIndex], true);
    this.addVariable(ident, false, true);
  }

  parseDeclaration()
  //Determine the next declaration statement to parse
  {
    if(this.matchToken(Token.TOKEN_VAR))
      this.varDecl();

    else if(this.matchToken(Token.TOKEN_ARRAY))
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
      if(this.matchToken(Token.TOKEN_IDENTIFIER))
        varIdent = this.peekPrevToken().lexeme;
      else
        this.compileError("Expected identifier.");

      if(this.matchToken(Token.TOKEN_EQUAL))
        this.parseExpression();
      else
        this.addOp([Bytecode.OPCODE_LOAD_NOTHING]);

      this.addVariable(varIdent, false);
    }
    while(this.matchToken(Token.TOKEN_COMMA));
  }

  arrayDecl()
  //Parse an Array declaration
  {
    var varIdent, dimCount;

    if(this.matchToken(Token.TOKEN_IDENTIFIER))
      varIdent = this.peekPrevToken().lexeme;
    else
      this.compileError("Expected identifier.");

    if(!this.matchToken(Token.TOKEN_LEFT_BRACKET))
      this.compileError("Expected '[' after identifier.");

    dimCount = this.parseArguments();
    if(dimCount == 0)
      this.compileError("Expected one or more dimension expressions.");

    if(!this.matchToken(Token.TOKEN_RIGHT_BRACKET))
      this.compileError("Expected ']' after dimensions.");

    this.addOp([Bytecode.OPCODE_CREATE_ARRAY, dimCount]);

    this.addVariable(varIdent, false);
  }

  parseStatement(requireTerminator = true)
  //Determine the next statement to parse
  {
    if(this.matchToken(Token.TOKEN_PRINT))
      this.printStmt();

    else if(this.matchToken(Token.TOKEN_IF))
      this.ifStmt();

    else if(this.matchToken(Token.TOKEN_ELSE))
      this.compileError("'else' without matching 'if' statement.");

    else if(this.matchTokenPair(Token.TOKEN_END, Token.TOKEN_IF))
      this.compileError("'end if' without matching 'if' statement.");

    else if(this.matchToken(Token.TOKEN_WHILE))
      this.whileStmt();

    else if(this.matchToken(Token.TOKEN_WEND))
      this.compileError("'wend' without matching 'while' statement.");

    else if(this.matchToken(Token.TOKEN_FOR))
      this.forStmt();

    else if(this.matchToken(Token.TOKEN_NEXT))
      this.compileError("'next' without matching 'for' statement.");

    else if(this.matchToken(Token.TOKEN_END))
      this.endStmt();

    else if(this.matchToken(Token.TOKEN_REDIM))
      this.reDimStmt();

    else if(this.matchToken(Token.TOKEN_CLS))
      this.clsStmt();

    else if(this.matchToken(Token.TOKEN_WHTERBTOBJ))
      this.whteRbtObjStmt();

    else if(this.matchToken(Token.TOKEN_DO))
      this.doStmt();

    else if(this.matchTokenPair(Token.TOKEN_LOOP, Token.TOKEN_WHILE))
      this.compileError("'loop while' without matching 'do' statement.");

    else if(this.matchTokenPair(Token.TOKEN_EXIT, Token.TOKEN_WHILE))
      this.exitWhileStmt();

    else if(this.matchTokenPair(Token.TOKEN_EXIT, Token.TOKEN_FOR))
      this.exitForStmt();

    else if(this.matchTokenPair(Token.TOKEN_EXIT, Token.TOKEN_DO))
      this.exitDoStmt();

    else if(this.matchToken(Token.TOKEN_RETURN))
      this.returnStmt();

    else if(this.matchToken(Token.TOKEN_WAIT))
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
    this.addOp([Bytecode.OPCODE_POP]);
  }

  printStmt()
  //Parse a Print statement
  {
    this.parseExpression();
    this.addOp([Bytecode.OPCODE_PRINT]);
  }

  ifStmt()
  //Parse an If...Then statement
  {
    var thenJumpOpIndex;
    var elseJumpOpIndex;

    this.parseExpression();

    thenJumpOpIndex = this.addOp([Bytecode.OPCODE_JUMP_IF_FALSE, 0]);

    if(!this.matchToken(Token.TOKEN_THEN))
      this.compileError("Expected 'then' after expression.");

    if(!this.matchTerminator())
    {
      this.parseStatement(false);
      this.patchJumpOp(thenJumpOpIndex);
      return;
    }

    while(!this.checkTokenPair(Token.TOKEN_END, Token.TOKEN_IF) && !this.checkToken(Token.TOKEN_ELSE)
          && !this.endOfTokens())
      this.parseStatement();

    if(this.endOfTokens())
      this.compileError("Expected either 'else' or 'end if' at the end of 'if' block.");

    if(this.matchTokenPair(Token.TOKEN_END, Token.TOKEN_IF))
    {
      this.patchJumpOp(thenJumpOpIndex);
    }
    else if(this.matchToken(Token.TOKEN_ELSE))
    {
        elseJumpOpIndex = this.addOp([Bytecode.OPCODE_JUMP, 0]);
        this.patchJumpOp(thenJumpOpIndex);

        if(!this.matchTerminator())
          this.compileError("Expected terminator after 'else'.");

        while(!this.checkTokenPair(Token.TOKEN_END, Token.TOKEN_IF) && !this.endOfTokens())
          this.parseStatement();

        if(!this.matchTokenPair(Token.TOKEN_END, Token.TOKEN_IF))
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

    jumpOpIndex = this.addOp([Bytecode.OPCODE_JUMP_IF_FALSE, 0]);

    this.exitWhileOpIndexes.push([]);

    if(!this.matchTerminator())
      this.compileError("Expected terminator after expression.");

    while(!this.checkToken(Token.TOKEN_WEND) && !this.endOfTokens())
      this.parseStatement();

    if(!this.matchToken(Token.TOKEN_WEND))
      this.compileError("Expected 'wend' at the end of 'while' block.");

    this.addOp([Bytecode.OPCODE_JUMP, startOpIndex]);
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

    if(!this.matchToken(Token.TOKEN_IDENTIFIER))
      this.compileError("Expected identifier after 'for'.");

    varIdent = this.peekPrevToken().lexeme;
    varRef = this.getVariableReference(varIdent);

    if(!this.matchToken(Token.TOKEN_EQUAL))
      this.compileError("Expected '=' after identifier.");

    this.parseExpression();
    this.addOp([Bytecode.OPCODE_STORE_VAR, varRef.scope, varRef.index]);

    if(!this.matchToken(Token.TOKEN_TO))
      this.compileError("Expected 'to' after start expression.");

    this.parseExpression();

    if(this.matchToken(Token.TOKEN_STEP))
      this.parseExpression();
    else
      this.addOp([Bytecode.OPCODE_LOAD_INT, 1]);

    this.addOp([Bytecode.OPCODE_LOAD_VAR, varRef.scope, varRef.index]);

    startOpIndex = this.opsCount();
    this.addOp([Bytecode.OPCODE_CHECK_COUNTER]);
    jumpOpIndex = this.addOp([Bytecode.OPCODE_JUMP_IF_TRUE, 0]);

    this.exitForOpIndexes.push([]);

    if(!this.matchTerminator())
      this.compileError("Expected terminator after expression.");

    while(!this.checkToken(Token.TOKEN_NEXT) && !this.endOfTokens())
      this.parseStatement();

    if(!this.matchToken(Token.TOKEN_NEXT))
      this.compileError("Expected 'next' at the end of 'for' block.");

    if(this.matchToken(Token.TOKEN_IDENTIFIER))
    {
      if(varIdent != this.peekPrevToken().lexeme)
        this.compileError("Identifier '" + this.peekPrevToken().lexeme + "' does not match identifier '" + varIdent + "' given in 'for' statement.");
    }

    this.addOp([Bytecode.OPCODE_INCREMENT_COUNTER]);
    this.addOp([Bytecode.OPCODE_STORE_VAR_PERSIST, varRef.scope, varRef.index]);
    this.addOp([Bytecode.OPCODE_JUMP, startOpIndex]);
    this.patchJumpOp(jumpOpIndex);

    for(var n = 0; n < this.exitForOpIndexes[this.exitForOpIndexes.length - 1].length; n++)
      this.patchJumpOp(this.exitForOpIndexes[this.exitForOpIndexes.length - 1][n]);
    this.exitForOpIndexes.pop();

    this.addOp([Bytecode.OPCODE_POP]);
    this.addOp([Bytecode.OPCODE_POP]);
    this.addOp([Bytecode.OPCODE_POP]);
  }

  endStmt()
  //Parse an End statement
  {
    this.addOp([Bytecode.OPCODE_END]);
  }

  reDimStmt()
  //Parse a Redim statement
  {
    var varIdent, varRef, dimCount;

    if(this.matchToken(Token.TOKEN_IDENTIFIER))
    {
      varIdent = this.peekPrevToken().lexeme;
      varRef = this.getVariableReference(varIdent);
      this.addOp([Bytecode.OPCODE_LOAD_VAR, varRef.scope, varRef.index]);
    }
    else
    {
      this.compileError("Expected identifier.");
    }

    if(!this.matchToken(Token.TOKEN_LEFT_BRACKET))
      this.compileError("Expected '[' after identifier");

    dimCount = this.parseArguments();
    if(dimCount == 0)
      this.compileError("Expected one or more dimension expressions.");

    if(!this.matchToken(Token.TOKEN_RIGHT_BRACKET))
      this.compileError("Expected ']' after indexes");

    this.addOp([Bytecode.OPCODE_REDIM_ARRAY, dimCount]);
  }

  clsStmt()
  //Parse a Cls statement
  {
    this.addOp([Bytecode.OPCODE_CLS]);
  }

  whteRbtObjStmt()
  //mr goodbytes
  {
    for(var n = 0; n < 10; n++)
    {
      this.addOp([Bytecode.OPCODE_LOAD_LIT, this.getLiteralIndex("Ah ah ah, you didn't say the magic word!")]);
      this.addOp([Bytecode.OPCODE_PRINT]);
    }
  }

  doStmt()
  //Parse a Do...Loop While statement
  {
    var startOpIndex = this.opsCount();

    if(!this.matchTerminator())
      this.compileError("Expected statement terminator after 'do'.");

    this.exitDoOpIndexes.push([]);

    while(!this.endOfTokens() && !this.checkTokenPair(Token.TOKEN_LOOP, Token.TOKEN_WHILE))
      this.parseStatement();

    if(!this.matchTokenPair(Token.TOKEN_LOOP, Token.TOKEN_WHILE))
      this.compileError("Expected 'loop while' at the end of 'do' block.");

    this.parseExpression();
    this.addOp([Bytecode.OPCODE_JUMP_IF_TRUE, startOpIndex]);

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

    jumpOpIndex = this.addOp([Bytecode.OPCODE_JUMP, 0]);

    this.exitWhileOpIndexes[this.exitWhileOpIndexes.length - 1].push(jumpOpIndex);
  }

  exitForStmt()
  //Parse an Exit For statement
  {
    var jumpOpIndex;

    if(this.exitForOpIndexes.length == 0)
      this.compileError("'exit for' outside of 'for' block.");

    jumpOpIndex = this.addOp([Bytecode.OPCODE_JUMP, 0]);

    this.exitForOpIndexes[this.exitForOpIndexes.length - 1].push(jumpOpIndex);
  }

  exitDoStmt()
  //Parse an Exit Do statement
  {
    var jumpOpIndex;

    if(this.exitDoOpIndexes.length == 0)
      this.compileError("'exit do' outside of 'do' block.");

    jumpOpIndex = this.addOp([Bytecode.OPCODE_JUMP, 0]);

    this.exitDoOpIndexes[this.exitDoOpIndexes.length - 1].push(jumpOpIndex);
  }

  returnStmt()
  //Parse a Return statement
  {
    if(this.currUserFunc.sourceLevel == Objects.SOURCE_LEVEL_TOP)
      this.compileError("'return' only allowed within a function.");

    if(this.checkTerminator())
    {
      this.addReturnOps(true);
    }
    else
    {
      this.parseExpression();
      this.addOp([Bytecode.OPCODE_RETURN]);
    }
  }

  waitStmt()
  //Parse a Wait statement
  {
    var pauseOpIndex;

    pauseOpIndex = this.addOp([Bytecode.OPCODE_PAUSE]);
    this.addOp([Bytecode.OPCODE_JUMP, pauseOpIndex]);
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

    while(this.matchToken(Token.TOKEN_OR))
    {
      jumpOpIndex = this.addOp([Bytecode.OPCODE_JUMP_IF_TRUE_PERSIST, 0]);
      this.addOp([Bytecode.OPCODE_POP]);

      this.logicAndExpr(isStmt);

      this.patchJumpOp(jumpOpIndex);
    }
  }

  logicAndExpr(isStmt)
  //Parse a Logical AND expression
  {
    var jumpOpIndex;

    this.equalityExpr(isStmt);

    while(this.matchToken(Token.TOKEN_AND))
    {
      jumpOpIndex = this.addOp([Bytecode.OPCODE_JUMP_IF_FALSE_PERSIST, 0]);
      this.addOp([Bytecode.OPCODE_POP]);

      this.equalityExpr(isStmt);

      this.patchJumpOp(jumpOpIndex);
    }
  }

  equalityExpr(isStmt)
  //Parse an equality expression
  {
    var operatorType;

    this.comparisonExpr(isStmt);

    while(this.matchTokenList([Token.TOKEN_EQUAL, Token.TOKEN_NOT_EQUAL]))
    {
      operatorType = this.peekPrevToken().type;
      this.comparisonExpr(isStmt);

      switch(operatorType)
      {
        case Token.TOKEN_EQUAL:
          this.addOp([Bytecode.OPCODE_EQUAL]);
          break;

        case Token.TOKEN_NOT_EQUAL:
          this.addOp([Bytecode.OPCODE_EQUAL]);
          this.addOp([Bytecode.OPCODE_NOT]);
          break;
      }
    }
  }

  comparisonExpr(isStmt)
  //Parse a comparison expression
  {
    var operatorType;

    this.termExpr(isStmt);

    while(this.matchTokenList([Token.TOKEN_GREATER, Token.TOKEN_GREATER_EQUAL, Token.TOKEN_LESS, Token.TOKEN_LESS_EQUAL]))
    {
      operatorType = this.peekPrevToken().type;
      this.termExpr(isStmt);

      switch(operatorType)
      {
        case Token.TOKEN_GREATER:
          this.addOp([Bytecode.OPCODE_GREATER]);
          break;

        case Token.TOKEN_GREATER_EQUAL:
          this.addOp([Bytecode.OPCODE_LESS]);
          this.addOp([Bytecode.OPCODE_NOT]);
          break;

        case Token.TOKEN_LESS:
          this.addOp([Bytecode.OPCODE_LESS]);
          break;

        case Token.TOKEN_LESS_EQUAL:
          this.addOp([Bytecode.OPCODE_GREATER]);
          this.addOp([Bytecode.OPCODE_NOT]);
          break;
      }
    }
  }

  termExpr(isStmt)
  //Parse an addition/substraction expression
  {
    var operatorType;

    this.factorExpr(isStmt);

    while(this.matchTokenList([Token.TOKEN_MINUS, Token.TOKEN_PLUS]))
    {
      operatorType = this.peekPrevToken().type;
      this.factorExpr(isStmt);

      switch(operatorType)
      {
        case Token.TOKEN_MINUS: this.addOp([Bytecode.OPCODE_SUB]); break;
        case Token.TOKEN_PLUS: this.addOp([Bytecode.OPCODE_ADD]); break;
      }
    }
  }

  factorExpr(isStmt)
  //Parse a multiplication/division/modulo expression
  {
    var operatorType;

    this.powerExpr(isStmt);

    while(this.matchTokenList([Token.TOKEN_SLASH, Token.TOKEN_STAR, Token.TOKEN_PERCENT]))
    {
      operatorType = this.peekPrevToken().type;
      this.powerExpr(isStmt);

      switch(operatorType)
      {
        case Token.TOKEN_SLASH: this.addOp([Bytecode.OPCODE_DIV]); break;
        case Token.TOKEN_STAR: this.addOp([Bytecode.OPCODE_MUL]); break;
        case Token.TOKEN_PERCENT: this.addOp([Bytecode.OPCODE_MOD]); break;
      }
    }
  }

  powerExpr(isStmt)
  //Parse an exponentiation (power) expression
  {
    this.unaryExpr(isStmt);

    while(this.matchToken(Token.TOKEN_CARET))
    {
      this.unaryExpr(isStmt);
      this.addOp([Bytecode.OPCODE_POW]);
    }
  }

  unaryExpr(isStmt)
  //Parse a unary expression
  {
    var operatorType;

    if(this.matchTokenList([Token.TOKEN_MINUS, Token.TOKEN_NOT]))
    {
      operatorType = this.peekPrevToken().type;
      this.unaryExpr(isStmt);

      switch(operatorType)
      {
        case Token.TOKEN_MINUS: this.addOp([Bytecode.OPCODE_NEGATE]); break;
        case Token.TOKEN_NOT: this.addOp([Bytecode.OPCODE_NOT]); break;
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
      if(this.matchToken(Token.TOKEN_LEFT_PAREN))
      {
        argCount = this.parseArguments();

        if(!this.matchToken(Token.TOKEN_RIGHT_PAREN))
          this.compileError("Expected ')' after function arguments.");

        this.addOp([Bytecode.OPCODE_CALL_FUNC, argCount]);
      }
      //Structure field
      else if(this.matchToken(Token.TOKEN_DOT))
      {
        if(!this.matchToken(Token.TOKEN_IDENTIFIER))
          this.compileError("Expected identifier after '.'.");

        fieldIdent = this.peekPrevToken().lexeme;
        fieldLitIndex = this.getLiteralIndex(fieldIdent);

        if(isStmt && this.matchToken(Token.TOKEN_EQUAL))
        {
          this.parseExpression();
          this.addOp([Bytecode.OPCODE_STORE_STRUCT_FIELD_PERSIST, fieldLitIndex]);
        }
        else
        {
          this.addOp([Bytecode.OPCODE_LOAD_STRUCT_FIELD, fieldLitIndex]);
        }
      }
      //Array item
      else if(this.matchToken(Token.TOKEN_LEFT_BRACKET))
      {
        argCount = this.parseArguments();

        if(!this.matchToken(Token.TOKEN_RIGHT_BRACKET))
          this.compileError("Expected ']' after array indexes.");

        if(isStmt && this.matchToken(Token.TOKEN_EQUAL))
        {
          this.parseExpression();
          this.addOp([Bytecode.OPCODE_STORE_ARRAY_ITEM_PERSIST, argCount]);
        }
        else
        {
          this.addOp([Bytecode.OPCODE_LOAD_ARRAY_ITEM, argCount]);
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

    if(!this.matchToken(Token.TOKEN_NEW))
    {
      this.primaryExpr(isStmt);
      return;
    }

    if(this.matchToken(Token.TOKEN_ARRAY))
    {
      if(!this.matchToken(Token.TOKEN_LEFT_BRACKET))
        this.compileError("Expected '[' after 'array'.");

      dimCount = this.parseArguments();

      if(dimCount == 0)
        this.compileError("Expected one or more dimension expressions.");

      if(!this.matchToken(Token.TOKEN_RIGHT_BRACKET))
        this.compileError("Expected ']' after dimensions.");

      this.addOp([Bytecode.OPCODE_CREATE_ARRAY, dimCount]);
    }
    else if(this.matchToken(Token.TOKEN_IDENTIFIER))
    {
      structDefIdent = this.peekPrevToken().lexeme;
      litIndex = this.getLiteralIndex(structDefIdent);

      this.addOp([Bytecode.OPCODE_CREATE_STRUCT, litIndex]);
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

    if(this.matchToken(Token.TOKEN_IDENTIFIER))
    {
      ident = this.peekPrevToken().lexeme;

      //Native Function
      if(this.vm.nativeFuncs.has(ident))
      {
        litIndex = this.getLiteralIndex(ident);
        this.addOp([Bytecode.OPCODE_LOAD_NATIVE_FUNC, litIndex]);
        return;
      }

      //Variable
      varRef = this.getVariableReference(ident);
      if(isStmt && this.matchToken(Token.TOKEN_EQUAL))
      {
        this.parseExpression();
        this.addOp([Bytecode.OPCODE_STORE_VAR_PERSIST, varRef.scope, varRef.index]);
      }
      else
        this.addOp([Bytecode.OPCODE_LOAD_VAR, varRef.scope, varRef.index]);

      return;
    }

    //Literals
    if(this.matchToken(Token.TOKEN_NOTHING))
    {
      this.addOp([Bytecode.OPCODE_LOAD_NOTHING]);
      return;
    }

    if(this.matchToken(Token.TOKEN_TRUE))
    {
      this.addOp([Bytecode.OPCODE_LOAD_TRUE]);
      return;
    }

    if(this.matchToken(Token.TOKEN_FALSE))
    {
      this.addOp([Bytecode.OPCODE_LOAD_FALSE]);
      return;
    }

    if(this.matchTokenList([Token.TOKEN_STRING_LIT, Token.TOKEN_NUMBER_LIT]))
    {
      litVal = this.peekPrevToken().literal;
      litIndex = this.getLiteralIndex(litVal);
      this.addOp([Bytecode.OPCODE_LOAD_LIT, litIndex]);
      return;
    }

    //Nested expression
    if(this.matchToken(Token.TOKEN_LEFT_PAREN))
    {
      this.parseExpression();

      if(!this.matchToken(Token.TOKEN_RIGHT_PAREN))
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

    if(this.checkToken(Token.TOKEN_RIGHT_PAREN))
      return argCount;

    do
    {
      this.parseExpression()
      argCount++;
    }
    while(this.matchToken(Token.TOKEN_COMMA));

    return argCount;
  }

  parseParameters()
  //Parse a comma-seperated list of identifiers surrounded in parentheses
  {
    if(!this.matchToken(Token.TOKEN_LEFT_PAREN))
      this.compileError("Expected '(' after function identifier.");

    if(this.matchToken(Token.TOKEN_RIGHT_PAREN))
    {
      if(!this.matchTerminator())
        this.compileError("Expected terminator after ')'.");
      return;
    }

    do
    {
      if(!this.matchToken(Token.TOKEN_IDENTIFIER))
        this.compileError("Expected identifier for function parameter.");

      this.addVariable(this.peekPrevToken().lexeme, true);
    }
    while(this.matchToken(Token.TOKEN_COMMA));

    if(!this.matchToken(Token.TOKEN_RIGHT_PAREN))
      this.compileError("Expected ')' after function parameters.");

    if(!this.matchTerminator())
      this.compileError("Expected terminator after ')'.");

    this.currUserFunc.paramCount = this.currUserFunc.localIdents.length;
  }

  addVariable(varIdent, isParameter, hoistOp = false)
  //Add a local variable identifier and definition opcocde to the current user function,
  //or a definition opcode if global variable
  {
    var litIndex;

    if(this.vm.nativeFuncs.has(varIdent))
      this.compileError("'" + varIdent + "' is already a built-in function.");

    if(this.currUserFunc.sourceLevel == Objects.SOURCE_LEVEL_TOP)
    {
      litIndex = this.getLiteralIndex(varIdent);
      this.addOp([Bytecode.OPCODE_DEFINE_GLOBAL_VAR, litIndex], hoistOp);
    }
    else
    {
      if(this.currUserFunc.localIdents.includes(varIdent))
        this.compileError("Variable '" + varIdent + "' already declared.");
  
      this.currUserFunc.localIdents.push(varIdent);

      if(!isParameter)
        this.addOp([Bytecode.OPCODE_DEFINE_LOCAL_VAR], hoistOp);
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
    if(this.currUserFunc.sourceLevel == Objects.SOURCE_LEVEL_FUNC)
    {
      for(varIndex = 0; varIndex < this.currUserFunc.localIdents.length; varIndex++)
      {
        if(this.currUserFunc.localIdents[varIndex] == varIdent)
          return new VariableReference(Bytecode.SCOPE_LOCAL, varIndex);
      }
    }

    //Assume global variable
    litIndex = this.getLiteralIndex(varIdent);
    return new VariableReference(Bytecode.SCOPE_GLOBAL, litIndex);
  }

  addOp(operandList, hoistOp = false, hasSourceLine = true)
  //Add a new bytecodce op, either to the current user function,
  //or the hoisted ops array, and return the new op's index
  {
    if(hoistOp)
    {
      this.hoistedOps.push(operandList);
      return this.hoistedOps.length - 1;
    }

    this.currUserFunc.ops.push(operandList);
    
    if(hasSourceLine)
      this.updateSourceLineMap();
    
    return this.opsCount() - 1;
  }

  patchJumpOp(opIndex)
  //Set the operand of the given jump op to the index of the next op to be added
  {
    this.currUserFunc.ops[opIndex][1] = this.opsCount();
  }

  addReturnOps(hasSourceLine)
  //Add bytecode ops for returning from a user function
  {
    this.addOp([Bytecode.OPCODE_LOAD_NOTHING], false, hasSourceLine);
    this.addOp([Bytecode.OPCODE_RETURN], false, hasSourceLine);
  }

  addHoistedOpsJumpOp()
  //Add a jump op to the beginning of the root user-function's ops that jumps to the hoisted ops
  {
    this.hoistedOpsJumpOpIndex = this.addOp([Bytecode.OPCODE_JUMP, 0], false, false);
  }

  addHoistedOps()
  //Add a jump-back op to the hoisted ops, back-patch the jump op at the beginning of the
  //root user-function's ops, and append the hoisted ops to the root user function's ops
  {
    this.addOp([Bytecode.OPCODE_JUMP, this.hoistedOpsJumpOpIndex + 1], true);
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
      map.set(sourceLineNum, new Bytecode.IndexRange(opIndex));
  }

  matchTerminator()
  //Return true and advance to the next token if the current token is one of the statement terminators
  {
    return this.matchTokenList([Token.TOKEN_NEWLINE, Token.TOKEN_COLON, Token.TOKEN_EOF]);
  }

  checkTerminator()
  //Return true if the current token is one of the statement terminators
  {
    return this.checkTokenList([Token.TOKEN_NEWLINE, Token.TOKEN_COLON, Token.TOKEN_EOF]);
  }

  initTokens()
  //Read in the current and next tokens
  {
    do
    {
      this.currToken = this.scanner.scanToken();
    }
    while(this.currToken.type == Token.TOKEN_NEWLINE)

    if(this.currToken.type == Token.TOKEN_ERROR)
      this.compileError(this.currToken.lexeme);

    this.nextToken = this.scanner.scanToken();
  }

  consumeToken()
  //Return the current token and advance to the next token
  {
    this.prevToken = this.currToken;
    this.currToken = this.nextToken;

    if(this.currToken.type == Token.TOKEN_ERROR)
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
    return (this.peekCurrToken().type == Token.TOKEN_EOF)
  }

  compileError(message)
  //
  {
    var sourceLineNum = this.peekCurrToken().lineNum;

    message = "Compile error on line " + sourceLineNum + ": " + message;

    this.vm.error = new VM.VMError(message, sourceLineNum, this.sourceName);

    this.vm.eventHooks.get(VM.VM_EVENT_ERROR).forEach(hook => hook(this.vm));

    throw this.vm.error;
  }
}


class VariableReference
{
  constructor(scope, index)
  {
    this.scope = scope;
    this.index = index;
  }
}