const DEBUG_ACTION_CONTINUE = 1;
const DEBUG_ACTION_BREAK = 2;
const DEBUG_ACTION_STEP_OVER = 3;
const DEBUG_ACTION_STEP_OUT = 4;

var debugEnabled = false;
var debugLineChangeAction = DEBUG_ACTION_BREAK;
var debugStepCallFrame = null;
var debugBreakpoints = [];

class DebugInfo
{
  constructor(vm, sourceLineNum, callFrameIndex = -1)
  {
    var callFrame, nextFrameStackIndex;

    this.sourceLineNum = sourceLineNum;
    this.sourceName = null;
    this.locals = new Map();
    this.globals = null;
    this.funcIdents = null;

    if(vm.callFramesEmpty())
    {
      this.globals = vm.globals;
      this.funcIdents = [];
      return;
    }

    if(callFrameIndex == -1)
    {
      callFrameIndex = vm.callFrames.length - 1;

      this.globals = vm.globals;
      this.funcIdents = [];
      vm.callFrames.forEach(frame => this.funcIdents.push(frame.func.ident));
    }

    callFrame = vm.callFrames[callFrameIndex];
    if(callFrame == vm.currCallFrame)
      nextFrameStackIndex = vm.stack.length;
    else
      nextFrameStackIndex = vm.callFrames[callFrameIndex + 1].stackIndex;

    this.sourceName = callFrame.func.sourceName;

    for(var index = callFrame.stackIndex + 1; index < nextFrameStackIndex; index++)
      this.locals.set(callFrame.func.localIdents[index - (callFrame.stackIndex + 1)], vm.stack[index]);
  }
}

class DebugBreakpoint
{
  constructor(sourceLineNum, sourceName)
  {
    this.sourceLineNum = sourceLineNum;
    this.sourceName = sourceName;
  }

  matches(sourceLineNum, sourceName)
  {
    return (this.sourceLineNum == sourceLineNum) && (this.sourceName == sourceName);
  }
}

function debugEnterBreakpoint(vm, nextSourceLineNum)
//
{
  if(debugStepCallFrame)
    debugStepCallFrame = null;

  postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(vm, nextSourceLineNum)});

  vm.inBreakpoint = true;
}

function onMsgDebugEnable()
//
{
  if(debugEnabled)
    return;
  
  mainVM.onSourceLineChangeHook = onVMSourceLineChange;
  debugEnabled = true;
  debugLineChangeAction = DEBUG_ACTION_BREAK;

  if(!mainVM.callFramesEmpty())
    postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, mainVM.getCurrOpSourceLineNum())});
}

function onMsgDebugDisable()
//
{
  if(!debugEnabled)
    return;

  mainVM.onSourceLineChangeHook = null;
  debugEnabled = false;

  if(mainVM.inBreakpoint)
    mainVM.run();
}

function onMsgDebugResume()
//
{
  if(!debugEnabled || mainVM.callFramesEmpty())
    return;
  
  debugLineChangeAction = DEBUG_ACTION_CONTINUE;

  if(mainVM.inBreakpoint)
    mainVM.run();
}

function onMsgDebugPause()
//
{
  if(!debugEnabled || mainVM.callFramesEmpty())
    return;

  debugLineChangeAction = DEBUG_ACTION_BREAK;

  if(mainVM.inBreakpoint)
    mainVM.run();
}

function onMsgDebugStep()
//
{
  if((!debugEnabled || mainVM.callFramesEmpty()) || !mainVM.inBreakpoint)
    return;

  debugLineChangeAction = DEBUG_ACTION_BREAK;

  mainVM.run();
}

function onMsgDebugStepOver()
//
{
  if((!debugEnabled || mainVM.callFramesEmpty()) || !mainVM.inBreakpoint)
    return;

  debugLineChangeAction = DEBUG_ACTION_STEP_OVER;
  debugStepCallFrame = mainVM.currCallFrame;

  mainVM.run();
}

function onMsgDebugStepOut()
//
{
  if((!debugEnabled || mainVM.callFramesEmpty()) || !mainVM.inBreakpoint)
    return;

  debugLineChangeAction = DEBUG_ACTION_STEP_OUT;
  debugStepCallFrame = mainVM.currCallFrame;

  mainVM.run();
}

function onMsgDebugSkip()
//
{
  if((!debugEnabled || mainVM.callFramesEmpty()) || !mainVM.inBreakpoint)
    return;

  mainVM.skipSourceLine();
  mainVM.inBreakpoint = false;
  mainVM.run();
}

function onMsgDebugCallFrameInfoRequest(msgData)
//
{
  var sourceLineNum;

  if(msgData.callFrameIndex < 0 || msgData.callFrameIndex >= mainVM.callFrames.length)
    return;

  if(msgData.callFrameIndex == mainVM.callFrames.length - 1)
    sourceLineNum = mainVM.getNextOpSourceLineNum(mainVM.callFrames[msgData.callFrameIndex]);
  else
    sourceLineNum = mainVM.getCurrOpSourceLineNum(mainVM.callFrames[msgData.callFrameIndex]);

  postMessage({msgId: MSGID_DEBUG_UPDATE_UI,
               msgData: new DebugInfo(mainVM, sourceLineNum, msgData.callFrameIndex)});
}

function onMsgDebugAddBreakpoint(msgData)
//
{

}

function onMsgDebugRemoveBreakpoint(msgData)
//
{

}

function onVMSourceLineChange(vm, nextSourceLineNum, sourceName)
//
{
  if(sourceName != mainSourceName)
    return;

  for(const breakpoint of debugBreakpoints)
  {
    if(breakpoint.matches(nextSourceLineNum, sourceName))
    {
      if(debugLineChangeAction == DEBUG_ACTION_CONTINUE)
        postMessage({msgId: MSGID_DEBUG_ON_USER_BREAKPOINT});

      debugEnterBreakpoint(vm, nextSourceLineNum);

      break;
    }
  }
  
  switch(debugLineChangeAction)
  {
    case DEBUG_ACTION_BREAK:
      debugEnterBreakpoint(vm, nextSourceLineNum);
      break;

    case DEBUG_ACTION_STEP_OVER:
      if(debugStepCallFrame == vm.currCallFrame)
        debugEnterBreakpoint(vm, nextSourceLineNum);
      break;

    case DEBUG_ACTION_STEP_OUT:
      if(debugStepCallFrame != vm.currCallFrame)
        debugEnterBreakpoint(vm, nextSourceLineNum);
      break;
  }
}
