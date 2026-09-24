import * as Objects from "./core/objects.js";
import * as VM from "./core/vm.js";
import * as StdFuncs from "./core/std_funcs.js";
import * as MainCommon from "./main_common.js";


export const workerOnProgEndHandlers = [];
export const mainVM = new VM.VM();


const mainNativeFuncs = [
                new Objects.ObjNativeFunc("version", 0, 0, funcVersion),
               ];

var ThreadMsgWorker, ProgLoadWorker, DebugWorker, ConsoleWorker, CanvasWorker, SoundWorker, SpriteWorker;


mainVM.addNativeFuncArray(StdFuncs.stdNativeFuncs);
mainVM.addNativeFuncArray(mainNativeFuncs);
              
readURLParams();

setEvents();

await loadWorkerComponents();


function readURLParams()
//
{
  var urlParams = new URLSearchParams(location.search);

  if(urlParams.has("mode"))
    MainCommon.setMainMode(urlParams.get("mode"));
}

function setEvents()
//
{
  mainVM.addEventHook(VM.VM_EVENT_STATUS_CHANGE, onVMStatusChange);
  mainVM.addEventHook(VM.VM_EVENT_ERROR, onVMError);
  
  ThreadMsgWorker.workerMessageMap.set(MainCommon.MSGID_START_PROG, onMsgStartProg);
}

async function loadWorkerComponents()
//
{
  ThreadMsgWorker = await import("./thread_msg/thread_msg_worker.js");
  ProgLoadWorker = await import("./prog_load/prog_load_worker.js");

  if(MainCommon.mainMode == MainCommon.MAIN_MODE_EDIT)
    DebugWorker = await import('./debug/debug_worker.js');

  ConsoleWorker = await import('./console/console_worker.js');
  CanvasWorker = await import('./canvas/canvas_worker.js');
  SoundWorker = await import('./sound/sound_worker.js');
  SpriteWorker = await import('./sprite/sprite_worker.js');
}

function mainWorker_onProgEnd(vm)
//
{
  postMessage({msgId: MainCommon.MSGID_PROG_DONE, msgData: {error: vm.error}});
  
  workerOnProgEndHandlers.forEach(handler => handler());

  StdFuncs.resetStd();

  mainVM.resetActiveRunState();
  mainVM.globals.clear();

  ThreadMsgWorker.reset();
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