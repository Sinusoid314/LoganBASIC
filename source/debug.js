function composeDebugDisplayInfo()
//
{
  var displayInfo = {funcIdents: []};

  mainVM.callFrames.forEach(frame => displayInfo.funcIdents.push(frame.func.ident));

  return displayInfo;
}

function onDebugStart()
//
{
  mainVM.onUserFuncCallHook = onUserFuncCall;
  mainVM.onUserFuncReturnHook = onUserFuncReturn;
  mainVM.onSourceLineChangeHook = onSourceLineChange;

  if(!mainVM.endOfOps())
    postMessage({msgId: MSGID_DEBUG_UPDATE_DISPLAYS, msgData: composeDebugDisplayInfo()});

  mainVM.run();
}

function onDebugStop()
//
{
  mainVM.onUserFuncCallHook = null;
  mainVM.onUserFuncReturnHook = null;
  mainVM.onSourceLineChangeHook = null;
  
  mainVM.run();
}

function onDebugStep()
//
{
  if(!mainVM.inBreakpoint)
    return;

  mainVM.run();
}

function onDebugSkip()
//
{
  if(!mainVM.inBreakpoint)
    return;

  mainVM.skipSourceLine();
  mainVM.inBreakpoint = false;
  mainVM.run();
}

function onUserFuncCall(vm, funcIdent)
//
{
  postMessage({msgId: MSGID_DEBUG_USER_FUNC_CALL, msgData: funcIdent});
}

function onUserFuncReturn(vm)
//
{
  postMessage({msgId: MSGID_DEBUG_USER_FUNC_RETURN});
}

function onSourceLineChange(vm, nextSourceLineNum)
//
{
  postMessage({msgId: MSGID_DEBUG_SOURCE_LINE_CHANGE, msgData: nextSourceLineNum});
}
