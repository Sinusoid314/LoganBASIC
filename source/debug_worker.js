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
    var callFrame;

    this.sourceLineNum = sourceLineNum;
    this.sourceName = null;
    this.locals = new Map();
    this.globals = null;
    this.funcIdents = null;
    this.resumeBtnEnabled = (vm.inBreakpoint && !vm.callFramesEmpty());
    this.pauseBtnEnabled = (!vm.inBreakpoint && !vm.callFramesEmpty());

    if(vm.callFramesEmpty())
    {
      this.globals = vm.globals;
      this.funcIdents = [];
      return;
    }

    if(this.pauseBtnEnabled)
    {
      this.globals = new Map();
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

    this.sourceName = callFrame.func.sourceName;

    for(var localIndex = 0; localIndex < callFrame.localsCount; localIndex++)
      this.locals.set(callFrame.func.localIdents[localIndex], vm.stack[callFrame.stackIndex + localIndex + 1]);
  }
}

function debugEnterBreakpoint(vm, nextSourceLineNum)
//
{
  if(debugStepCallFrame)
    debugStepCallFrame = null;

  vm.inBreakpoint = true;

  postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(vm, nextSourceLineNum)});
}

function onMsgDebugEnable()
//
{
  if(debugEnabled)
    return;
  
  mainVM.onSourceLineChangeHook = onVMSourceLineChange;
  debugEnabled = true;
  debugLineChangeAction = DEBUG_ACTION_BREAK;

  /*
  if(!mainVM.callFramesEmpty())
    postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, mainVM.getCurrOpSourceLineNum())});
  */
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
  if((!debugEnabled || mainVM.callFramesEmpty()) || !mainVM.inBreakpoint)
    return;
  
  debugLineChangeAction = DEBUG_ACTION_CONTINUE;

  mainVM.run();
}

function onMsgDebugPause()
//
{
  if((!debugEnabled || mainVM.callFramesEmpty()) || mainVM.inBreakpoint)
    return;

  debugLineChangeAction = DEBUG_ACTION_BREAK;
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
  if(debugBreakpoints.findIndex(breakpoint => breakpoint.matches(msgData.sourceLineNum, msgData.sourceName)) > -1)
    return;

  debugBreakpoints.push(new DebugBreakpoint(msgData.sourceLineNum, msgData.sourceName));
}

function onMsgDebugRemoveBreakpoint(msgData)
//
{
  var breakpointIndex = debugBreakpoints.findIndex(breakpoint => breakpoint.matches(msgData.sourceLineNum, msgData.sourceName));

  if(breakpointIndex == -1)
    return;

  debugBreakpoints.splice(breakpointIndex, 1);
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
      if((debugStepCallFrame == vm.currCallFrame) || (!vm.callFrames.includes(debugStepCallFrame)))
        debugEnterBreakpoint(vm, nextSourceLineNum);
      break;

    case DEBUG_ACTION_STEP_OUT:
      if(!vm.callFrames.includes(debugStepCallFrame))
        debugEnterBreakpoint(vm, nextSourceLineNum);
      break;
  }
}
