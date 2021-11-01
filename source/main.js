importScripts('worker_msg.js',
              'object.js',
              'std_funcs.js',
              'canvas_funcs.js',
              'sound_funcs.js',
              'token.js',
              'bytecode.js',
              'scanner.js',
              'compiler.js',
              'runtime.js');

var mainCompiler;
var mainBytecode;
var mainRuntime;

onmessage = progWorker_onMessage;

function onRuntimeDone(runtime)
//
{
  if(runtime.error == null)
	postMessage({msgId: MSGID_PROG_DONE_SUCCESS});
  else
	postMessage({msgId: MSGID_PROG_DONE_ERROR, msgData: runtime.error});
}

function progWorker_onMessage(message)
//Process messages sent from the UI thread
{
  switch(message.data.msgId)
  {
    case MSGID_START_PROG:
      onStartProg(message.data.msgData);
      break;

    case MSGID_INPUT_RESULT:
      onInputResult(message.data.msgData);
      break;

    case MSGID_LOAD_IMAGE_RESULT:
      onLoadImageResult(message.data.msgData);
      break;

    case MSGID_CANVAS_EVENT:
      onCanvasEvent(message.data.msgData);
      break;

    case MSGID_DRAW_CANVAS_BUFFER_DONE:
      onDrawCanvasBufferDone();
      break;

    case MSGID_LOAD_SOUND_RESULT:
      onLoadSoundResult(message.data.msgData);
      break;

    case MSGID_GET_SOUND_POS_RESULT:
      onGetSoundPosResult(message.data.msgData);
      break;
  }
}

function onStartProg(source)
//Compile and run the program
{
  postMessage({msgId: MSGID_STATUS_CHANGE, msgData: "Compiling..."});
  mainCompiler = new Compiler(source, [].concat(stdNativeFuncs, canvasNativeFuncs, soundNativeFuncs));
  mainBytecode = mainCompiler.compile();

  //console.log(mainBytecode.toString());

  if(mainCompiler.error == null)
  {
    postMessage({msgId: MSGID_STATUS_CHANGE, msgData: "Running..."});
    mainRuntime = new Runtime(mainBytecode);
    mainRuntime.onDoneJsFunc = onRuntimeDone;
    mainRuntime.run();
  }
  else
  {
    postMessage({msgId: MSGID_PROG_DONE_ERROR, msgData: mainCompiler.error});
  }
}

