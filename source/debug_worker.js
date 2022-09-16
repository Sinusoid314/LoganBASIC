function composeDebugDisplayInfo()
//
{
  var displayInfo = {currSourceLineNum: 0, funcIdents: []};

  displayInfo.currSourceLineNum = mainVM.getCurrOpSourceLineNum();
  mainVM.callFrames.forEach(frame => displayInfo.funcIdents.push(frame.func.ident));

  return displayInfo;
}

function onMsgDebugStart()
//
{
  mainVM.onUserFuncCallHook = onVMUserFuncCall;
  mainVM.onUserFuncReturnHook = onVMUserFuncReturn;
  mainVM.onSourceLineChangeHook = onVMSourceLineChange;

  if(!mainVM.endOfOps())
    postMessage({msgId: MSGID_DEBUG_UPDATE_DISPLAYS, msgData: composeDebugDisplayInfo()});
}

function onMsgDebugStop()
//
{
  mainVM.onUserFuncCallHook = null;
  mainVM.onUserFuncReturnHook = null;
  mainVM.onSourceLineChangeHook = null;
  
  if(mainVM.inBreakpoint)
    mainVM.run();
}

function onMsgDebugStep()
//
{
  if(!mainVM.inBreakpoint)
    return;

  mainVM.run();
}

function onMsgDebugSkip()
//
{
  if(!mainVM.inBreakpoint)
    return;

  mainVM.skipSourceLine();
  mainVM.inBreakpoint = false;
  mainVM.run();
}

function onVMUserFuncCall(vm, funcIdent)
//
{
  postMessage({msgId: MSGID_DEBUG_USER_FUNC_CALL, msgData: funcIdent});
}

function onVMUserFuncReturn(vm)
//
{
  postMessage({msgId: MSGID_DEBUG_USER_FUNC_RETURN});
}

function onVMSourceLineChange(vm, nextSourceLineNum)
//
{
  postMessage({msgId: MSGID_DEBUG_SOURCE_LINE_CHANGE, msgData: nextSourceLineNum});
  mainVM.inBreakpoint = true;
}
