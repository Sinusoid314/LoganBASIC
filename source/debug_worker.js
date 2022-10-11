class DebugInfo
{
  constructor(vm, sourceLineNum)
  {
    this.sourceLineNum = sourceLineNum;
    this.funcIdents = [];

    vm.callFrames.forEach(frame => this.funcIdents.push(frame.func.ident));
  }
}

function onMsgDebugStart()
//
{
  mainVM.onSourceLineChangeHook = onVMSourceLineChange;

  if(!mainVM.endOfOps())
    postMessage({msgId: MSGID_DEBUG_BREAKPOINT, msgData: new DebugInfo(mainVM, mainVM.getCurrOpSourceLineNum())});
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
  postMessage({msgId: MSGID_DEBUG_BREAKPOINT, msgData: new DebugInfo(vm, nextSourceLineNum)});
  vm.inBreakpoint = true;
}
