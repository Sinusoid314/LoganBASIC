const consoleNativeFuncs = [
                  new ObjNativeFunc("showConsole", 0, 0, funcShowConsole),
                  new ObjNativeFunc("hideConsole", 0, 0, funcHideConsole),
                  new ObjNativeFunc("input", 1, 1, funcInput)
                 ];

var inputCallback = null;

mainVM.onPrintHook = onVMPrint;

workerMessageMap.set(MSGID_INPUT_RESULT, onMsgInputResult);

mainVM.addNativeFuncArray(consoleNativeFuncs);


function resetConsole()
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
    postMessage({msgId: MSGID_CLEAR_CONSOLE, msgData: null});
  else
    postMessage({msgId: MSGID_PRINT, msgData: {printVal: printVal}});
}

function funcShowConsole(vm, args)
//Tell the UI thread to show the console pane
{
  postMessage({msgId: MSGID_SHOW_CONSOLE, msgData: null});
  return null;
}

function funcHideConsole(vm, args)
//Tell the UI thread to hide the console pane
{
  postMessage({msgId: MSGID_HIDE_CONSOLE, msgData: null});
  return null;
}

function funcInput(vm, args)
//Prompt user for input from the consol
{
  if(!inputCallback)
    inputCallback = new CallbackContext(vm);
  else
    inputCallback.vm = vm;

  postMessage({msgId: MSGID_PRINT, msgData: {printVal: args[0]}});
  postMessage({msgId: MSGID_INPUT_REQUEST, msgData: null});

  vm.runLoopExitFlag = true;

  return undefined;
}
