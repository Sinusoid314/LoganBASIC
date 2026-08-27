import * as Objects from "./core/objects.js";
import * as VM from "./core/vm.js";
import * as StdFuncs from "./core/std_funcs.js";
import * as MainCommon from "./main_common.js";


export const workerOnProgEndHandlers = [];
export const workerMessageMap = new Map();
export var expectedResultMessageID = 0;
export const mainVM = new VM.VM();

export function setExpectedResultMessageID(newMessageID)
//
{
  expectedResultMessageID = newMessageID;
}


const mainNativeFuncs = [
                new Objects.ObjNativeFunc("version", 0, 0, funcVersion),
               ];

var DebugWorker, ConsoleWorker, CanvasWorker, SoundWorker, SpriteWorker;
var pendingMessages = [];

mainVM.addNativeFuncArray(StdFuncs.stdNativeFuncs);
mainVM.addNativeFuncArray(mainNativeFuncs);
              
readURLParams();

setMainWorkerEvents();

await loadWorkerComponents();


function readURLParams()
//
{
  var urlParams = new URLSearchParams(location.search);

  if(urlParams.has("mode"))
    MainCommon.setMainMode(urlParams.get("mode"));
}

function setMainWorkerEvents()
//
{
  mainVM.addEventHook(VM.VM_EVENT_STATUS_CHANGE, onVMStatusChange);
  mainVM.addEventHook(VM.VM_EVENT_ERROR, onVMError);
  
  onmessage = mainWorker_onMessage;
  
  workerMessageMap.set(MainCommon.MSGID_START_PROG, onMsgStartProg);
}

async function loadWorkerComponents()
//
{
  if(MainCommon.mainMode == MainCommon.MAIN_MODE_EDIT)
    DebugWorker = await import('./debug/debug_worker.js');

  ConsoleWorker = await import('./console/console_worker.js');
  CanvasWorker = await import('./canvas/canvas_worker.js');
  SoundWorker = await import('./sound/sound_worker.js');
  SpriteWorker = await import('./sprite/sprite_worker.js');
}

function dispatchMessage(message)
//Call the appropriate message-handling function
{
  workerMessageMap.get(message.data.msgId)(message.data.msgData);
}

function mainWorker_onProgEnd(vm)
//
{
  postMessage({msgId: MainCommon.MSGID_PROG_DONE, msgData: {error: vm.error}});
  
  workerOnProgEndHandlers.forEach(handler => handler());

  StdFuncs.resetStd();

  mainVM.resetActiveRunState();
  mainVM.globals.clear();

  expectedResultMessageID = 0;
  pendingMessages = [];
}

function mainWorker_onMessage(message)
//Process messages sent from the UI thread
{
  /*
  console.clear();
  console.log("Current Message: " + message.data.msgId);
  console.log("Expected Message: " + expectedResultMessageID);
  console.log("Pending Messages:");
  pendingMessages.forEach(msg => console.log(msg.data.msgId));
  console.log("\nStack:");
  mainVM.stack.forEach(item => console.log(item));
  */

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

  mainVM.interpret(msgData.source, MainCommon.mainSourceName);
}

function onVMStatusChange(vm, prevStatus)
//
{
  switch(vm.status)
  {
    case VM.VM_STATUS_IDLE:
      if(((prevStatus == VM.VM_STATUS_RUNNING) && (vm.callFramesEmpty())) || vm.error)
      {
        mainWorker_onProgEnd(vm);
        return;
      }

      break;

    case VM.VM_STATUS_RUNNING:
      postMessage({msgId: MainCommon.MSGID_STATUS_CHANGE, msgData: {statusText: "Running..."}});
      break;

    case VM.VM_STATUS_COMPILING:
      postMessage({msgId: MainCommon.MSGID_STATUS_CHANGE, msgData: {statusText: "Compiling..."}});
      break;
  }
}

function onVMError(vm)
//
{
  if(vm.status == VM.VM_STATUS_IDLE)
    mainWorker_onProgEnd(vm);

  return false;
}

function funcVersion(vm, args)
//Return the current Logan BASIC version
{
  return MainCommon.lbVersion;
}