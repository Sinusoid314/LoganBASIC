importScripts('./core/object.js', './core/token.js', './core/bytecode.js', './core/std_funcs.js',
              './core/scanner.js', './core/compiler.js', './core/vm.js');
importScripts('main_common.js');

const mainNativeFuncs = [
                new ObjNativeFunc("version", 0, 0, funcVersion),
               ];

var workerOnProgEndHandlers = [];
var expectedResultMessageID = 0;
var pendingMessages = [];
var workerMessageMap = new Map();
var mainVM = new VM();

mainVM.addNativeFuncArray(stdNativeFuncs);
mainVM.addNativeFuncArray(mainNativeFuncs);
              
readURLParams();

setMainWorkerEvents();

loadWorkerComponents();


function readURLParams()
//
{
  var urlParams = new URLSearchParams(location.search);

  if(urlParams.has("mode"))
    mainMode = urlParams.get("mode");
}

function setMainWorkerEvents()
//
{
  mainVM.addEventHook(VM_EVENT_STATUS_CHANGE, onVMStatusChange);
  mainVM.addEventHook(VM_EVENT_ERROR, onVMError);
  
  onmessage = mainWorker_onMessage;
  
  workerMessageMap.set(MSGID_START_PROG, onMsgStartProg);
}

function loadWorkerComponents()
//
{
  if(mainMode == MAIN_MODE_EDIT)
    loadDebugWorker();

  loadConsoleWorker();
  loadCanvasWorker();
  loadSoundWorker();
  loadSpriteWorker();
}

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

function dispatchMessage(message)
//Call the appropriate message-handling function
{
  workerMessageMap.get(message.data.msgId)(message.data.msgData);
}

function mainWorker_onProgEnd(vm)
//
{
  postMessage({msgId: MSGID_PROG_DONE, msgData: {error: vm.error}});
  
  workerOnProgEndHandlers.forEach(handler => handler());

  resetStd();

  mainVM.resetActiveRunState();
  mainVM.globals.clear();

  expectedResultMessageID = 0;
  pendingMessages = [];
}

function mainWorker_onMessage(message)
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
      if(((prevStatus == VM_STATUS_RUNNING) && (vm.callFramesEmpty())) || vm.error)
      {
        mainWorker_onProgEnd(vm);
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
  if(vm.status == VM_STATUS_IDLE)
    mainWorker_onProgEnd(vm);

  return false;
}

function funcVersion(vm, args)
//Return the current Logan BASIC version
{
  return lbVersion;
}