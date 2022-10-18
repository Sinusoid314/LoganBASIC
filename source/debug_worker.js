const DEBUG_MODE_OFF = 1;
const DEBUG_MODE_STEP = 2;
const DEBUG_MODE_STEP_OVER = 3;
const DEBUG_MODE_STEP_OUT = 4;

var debugMode = DEBUG_MODE_OFF;
var debugStepCallFrame = null;

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
    postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, mainVM.getCurrOpSourceLineNum(), null)});
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

function onMsgDebugCallFrameInfoRequest(callFrameIndex)
//
{
  if(callFrameIndex < 0 || callFrameIndex >= mainVM.callFrames.length)
    return;

  postMessage({msgId: MSGID_DEBUG_UPDATE_UI,
               msgData: new DebugInfo(mainVM, mainVM.getCurrOpSourceLineNum(), mainVM.callFrames[callFrameIndex])});
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
    postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(vm, nextSourceLineNum, null)});
    vm.inBreakpoint = true;
  }
}
