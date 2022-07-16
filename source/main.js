importScripts('./core/object.js',
              './core/token.js',
              './core/bytecode.js',
              './core/std_funcs.js',
              './core/scanner.js',
              './core/compiler.js',
              './core/vm.js');

importScripts('worker_msg.js',
              'console_funcs.js',
              'canvas_funcs.js',
              'sound_funcs.js',
              'sprite_funcs.js');

var mainCompiler = new Compiler();
var mainVM = new VM();

onmessage = progWorker_onMessage;

function onVMDone(vm)
//
{
  if(vm.error == null)
    postMessage({msgId: MSGID_PROG_DONE_SUCCESS});
  else
    postMessage({msgId: MSGID_PROG_DONE_ERROR, msgData: vm.error});
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

    case MSGID_IMAGE_REQUEST_RESULT:
      onImageRequestResult(message.data.msgData);
      break;

    case MSGID_CANVAS_EVENT:
      onCanvasEvent(message.data.msgData);
      break;

    case MSGID_DRAW_CANVAS_BUFFER_DONE:
      onDrawCanvasBufferDone();
      break;

    case MSGID_SOUND_REQUEST_RESULT:
      onSoundRequestResult(message.data.msgData);
      break;

    case MSGID_SPRITE_SHEET_REF_REQUEST_RESULT:
      onSpriteSheetRefRequestResult(message.data.msgData);
      break;

    case MSGID_SPRITE_SHEET_REQUEST_RESULT:
      onSpriteSheetRequestResult(message.data.msgData);
      break;
  }
}

function onStartProg(source)
//Compile and run the program
{
  postMessage({msgId: MSGID_STATUS_CHANGE, msgData: "Compiling..."});
  mainVM.nativeFuncs.concat(stdNativeFuncs, consoleNativeFuncs, canvasNativeFuncs, soundNativeFuncs, spriteNativeFuncs);
  mainCompiler.compile(source, mainVM);

  //console.log(mainBytecode.toString());

  if(mainCompiler.error == null)
  {
    postMessage({msgId: MSGID_STATUS_CHANGE, msgData: "Running..."});
    mainVM.onPrintJsFunc = onVMPrint;
    mainVM.onDoneJsFunc = onVMDone;
    mainVM.run();
  }
  else
  {
    postMessage({msgId: MSGID_PROG_DONE_ERROR, msgData: mainCompiler.error});
  }
}

