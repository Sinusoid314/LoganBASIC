const consoleNativeFuncs = [
                  new ObjNativeFunc("showEditor", 0, 0, funcShowEditor),
                  new ObjNativeFunc("hideEditor", 0, 0, funcHideEditor),
                  new ObjNativeFunc("showConsole", 0, 0, funcShowConsole),
                  new ObjNativeFunc("hideConsole", 0, 0, funcHideConsole),
                  new ObjNativeFunc("input", 1, 1, funcInput)
                 ];

var inputCallback = null;

function onInputResult(inputStr)
//Process input sent from the console
{
  inputCallback.vm.stack[inputCallback.vm.stack.length - 1] = inputStr;
  inputCallback.runFunc();
}

function onPrint(vm, printVal, replaceAll)
//
{
  if(replaceAll)
    postMessage({msgId: MSGID_CLEAR_CONSOLE});
  else
    postMessage({msgId: MSGID_PRINT, msgData: printVal});
}

function funcShowEditor(vm, args)
//Tell the UI thread to show the program editor pane
{
  postMessage({msgId: MSGID_SHOW_EDITOR});
  return 0;
}

function funcHideEditor(vm, args)
//Tell the UI thread to hide the program editor pane
{
  postMessage({msgId: MSGID_HIDE_EDITOR});
  return 0;
}

function funcShowConsole(vm, args)
//Tell the UI thread to show the console pane
{
  postMessage({msgId: MSGID_SHOW_CONSOLE});
  return 0;
}

function funcHideConsole(vm, args)
//Tell the UI thread to hide the console pane
{
  postMessage({msgId: MSGID_HIDE_CONSOLE});
  return 0;
}

function funcInput(vm, args)
//Prompt user for input from the consol
{
  if(inputCallback == null)
    inputCallback = new CallbackContext(vm);
  else
    inputCallback.vm = vm;

  postMessage({msgId: MSGID_PRINT, msgData: args[0]});
  postMessage({msgId: MSGID_INPUT_REQUEST});

  vm.changeStatus(VM_STATUS_IDLE);

  return "";
}
