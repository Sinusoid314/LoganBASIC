importScripts('worker_msg.js',
              'native_func.js',
              'token.js',
              'bytecode.js',
              'scanner.js',
              'compiler.js',
              'runtime.js');

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
  var scanner;
  var compiler;
  var tokenList;
  var bytecode;

  postMessage({msgId: MSGID_STATUS, msgData: "Compiling..."});
  scanner = new Scanner(sourceStr);
  tokenList = scanner.scan();

  if(scanner.errorMsg == "")
  {
    compiler = new Compiler(tokenList);
    bytecode = compiler.compile();

    if(compiler.errorMsg == "")
    {
      postMessage({msgId: MSGID_STATUS, msgData: "Running..."});
      runtime = new Runtime(bytecode);
      runtime.run();

      if(runtime.errorMsg == "")
      {
        if(!runtime.inputting)
        {
          postMessage({msgId: MSGID_DONE, msgData: "Program run successfully."});
        }
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
  else
  {
    postMessage({msgId: MSGID_DONE, msgData: scanner.errorMsg});
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
	{
	  postMessage({msgId: MSGID_DONE, msgData: "Program run successfully."});
	}
  }
  else
  {
	postMessage({msgId: MSGID_DONE, msgData: runtime.errorMsg});
  }
}
