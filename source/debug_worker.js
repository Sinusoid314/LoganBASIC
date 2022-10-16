class DebugInfo
{
  constructor(vm, sourceLineNum, callFrame)
  {
    this.sourceLineNum = sourceLineNum;
    this.sourceName = null;
    this.locals = new Map();
    this.globals = null;
    this.funcIdents = null;

    if(vm.endOfOps())
    {
      this.globals = vm.globals;
      this.funcIdents = [];
      return;
    }

    if(!callFrame)
    {
      callFrame = vm.currCallFrame;

      this.globals = vm.globals;
      this.funcIdents = [];
      vm.callFrames.forEach(frame => this.funcIdents.push(frame.func.ident));
    }

    this.sourceName = callFrame.func.sourceName;

    for(var index = 0; index < (vm.stack.length - callFrame.stackIndex - 1); index++)
      this.locals.set(callFrame.func.localIdents[index], vm.stack[callFrame.stackIndex + index + 1]);
  }
}

function onMsgDebugStart()
//
{
  mainVM.onSourceLineChangeHook = onVMSourceLineChange;

  if(!mainVM.endOfOps())
    postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, mainVM.getCurrOpSourceLineNum(), null)});
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
  postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(vm, nextSourceLineNum, null)});
  vm.inBreakpoint = true;
}
