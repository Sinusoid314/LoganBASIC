const INTERPRETER_SUCCESS = 1;
const INTERPRETER_COMPILE_ERROR = 2;
const INTERPRETER_RUNTIME_ERROR = 3;

class Interpreter
{
  constructor()
  {
    this.compiler = new Compiler();
    this.vm = new VM();

    this.vm.nativeFuncs.concat(stdNativeFuncs);
  }

  interpret(source)
  //Compile and run the given source code
  {
    this.compiler.compile(source, this.vm);

    if(this.compiler.error != null)
      return INTERPRETER_COMPILE_ERROR;

    this.vm.run();

    if(this.vm.error != null)
      return INTERPRETER_RUNTIME_ERROR;

    return INTERPRETER_SUCCESS;
  }
}