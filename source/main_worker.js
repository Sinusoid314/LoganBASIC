importScripts('./core/object.js', './core/token.js', './core/bytecode.js', './core/std_funcs.js',
              './core/scanner.js', './core/compiler.js', './core/vm.js');
importScripts('main_common.js');

var urlParams = new URLSearchParams(location.search);
var expectedResultMessageID = 0;
var pendingMessages = [];
var workerMessageMap = new Map();
var mainVM = new VM();
              
if(urlParams.has("mode"))
  mainMode = urlParams.get("mode");

mainVM.onStatusChangeHook = onVMStatusChange;
mainVM.onErrorHook = onVMError;

onmessage = progWorker_onMessage;

workerMessageMap.set(MSGID_START_PROG, onMsgStartProg);

mainVM.addNativeFuncArray(stdNativeFuncs);

loadDebugWorker();
loadConsoleWorker();
loadCanvasWorker();
loadSoundWorker();
loadSpriteWorker();


function loadDebugWorker()
//
{
  importScripts('./debug/debug_common.js');
  importScripts('./debug/debug_worker.js');
}

function loadConsoleWorker()
//
{
  importScripts('./console/console_common.js');
  importScripts('./console/console_worker.js');
}

function loadCanvasWorker()
//
{
  importScripts('./canvas/canvas_common.js');
  importScripts('./canvas/canvas_worker.js');
}

function loadSoundWorker()
//
{
  importScripts('./sound/sound_common.js');
  importScripts('./sound/sound_worker.js');
}

function loadSpriteWorker()
//
{
  importScripts('./sprite/sprite_common.js');
  importScripts('./sprite/sprite_worker.js');
}

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
        postMessage({msgId: MSGID_PROG_DONE, msgData: {}});
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
  postMessage({msgId: MSGID_PROG_DONE, msgData: {error: vm.error}});

  if(vm.status == VM_STATUS_IDLE)
    resetMain();

  return false;
}
