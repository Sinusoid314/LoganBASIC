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

var expectedResultMessageID = 0;
var pendingMessages = [];
var workerMessageMap = new Map();
var mainVM = new VM();

mainVM.addNativeFuncArray([].concat(stdNativeFuncs, consoleNativeFuncs, canvasNativeFuncs, soundNativeFuncs, spriteNativeFuncs));
mainVM.onPrintHook = onVMPrint;
mainVM.onStatusChangeHook = onVMStatusChange;
mainVM.onErrorHook = onVMError;

initworkerMessageMap();
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

  expectedResultMessageID = 0;
  pendingMessages = [];
}

function initworkerMessageMap()
//
{
  workerMessageMap.set(MSGID_START_PROG, onMsgStartProg);
  workerMessageMap.set(MSGID_INPUT_RESULT, onMsgInputResult);
  workerMessageMap.set(MSGID_IMAGE_REQUEST_RESULT, onMsgImageRequestResult);
  workerMessageMap.set(MSGID_CANVAS_EVENT, onMsgCanvasEvent);
  workerMessageMap.set(MSGID_DRAW_CANVAS_BUFFER_DONE, onMsgDrawCanvasBufferDone);
  workerMessageMap.set(MSGID_SOUND_REQUEST_RESULT, onMsgSoundRequestResult);
  workerMessageMap.set(MSGID_SPRITE_SHEET_REF_REQUEST_RESULT, onMsgSpriteSheetRefRequestResult);
  workerMessageMap.set(MSGID_SPRITE_SHEET_REQUEST_RESULT, onMsgSpriteSheetRequestResult);
  workerMessageMap.set(MSGID_DEBUG_ENABLE, onMsgDebugEnable);
  workerMessageMap.set(MSGID_DEBUG_DISABLE, onMsgDebugDisable);
  workerMessageMap.set(MSGID_DEBUG_RESUME, onMsgDebugResume);
  workerMessageMap.set(MSGID_DEBUG_STEP_INTO, onMsgDebugStepInto);
  workerMessageMap.set(MSGID_DEBUG_STEP_OVER, onMsgDebugStepOver);
  workerMessageMap.set(MSGID_DEBUG_STEP_OUT, onMsgDebugStepOut);
  workerMessageMap.set(MSGID_DEBUG_SKIP, onMsgDebugSkip);
  workerMessageMap.set(MSGID_DEBUG_CALL_FRAME_INFO_REQUEST, onMsgDebugCallFrameInfoRequest);
  workerMessageMap.set(MSGID_DEBUG_ADD_BREAKPOINT, onMsgDebugAddBreakpoint);
  workerMessageMap.set(MSGID_DEBUG_REMOVE_BREAKPOINT, onMsgDebugRemoveBreakpoint);
}

function progWorker_onMessage(message)
//Process messages sent from the UI thread
{
  console.clear();
  console.log("Current Message: " + message.data.msgId);
  console.log("Expected Message: " + expectedResultMessageID);
  console.log("Pending Messages:");
  pendingMessages.forEach(msg => console.log(msg.data.msgId));
  console.log("\nStack:");
  mainVM.stack.forEach(item => console.log(item));

  if(!expectedResultMessageID)
  {
    dispatchMessage(message);
    return;
  }

  if(message.data.msgId == expectedResultMessageID)
  {
    expectedResultMessageID = 0;

    dispatchMessage(message);
    if(expectedResultMessageID) return;

    while(pendingMessages.length)
    {
      dispatchMessage(pendingMessages.shift());
      if(expectedResultMessageID) return;
    }
  }
  else
    pendingMessages.push(message);
}

function dispatchMessage(message)
//Call the appropriate message-handling function
{
  workerMessageMap.get(message.data.msgId)(message.data.msgData);
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
      
      if((prevStatus == VM_STATUS_RUNNING) && (vm.callFramesEmpty()))
      {
        postMessage({msgId: MSGID_PROG_DONE_SUCCESS, msgData: null});
        resetMain();
        return;
      }

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
