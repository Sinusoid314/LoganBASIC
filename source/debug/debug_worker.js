class DebugInfo
{
  constructor(vm, sourceLineNum, uiStatus, callFrameIndex = -1)
  {
    var callFrame;

    this.sourceLineNum = sourceLineNum;
    this.sourceName = null;
    this.locals = new Map();
    this.globals = null;
    this.funcIdents = null;
    this.uiStatus = uiStatus;

    if(vm.callFramesEmpty())
    {
      this.globals = vm.globals;
      this.funcIdents = [];
      return;
    }

    if(uiStatus != DEBUG_UI_STATUS_BREAKPOINT)
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
      this.locals.set(callFrame.func.localIdents[localIndex], vm.stack[callFrame.localsStackIndex + localIndex]);
  }
}

const DEBUG_ACTION_CONTINUE = 1;
const DEBUG_ACTION_BREAK = 2;
const DEBUG_ACTION_STEP_OVER = 3;
const DEBUG_ACTION_STEP_OUT = 4;

var debugEnabled = false;
var debugBreakpoints = [];
var debugLineChangeAction = DEBUG_ACTION_BREAK;
var debugStepCallFrame = null;

setDebugWorkerEvents();


function setDebugWorkerEvents()
//
{
  workerOnProgEndHandlers.push(debugWorker_onProgEnd);

  workerMessageMap.set(MSGID_DEBUG_ENABLE, onMsgDebugEnable);
  workerMessageMap.set(MSGID_DEBUG_DISABLE, onMsgDebugDisable);
  workerMessageMap.set(MSGID_DEBUG_RESUME, onMsgDebugResume);
  workerMessageMap.set(MSGID_DEBUG_STEP_INTO, onMsgDebugStepInto);
  workerMessageMap.set(MSGID_DEBUG_STEP_OVER, onMsgDebugStepOver);
  workerMessageMap.set(MSGID_DEBUG_STEP_OUT, onMsgDebugStepOut);
  workerMessageMap.set(MSGID_DEBUG_SKIP, onMsgDebugSkip);
  workerMessageMap.set(MSGID_DEBUG_CALL_FRAME_INFO_REQUEST, onMsgDebugCallFrameInfoRequest);
  workerMessageMap.set(MSGID_DEBUG_ADD_BREAKPOINT, onMsgDebugAddBreakpoint);
  workerMessageMap.set(MSGID_DEBUG_REMOVE_BREAKPOINT, onMsgDebugRemoveBreakpoint);
}

function debugEnterBreakpoint(vm, nextSourceLineNum)
//
{
  if(debugStepCallFrame)
    debugStepCallFrame = null;

  vm.inBreakpoint = true;

  postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(vm, nextSourceLineNum, DEBUG_UI_STATUS_BREAKPOINT)});
}

function debugWorker_onProgEnd()
//
{
  debugLineChangeAction = DEBUG_ACTION_BREAK;
  debugStepCallFrame = null;
}

function onMsgDebugEnable(msgData)
//
{
  if(debugEnabled)
    return;
  
  mainVM.addEventHook(VM_EVENT_SOURCE_LINE_CHANGE, onVMSourceLineChange)
  debugEnabled = true;

  if(mainVM.callFramesEmpty())
    debugLineChangeAction = DEBUG_ACTION_BREAK;
  else
  {
    debugLineChangeAction = DEBUG_ACTION_CONTINUE;
    postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, 0, DEBUG_UI_STATUS_RESUMED)});
  }
}

function onMsgDebugDisable(msgData)
//
{
  if(!debugEnabled)
    return;

  mainVM.removeEventHook(VM_EVENT_SOURCE_LINE_CHANGE, onVMSourceLineChange)
  debugEnabled = false;

  if(mainVM.inBreakpoint)
    mainVM.run();
}

function onMsgDebugResume(msgData)
//
{
  if((!debugEnabled || mainVM.callFramesEmpty()))
    return;
  
  debugLineChangeAction = DEBUG_ACTION_CONTINUE;
  postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, 0, DEBUG_UI_STATUS_RESUMED)});

  if(mainVM.inBreakpoint)
    mainVM.run();
}

function onMsgDebugStepInto(msgData)
//
{
  if(!debugEnabled || mainVM.callFramesEmpty())
    return;

  debugLineChangeAction = DEBUG_ACTION_BREAK;
  postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, 0, DEBUG_UI_STATUS_STEPPING)});

  if(mainVM.inBreakpoint)
    mainVM.run();
}

function onMsgDebugStepOver(msgData)
//
{
  if(!debugEnabled || mainVM.callFramesEmpty() || !mainVM.inBreakpoint)
    return;

  debugStepCallFrame = mainVM.currCallFrame;

  debugLineChangeAction = DEBUG_ACTION_STEP_OVER;
  postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, 0, DEBUG_UI_STATUS_STEPPING)});

  mainVM.run();
}

function onMsgDebugStepOut(msgData)
//
{
  if(!debugEnabled || mainVM.callFramesEmpty() || !mainVM.inBreakpoint)
    return;

  debugStepCallFrame = mainVM.currCallFrame;

  debugLineChangeAction = DEBUG_ACTION_STEP_OUT;
  postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, 0, DEBUG_UI_STATUS_STEPPING)});

  mainVM.run();
}

function onMsgDebugSkip(msgData)
//
{
  if(!debugEnabled || mainVM.callFramesEmpty() || !mainVM.inBreakpoint)
    return;

  mainVM.skipSourceLine();
  mainVM.inBreakpoint = false;

  postMessage({msgId: MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(mainVM, 0, DEBUG_UI_STATUS_STEPPING)});

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
               msgData: new DebugInfo(mainVM, sourceLineNum, DEBUG_UI_STATUS_BREAKPOINT, msgData.callFrameIndex)});
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
