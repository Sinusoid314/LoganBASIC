importScripts('./core/object.js',
              './core/token.js',
              './core/bytecode.js',
              './core/std_funcs.js',
              './core/scanner.js',
              './core/compiler.js',
              './core/vm.js');

importScripts('worker_msg.js',
              'debug.js',
              'console_funcs.js',
              'canvas_funcs.js',
              'sound_funcs.js',
              'sprite_funcs.js');

var mainVM = new VM();

mainVM.addNativeFuncArray([].concat(stdNativeFuncs, consoleNativeFuncs, canvasNativeFuncs, soundNativeFuncs, spriteNativeFuncs));
mainVM.onPrintHook = onPrint;
mainVM.onStatusChangeHook = onStatusChange;
mainVM.onErrorHook = onError;
mainVM.onRunEndHook = onRunEnd;

onmessage = progWorker_onMessage;

function resetMain()
//
{
  resetConsole();
  resetCanvas();
  resetSounds();
  resetSprites();
  
  mainVM.resetActiveRunState();
  mainVM.globals.clear();
  mainVM.error = null;
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

    case MSGID_DEBUG_START:
      onDebugStart();
      break;

    case MSGID_DEBUG_STOP:
      onDebugStop();
      break;
  
    case MSGID_DEBUG_STEP:
      onDebugStep();
      break;
    
    case MSGID_DEBUG_SKIP:
      onDebugSkip();
      break;
  }
}

function onStartProg(source)
//Compile and run the program
{
  mainVM.interpret(source);
}

function onStatusChange(vm, prevStatus)
//
{
  switch(vm.status)
  {
    case VM_STATUS_COMPILING:
      postMessage({msgId: MSGID_STATUS_CHANGE, msgData: "Compiling..."});
      break;

    case VM_STATUS_RUNNING:
      postMessage({msgId: MSGID_STATUS_CHANGE, msgData: "Running..."});
      break;
  }
}

function onError(vm)
//
{
  resetMain();
  postMessage({msgId: MSGID_PROG_DONE_ERROR, msgData: vm.error});
  return false;
}

function onRunEnd(vm)
//
{
  resetMain();
  postMessage({msgId: MSGID_PROG_DONE_SUCCESS});
}