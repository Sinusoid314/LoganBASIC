import * as Objects from "../core/objects.js";
import * as VM from "../core/vm.js";
import * as MainWorker from "../main_worker.js";
import * as ConsoleCommon from "./console_common.js";


const consoleNativeFuncs = [
                  new Objects.ObjNativeFunc("showConsole", 0, 0, funcShowConsole),
                  new Objects.ObjNativeFunc("hideConsole", 0, 0, funcHideConsole),
                  new Objects.ObjNativeFunc("input", 1, 1, funcInput)
                 ];

var inputCallback = null;

MainWorker.mainVM.addNativeFuncArray(consoleNativeFuncs);

setConsoleWorkerEvents();


function setConsoleWorkerEvents()
//
{
  MainWorker.mainVM.addEventHook(VM.VM_EVENT_PRINT, onVMPrint);

  MainWorker.workerOnProgEndHandlers.push(consoleWorker_onProgEnd);

  MainWorker.workerMessageMap.set(ConsoleCommon.MSGID_INPUT_RESULT, onMsgInputResult);
}

function consoleWorker_onProgEnd()
//
{
  inputCallback = null;
}

function onMsgInputResult(msgData)
//Process input sent from the console
{
  if(!inputCallback)
    return;

  inputCallback.vm.stack.push(msgData.inputVal);
  inputCallback.resumeVM();
}

function onVMPrint(vm, printVal, replaceAll)
//
{
  if(replaceAll)
    postMessage({msgId: ConsoleCommon.MSGID_CLEAR_CONSOLE, msgData: null});
  else
    postMessage({msgId: ConsoleCommon.MSGID_PRINT, msgData: {printVal: printVal}});
}

function funcShowConsole(vm, args)
//Tell the UI thread to show the console pane
{
  postMessage({msgId: ConsoleCommon.MSGID_SHOW_CONSOLE, msgData: null});
  return null;
}

function funcHideConsole(vm, args)
//Tell the UI thread to hide the console pane
{
  postMessage({msgId: ConsoleCommon.MSGID_HIDE_CONSOLE, msgData: null});
  return null;
}

function funcInput(vm, args)
//Prompt user for input from the consol
{
  if(!inputCallback)
    inputCallback = new VM.CallbackContext(vm);
  else
    inputCallback.vm = vm;

  postMessage({msgId: ConsoleCommon.MSGID_PRINT, msgData: {printVal: args[0]}});
  postMessage({msgId: ConsoleCommon.MSGID_INPUT_REQUEST, msgData: null});

  vm.runLoopExitFlag = true;

  return undefined;
}
