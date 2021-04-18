importScripts('loganbasic_workermsg.js',
              'loganbasic_token.js',
              'loganbasic_lexer.js',
              'loganbasic_interpreter.js');

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
  var lexer;
  var interpreter;
  var tokenList;

  postMessage({msgId: MSGID_STATUS, msgData: "Scanning..."});
  lexer = new Lexer(sourceStr);
  tokenList = lexer.scan();

  if(lexer.errorMsg == "")
  {
    postMessage({msgId: MSGID_STATUS, msgData: "Running..."});
    interpreter = new Interpreter(tokenList);
    interpreter.run();

    if(interpreter.errorMsg == "")
    {
      postMessage({msgId: MSGID_DONE, msgData: "Program run successfully."});
    }
    else
    {
      postMessage({msgId: MSGID_DONE, msgData: interpreter.errorMsg});
    }
  }
  else
  {
    postMessage({msgId: MSGID_DONE, msgData: lexer.errorMsg});
  }
}

