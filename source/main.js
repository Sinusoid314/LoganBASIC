importScripts('worker_msg.js',
              'native_func.js',
              'token.js',
              'bytecode.js',
              'scanner.js',
              'compiler.js',
              'runtime.js');

var mainCompiler;
var mainBytecode;
var mainRuntime;

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

function onStart(sourceStr)
//Compile and run the program
{
  postMessage({msgId: MSGID_STATUS, msgData: "Compiling..."});
  mainCompiler = new Compiler(sourceStr);
  mainBytecode = mainCompiler.compile();

  if(mainCompiler.errorMsg == "")
  {
    postMessage({msgId: MSGID_STATUS, msgData: "Running..."});
    mainRuntime = new Runtime(mainBytecode);
    mainRuntime.run();

    if(mainRuntime.errorMsg == "")
    {
      if(!mainRuntime.inputting)
        postMessage({msgId: MSGID_DONE, msgData: "Program run successfully."});
    }
    else
    {
      postMessage({msgId: MSGID_DONE, msgData: mainRuntime.errorMsg});
    }
  }
  else
  {
    postMessage({msgId: MSGID_DONE, msgData: mainCompiler.errorMsg});
  }
}

function onInputResult(inputStr)
//Process input sent from the console
{
  mainRuntime.stack.push(inputStr);
  mainRuntime.inputting = false;
  mainRuntime.run();

  if(mainRuntime.errorMsg == "")
  {
	if(!mainRuntime.inputting)
	  postMessage({msgId: MSGID_DONE, msgData: "Program run successfully."});
  }
  else
  {
	postMessage({msgId: MSGID_DONE, msgData: mainRuntime.errorMsg});
  }
}