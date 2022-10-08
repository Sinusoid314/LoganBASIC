function composeDebugBreakpointInfo(sourceLineNum)
//
{
  var breakpointInfo = {sourceLineNum: 0, funcIdents: []};

  breakpointInfo.sourceLineNum = sourceLineNum;
  mainVM.callFrames.forEach(frame => breakpointInfo.funcIdents.push(frame.func.ident));

  return breakpointInfo;
}

function onMsgDebugStart()
//
{
  mainVM.onSourceLineChangeHook = onVMSourceLineChange;

  if(!mainVM.endOfOps())
    postMessage({msgId: MSGID_DEBUG_BREAKPOINT, msgData: composeDebugBreakpointInfo(mainVM.getCurrOpSourceLineNum())});
}

function onMsgDebugStop()
//
{
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

function onVMSourceLineChange(vm, nextSourceLineNum)
//
{
  postMessage({msgId: MSGID_DEBUG_BREAKPOINT, msgData: composeDebugBreakpointInfo(nextSourceLineNum)});
  mainVM.inBreakpoint = true;
}
