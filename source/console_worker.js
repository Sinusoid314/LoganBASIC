const consoleNativeFuncs = [
                  new ObjNativeFunc("showEditor", 0, 0, funcShowEditor),
                  new ObjNativeFunc("hideEditor", 0, 0, funcHideEditor),
                  new ObjNativeFunc("showConsole", 0, 0, funcShowConsole),
                  new ObjNativeFunc("hideConsole", 0, 0, funcHideConsole),
                  new ObjNativeFunc("input", 1, 1, funcInput)
                 ];

var inputCallback = null;

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
  inputCallback.runFunc();
}

function onVMPrint(vm, printVal, replaceAll)
//
{
  if(replaceAll)
    postMessage({msgId: MSGID_CLEAR_CONSOLE});
  else
    postMessage({msgId: MSGID_PRINT, msgData: {printVal: printVal}});
}

function funcShowEditor(vm, args)
//Tell the UI thread to show the program editor pane
{
  postMessage({msgId: MSGID_SHOW_EDITOR});
  return null;
}

function funcHideEditor(vm, args)
//Tell the UI thread to hide the program editor pane
{
  postMessage({msgId: MSGID_HIDE_EDITOR});
  return null;
}

function funcShowConsole(vm, args)
//Tell the UI thread to show the console pane
{
  postMessage({msgId: MSGID_SHOW_CONSOLE});
  return null;
}

function funcHideConsole(vm, args)
//Tell the UI thread to hide the console pane
{
  postMessage({msgId: MSGID_HIDE_CONSOLE});
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
  postMessage({msgId: MSGID_INPUT_REQUEST});

  vm.runLoopExitFlag = true;

  return undefined;
}
