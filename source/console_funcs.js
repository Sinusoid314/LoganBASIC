var consoleNativeFuncs = [
                  new ObjNativeFunc("showeditor", 0, 0, funcShowEditor),
                  new ObjNativeFunc("hideeditor", 0, 0, funcHideEditor),
                  new ObjNativeFunc("showconsole", 0, 0, funcShowConsole),
                  new ObjNativeFunc("hideconsole", 0, 0, funcHideConsole),
                  new ObjNativeFunc("input", 1, 1, funcInput)
                 ];

var inputCallback = null;

function onInputResult(inputStr)
//Process input sent from the console
{
  inputCallback.runtime.stack[inputCallback.runtime.stack.length - 1] = inputStr;
  inputCallback.runFunc();
}

function onRuntimePrint(runtime, printVal, replaceAll)
//
{
  if(replaceAll)
    postMessage({msgId: MSGID_CLEAR_CONSOLE});
  else
    postMessage({msgId: MSGID_PRINT, msgData: printVal});
}

function funcShowEditor(runtime, args)
//Tell the UI thread to show the program editor pane
{
  postMessage({msgId: MSGID_SHOW_EDITOR});
  return 0;
}

function funcHideEditor(runtime, args)
//Tell the UI thread to hide the program editor pane
{
  postMessage({msgId: MSGID_HIDE_EDITOR});
  return 0;
}

function funcShowConsole(runtime, args)
//Tell the UI thread to show the console pane
{
  postMessage({msgId: MSGID_SHOW_CONSOLE});
  return 0;
}

function funcHideConsole(runtime, args)
//Tell the UI thread to hide the console pane
{
  postMessage({msgId: MSGID_HIDE_CONSOLE});
  return 0;
}

function funcInput(runtime, args)
//Prompt user for input from the consol
{
  if(inputCallback == null)
    inputCallback = new CallbackContext(runtime);
  else
    inputCallback.runtime = runtime;

  postMessage({msgId: MSGID_PRINT, msgData: args[0]});
  postMessage({msgId: MSGID_INPUT_REQUEST});

  runtime.status = RUNTIME_STATUS_PAUSED;

  return "";
}
