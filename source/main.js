importScripts('worker_msg.js',
              'native_func.js',
              'token.js',
              'bytecode.js',
              'scanner.js',
              'compiler.js',
              'runtime.js');

var compiler;
var bytecode;
var runtime;

onmessage = function(message)
//
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
//
{
  postMessage({msgId: MSGID_STATUS, msgData: "Compiling..."});
  compiler = new Compiler(sourceStr);
  bytecode = compiler.compile();

  if(compiler.errorMsg == "")
  {
    postMessage({msgId: MSGID_STATUS, msgData: "Running..."});
    runtime = new Runtime(bytecode);
    runtime.run();

    if(runtime.errorMsg == "")
    {
      if(!runtime.inputting)
        postMessage({msgId: MSGID_DONE, msgData: "Program run successfully."});
    }
    else
    {
      postMessage({msgId: MSGID_DONE, msgData: runtime.errorMsg});
    }
  }
  else
  {
    postMessage({msgId: MSGID_DONE, msgData: parser.errorMsg});
  }
}

function onInputResult(inputStr)
//
{
  runtime.stack.push(inputStr);
  runtime.inputting = false;
  runtime.run();

  if(runtime.errorMsg == "")
  {
	if(!runtime.inputting)
	  postMessage({msgId: MSGID_DONE, msgData: "Program run successfully."});
  }
  else
  {
	postMessage({msgId: MSGID_DONE, msgData: runtime.errorMsg});
  }
}
