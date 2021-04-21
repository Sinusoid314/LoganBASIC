importScripts('loganbasic_worker_msg.js',
              'loganbasic_token.js',
              'loganbasic_bytecode.js',
              'loganbasic_scanner.js',
              'loganbasic_parser.js',
              'loganbasic_runtime.js');

var runtime;

onmessage = function(message)
//
{
  switch(message.data.msgId)
  {
    case MSGID_START:
      onStart(message.data.msgData);
      break;
  }
}

function onStart(sourceStr)
//
{
  var scanner;
  var parser;
  var tokenList;
  var bytecode;

  postMessage({msgId: MSGID_STATUS, msgData: "Compiling..."});
  scanner = new Scanner(sourceStr);
  tokenList = scanner.scan();

  if(scanner.errorMsg == "")
  {
    parser = new Parser(tokenList);
    bytecode = parser.parse();

    if(parser.errorMsg == "")
    {
      postMessage({msgId: MSGID_STATUS, msgData: "Running..."});
      runtime = new Runtime(bytecode);
      runtime.run();

      if(runtime.errorMsg == "")
      {
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
  else
  {
    postMessage({msgId: MSGID_DONE, msgData: scanner.errorMsg});
  }
}

