importScripts('./core/object.js',
              './core/token.js',
              './core/bytecode.js',
              './core/std_funcs.js',
              './core/scanner.js',
              './core/compiler.js',
              './core/vm.js');

importScripts('thread_common.js',
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

onmessage = progWorker_onMessage;

function resetMain()
//
{ 
  resetStd();
  resetConsole();
  resetCanvas();
  resetSounds();
  resetSprites();
  resetDebug();
  
  mainVM.resetActiveRunState();
  mainVM.globals.clear();
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

    case MSGID_DEBUG_ENABLE:
      onMsgDebugEnable();
      break;

    case MSGID_DEBUG_DISABLE:
      onMsgDebugDisable();
      break;

    case MSGID_DEBUG_RESUME:
      onMsgDebugResume();
      break;

    case MSGID_DEBUG_PAUSE:
      onMsgDebugPause();
      break;

    case MSGID_DEBUG_STEP_INTO:
      onMsgDebugStepInto();
      break;

    case MSGID_DEBUG_STEP_OVER:
      onMsgDebugStepOver();
      break;

    case MSGID_DEBUG_STEP_OUT:
      onMsgDebugStepOut();
      break;
    
    case MSGID_DEBUG_SKIP:
      onMsgDebugSkip();
      break;

    case MSGID_DEBUG_CALL_FRAME_INFO_REQUEST:
      onMsgDebugCallFrameInfoRequest(message.data.msgData);
      break;

    case MSGID_DEBUG_ADD_BREAKPOINT:
      onMsgDebugAddBreakpoint(message.data.msgData);
      break;

    case MSGID_DEBUG_REMOVE_BREAKPOINT:
      onMsgDebugRemoveBreakpoint(message.data.msgData);
      break;
  }
}

function onMsgStartProg(msgData)
//Compile and run the program
{
  if(!mainVM.callFramesEmpty())
    return;

  mainVM.interpret(msgData.source, mainSourceName);
}

function onVMStatusChange(vm, prevStatus)
//
{
  switch(vm.status)
  {
    case VM_STATUS_IDLE:
      if(vm.error)
      {
        resetMain();
        return;
      }
      
      if(!(vm.callFramesEmpty() && (prevStatus == VM_STATUS_RUNNING)))
        return;

      postMessage({msgId: MSGID_PROG_DONE_SUCCESS});

      resetMain();
      break;

    case VM_STATUS_RUNNING:
      postMessage({msgId: MSGID_STATUS_CHANGE, msgData: {statusText: "Running..."}});
      break;

    case VM_STATUS_COMPILING:
      postMessage({msgId: MSGID_STATUS_CHANGE, msgData: {statusText: "Compiling..."}});
      break;
  }
}

function onVMError(vm)
//
{
  postMessage({msgId: MSGID_PROG_DONE_ERROR, msgData: {error: vm.error}});

  if(vm.status == VM_STATUS_IDLE)
    resetMain();

  return false;
}
