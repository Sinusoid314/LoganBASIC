const DEBUG_MODE_OFF = 1;
const DEBUG_MODE_STEP = 2;
const DEBUG_MODE_STEP_OVER = 3;
const DEBUG_MODE_STEP_OUT = 4;

var debugMode = DEBUG_MODE_OFF;
var debugStepCallFrame = null;

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

    if(vm.endOfOps())
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

function debugChangeMode(newMode)
//
{
  debugMode = newMode;

  if((newMode == DEBUG_MODE_STEP_OVER) || (newMode == DEBUG_MODE_STEP_OUT))
    debugStepCallFrame = mainVM.currCallFrame;
  else
    debugStepCallFrame = null;
}

function onMsgDebugStart()
//
{
  mainVM.onSourceLineChangeHook = onVMSourceLineChange;

  debugChangeMode(DEBUG_MODE_STEP);

  if(!mainVM.endOfOps())
    postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, mainVM.getCurrOpSourceLineNum())});
}

function onMsgDebugStop()
//
{
  mainVM.onSourceLineChangeHook = null;

  debugChangeMode(DEBUG_MODE_OFF);
  
  if(mainVM.inBreakpoint)
    mainVM.run();
}

function onMsgDebugStep()
//
{
  if(!mainVM.inBreakpoint)
    return;

    debugChangeMode(DEBUG_MODE_STEP);

  mainVM.run();
}

function onMsgDebugStepOver()
//
{
  if(!mainVM.inBreakpoint)
    return;

  debugChangeMode(DEBUG_MODE_STEP_OVER);

  mainVM.run();
}

function onMsgDebugStepOut()
//
{
  if(!mainVM.inBreakpoint)
    return;

  if(mainVM.currCallFrame.func.sourceLevel == SOURCE_LEVEL_TOP)
    return;

  debugChangeMode(DEBUG_MODE_STEP_OUT);

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

function onVMSourceLineChange(vm, nextSourceLineNum)
//
{
  if(debugMode == DEBUG_MODE_STEP_OVER)
  {
    if(debugStepCallFrame == vm.currCallFrame)
      debugChangeMode(DEBUG_MODE_STEP);
  }
  else if(debugMode == DEBUG_MODE_STEP_OUT)
  {
    if(debugStepCallFrame != vm.currCallFrame)
      debugChangeMode(DEBUG_MODE_STEP);
  }

  if(debugMode == DEBUG_MODE_STEP)
  {
    postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(vm, nextSourceLineNum)});
    vm.inBreakpoint = true;
  }
}
