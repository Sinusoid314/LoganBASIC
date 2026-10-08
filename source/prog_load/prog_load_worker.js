import * as VM from "./core/vm.js";
import * as StdFuncs from "./core/std_funcs.js";
import * as ThreadMsgWorker from "./thread_msg/thread_msg_worker.js";
import * as MainCommon from "../main_common.js";
import * as ProgLoadCommon from "./prog_load_common.js";


export const workerOnProgEndHandlers = [];
export const mainVM = new VM.VM();


mainVM.addNativeFuncArray(StdFuncs.stdNativeFuncs);

setEvents();


function setEvents()
//
{
  mainVM.addEventHook(VM.VM_EVENT_STATUS_CHANGE, onVMStatusChange);
  mainVM.addEventHook(VM.VM_EVENT_ERROR, onVMError);
  
  ThreadMsgWorker.workerMessageMap.set(ProgLoadCommon.MSGID_START_PROG, onMsgStartProg);
}

function endProg(vm)
//
{
  postMessage({msgId: ProgLoadCommon.MSGID_PROG_DONE, msgData: {error: vm.error}});
  
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
        endProg(vm);
        return;
      }

      break;

    case VM.VM_STATUS_RUNNING:
      postMessage({msgId: ProgLoadCommon.MSGID_STATUS_CHANGE, msgData: {statusText: "Running..."}});
      break;

    case VM.VM_STATUS_COMPILING:
      postMessage({msgId: ProgLoadCommon.MSGID_STATUS_CHANGE, msgData: {statusText: "Compiling..."}});
      break;
  }
}

function onVMError(vm)
//
{
  if(vm.status == VM.VM_STATUS_IDLE)
    endProg(vm);

  return false;
}
