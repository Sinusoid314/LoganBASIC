importScripts('worker_msg.js',
              'object.js',
              'std_funcs.js',
              'canvas_funcs.js',
              'token.js',
              'bytecode.js',
              'scanner.js',
              'compiler.js',
              'runtime.js');

var mainCompiler;
var mainBytecode;
var mainRuntime;

function onRuntimeDone(runtime)
//
{
  if(runtime.errorMsg == "")
	postMessage({msgId: MSGID_DONE, msgData: "Program run successfully."});
  else
	postMessage({msgId: MSGID_DONE, msgData: runtime.errorMsg});
}

onmessage = function(message)
//Process messages sent from the UI thread
{
  switch(message.data.msgId)
  {
    case MSGID_START:
      onStart(message.data.msgData);
      break;

    case MSGID_INPUT_RESULT:
      onInputResult(message.data.msgData);
      break;
  }
}

function onStart(source)
//Compile and run the program
{
  postMessage({msgId: MSGID_STATUS, msgData: "Compiling..."});
  mainCompiler = new Compiler(source, [].concat(stdNativeFuncList, canvasNativeFuncList));
  mainBytecode = mainCompiler.compile();

  //console.log(mainBytecode.toString());

  if(mainCompiler.errorMsg == "")
  {
    postMessage({msgId: MSGID_STATUS, msgData: "Running..."});
    mainRuntime = new Runtime(mainBytecode);
    mainRuntime.onDoneJsFunc = onRuntimeDone;
    mainRuntime.run();
  }
  else
  {
    postMessage({msgId: MSGID_DONE, msgData: mainCompiler.errorMsg});
  }
}

function onInputResult(inputStr)
//Process input sent from the console
{
  mainRuntime.stack[mainRuntime.stack.length - 1] = inputStr;
  mainRuntime.status = RUNTIME_STATUS_RUNNING;
  mainRuntime.run();
}
