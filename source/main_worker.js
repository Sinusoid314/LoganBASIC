importScripts('./core/object.js',
              './core/token.js',
              './core/bytecode.js',
              './core/std_funcs.js',
              './core/scanner.js',
              './core/compiler.js',
              './core/vm.js');

importScripts('worker_msg.js',
              'debug_worker.js',
              'console_worker.js',
              'canvas_worker.js',
              'sound_worker.js',
              'sprite_worker.js');

var mainVM = new VM();

mainVM.addNativeFuncArray([].concat(stdNativeFuncs, consoleNativeFuncs, canvasNativeFuncs, soundNativeFuncs, spriteNativeFuncs));
mainVM.onPrintHook = onVMPrint;
mainVM.onStatusChangeHook = onVMStatusChange;
mainVM.onErrorHook = onVMError;
mainVM.onRunEndHook = onVMRunEnd;

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
      onMsgStartProg(message.data.msgData);
      break;

    case MSGID_INPUT_RESULT:
      onMsgInputResult(message.data.msgData);
      break;

    case MSGID_IMAGE_REQUEST_RESULT:
      onMsgImageRequestResult(message.data.msgData);
      break;

    case MSGID_CANVAS_EVENT:
      onMsgCanvasEvent(message.data.msgData);
      break;

    case MSGID_DRAW_CANVAS_BUFFER_DONE:
      onMsgDrawCanvasBufferDone();
      break;

    case MSGID_SOUND_REQUEST_RESULT:
      onMsgSoundRequestResult(message.data.msgData);
      break;

    case MSGID_SPRITE_SHEET_REF_REQUEST_RESULT:
      onMsgSpriteSheetRefRequestResult(message.data.msgData);
      break;

    case MSGID_SPRITE_SHEET_REQUEST_RESULT:
      onMsgSpriteSheetRequestResult(message.data.msgData);
      break;

    case MSGID_DEBUG_START:
      onMsgDebugStart();
      break;

    case MSGID_DEBUG_STOP:
      onMsgDebugStop();
      break;
  
    case MSGID_DEBUG_STEP:
      onMsgDebugStep();
      break;
    
    case MSGID_DEBUG_SKIP:
      onMsgDebugSkip();
      break;
  }
}

function onMsgStartProg(source)
//Compile and run the program
{
  mainVM.interpret(source);
}

function onVMStatusChange(vm, prevStatus)
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

function onVMError(vm)
//
{
  resetMain();
  postMessage({msgId: MSGID_PROG_DONE_ERROR, msgData: vm.error});
  return false;
}

function onVMRunEnd(vm)
//
{
  resetMain();
  postMessage({msgId: MSGID_PROG_DONE_SUCCESS});
}