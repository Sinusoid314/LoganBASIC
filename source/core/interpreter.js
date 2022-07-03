const INTERPRETER_SUCCESS = 1;
const INTERPRETER_COMPILE_ERROR = 2;
const INTERPRETER_RUNTIME_ERROR = 3;

class Interpreter
{
  constructor()
  {
    this.nativeFuncs = [].concat(stdNativeFuncs);
    this.bytecode = new Bytecode();
    this.compiler = new Compiler();
    this.runtime = new Runtime();

    this.bytecode.nativeFuncs = this.nativeFuncs;
  }

  interpret(source)
  //Compile and run the given source code
  {
    this.compiler.compile(source, this.bytecode);

    if(this.compiler.error != null)
      return INTERPRETER_COMPILE_ERROR;

    this.runtime.run(this.bytecode);

    if(this.runtime.error != null)
      return INTERPRETER_RUNTIME_ERROR;

    return INTERPRETER_SUCCESS;
  }
}