const DEBUG_STATUS_OFF = 1;
const DEBUG_STATUS_STANDBY = 2;
const DEBUG_STATUS_PAUSE = 3;
const DEBUG_STATUS_RESUME = 4;
const DEBUG_STATUS_STEP = 5;
const DEBUG_STATUS_STEP_OVER = 6;
const DEBUG_STATUS_STEP_OUT = 7;

var debugStatus = DEBUG_STATUS_OFF;
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

function debugChangeStatus(newStatus)
//
{
  if((newStatus == DEBUG_STATUS_STEP_OVER) || (newStatus == DEBUG_STATUS_STEP_OUT))
    debugStepCallFrame = mainVM.currCallFrame;
  else
      debugStepCallFrame = null;

  debugStatus = newStatus;
}

function onMsgDebugStart()
//
{
  if(debugStatus != DEBUG_STATUS_OFF)
    return;
  
  mainVM.onSourceLineChangeHook = onVMSourceLineChange;

  if(!mainVM.callFramesEmpty())
  {
    debugChangeStatus(DEBUG_STATUS_PAUSE);
    postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, mainVM.getCurrOpSourceLineNum())});
  }
  else
  {
    debugChangeStatus(DEBUG_STATUS_STANDBY);
  }
}

function onMsgDebugStop()
//
{
  var prevStatus = debugStatus;

  if(debugStatus == DEBUG_STATUS_OFF)
    return;

  mainVM.onSourceLineChangeHook = null;
  
  debugChangeStatus(DEBUG_STATUS_OFF);

  if(prevStatus == DEBUG_STATUS_PAUSE)
    mainVM.run();
}

function onMsgDebugResume()
//
{
  if(debugStatus != DEBUG_STATUS_PAUSE)
    return;

  debugChangeStatus(DEBUG_STATUS_RESUME);

  mainVM.run();
}

function onMsgDebugPause()
//
{
  if(debugStatus == DEBUG_STATUS_PAUSE)
    return;

  debugChangeStatus(DEBUG_STATUS_PAUSE);

  mainVM.run();
}

function onMsgDebugStep()
//
{
  if(debugStatus != DEBUG_STATUS_PAUSE)
    return;

  debugChangeStatus(DEBUG_STATUS_STEP);

  mainVM.run();
}

function onMsgDebugStepOver()
//
{
  if(debugStatus != DEBUG_STATUS_PAUSE)
    return;

  debugChangeStatus(DEBUG_STATUS_STEP_OVER);

  mainVM.run();
}

function onMsgDebugStepOut()
//
{
  if(debugStatus != DEBUG_STATUS_PAUSE)
    return;

  if(mainVM.currCallFrame.func.sourceLevel == SOURCE_LEVEL_TOP)
    return;

  debugChangeStatus(DEBUG_STATUS_STEP_OUT);

  mainVM.run();
}

function onMsgDebugSkip()
//
{
  if(debugStatus != DEBUG_STATUS_PAUSE)
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
      debugChangeStatus(DEBUG_STATUS_PAUSE);
      break;
    }
  }
  
  switch(debugStatus)
  {
    case DEBUG_STATUS_STANDBY:
      debugChangeStatus(DEBUG_STATUS_PAUSE);
      break;
  
    case DEBUG_STATUS_STEP:
      debugChangeStatus(DEBUG_STATUS_PAUSE);
      break;

    case DEBUG_STATUS_STEP_OVER:
      if(debugStepCallFrame == vm.currCallFrame)
        debugChangeStatus(DEBUG_STATUS_PAUSE);
      break;

    case DEBUG_STATUS_STEP_OUT:
      if(debugStepCallFrame != vm.currCallFrame)
        debugChangeStatus(DEBUG_STATUS_PAUSE);
      break;
  }

  if(debugStatus == DEBUG_STATUS_PAUSE)
  {
    postMessage({msgId: MSGID_DEBUG_ON_BREAKPOINT});
    postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(vm, nextSourceLineNum)});
    vm.inBreakpoint = true;
  }
}
