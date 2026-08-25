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

    if(uiStatus != DebugCommon.DEBUG_UI_STATUS_BREAKPOINT)
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
import * as VM from "../core/vm.js";
import * as MainWorker from "../main_worker.js";
import * as MainCommon from "../main_common.js";
import * as DebugCommon from "./debug_common.js";


var debugBreakpoints = [];
var debugLineChangeAction = DEBUG_ACTION_BREAK;
var debugStepCallFrame = null;

setDebugWorkerEvents();


function setDebugWorkerEvents()
//
{
  MainWorker.workerOnProgEndHandlers.push(debugWorker_onProgEnd);

  MainWorker.workerMessageMap.set(DebugCommon.MSGID_DEBUG_ENABLE, onMsgDebugEnable);
  MainWorker.workerMessageMap.set(DebugCommon.MSGID_DEBUG_DISABLE, onMsgDebugDisable);
  MainWorker.workerMessageMap.set(DebugCommon.MSGID_DEBUG_RESUME, onMsgDebugResume);
  MainWorker.workerMessageMap.set(DebugCommon.MSGID_DEBUG_STEP_INTO, onMsgDebugStepInto);
  MainWorker.workerMessageMap.set(DebugCommon.MSGID_DEBUG_STEP_OVER, onMsgDebugStepOver);
  MainWorker.workerMessageMap.set(DebugCommon.MSGID_DEBUG_STEP_OUT, onMsgDebugStepOut);
  MainWorker.workerMessageMap.set(DebugCommon.MSGID_DEBUG_SKIP, onMsgDebugSkip);
  MainWorker.workerMessageMap.set(DebugCommon.MSGID_DEBUG_CALL_FRAME_INFO_REQUEST, onMsgDebugCallFrameInfoRequest);
  MainWorker.workerMessageMap.set(DebugCommon.MSGID_DEBUG_ADD_BREAKPOINT, onMsgDebugAddBreakpoint);
  MainWorker.workerMessageMap.set(DebugCommon.MSGID_DEBUG_REMOVE_BREAKPOINT, onMsgDebugRemoveBreakpoint);
}

function debugEnterBreakpoint(vm, nextSourceLineNum)
//
{
  if(debugStepCallFrame)
    debugStepCallFrame = null;

  vm.inBreakpoint = true;

  postMessage({msgId: DebugCommon.MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(vm, nextSourceLineNum, DebugCommon.DEBUG_UI_STATUS_BREAKPOINT)});
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
  
  MainWorker.mainVM.addEventHook(VM.VM_EVENT_SOURCE_LINE_CHANGE, onVMSourceLineChange)
  debugEnabled = true;

  if(MainWorker.mainVM.callFramesEmpty())
    debugLineChangeAction = DEBUG_ACTION_BREAK;
  else
  {
    debugLineChangeAction = DEBUG_ACTION_CONTINUE;
    postMessage({msgId: DebugCommon.MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(MainWorker.mainVM, 0, DebugCommon.DEBUG_UI_STATUS_RESUMED)});
  }
}

function onMsgDebugDisable(msgData)
//
{
  if(!debugEnabled)
    return;

  MainWorker.mainVM.removeEventHook(VM.VM_EVENT_SOURCE_LINE_CHANGE, onVMSourceLineChange)
  debugEnabled = false;

  if(MainWorker.mainVM.inBreakpoint)
    MainWorker.mainVM.run();
}

function onMsgDebugResume(msgData)
//
{
  if((!debugEnabled || MainWorker.mainVM.callFramesEmpty()))
    return;
  
  debugLineChangeAction = DEBUG_ACTION_CONTINUE;
  postMessage({msgId: DebugCommon.MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(MainWorker.mainVM, 0, DebugCommon.DEBUG_UI_STATUS_RESUMED)});

  if(MainWorker.mainVM.inBreakpoint)
    MainWorker.mainVM.run();
}

function onMsgDebugStepInto(msgData)
//
{
  if(!debugEnabled || MainWorker.mainVM.callFramesEmpty())
    return;

  debugLineChangeAction = DEBUG_ACTION_BREAK;
  postMessage({msgId: DebugCommon.MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(MainWorker.mainVM, 0, DebugCommon.DEBUG_UI_STATUS_STEPPING)});

  if(MainWorker.mainVM.inBreakpoint)
    MainWorker.mainVM.run();
}

function onMsgDebugStepOver(msgData)
//
{
  if(!debugEnabled || MainWorker.mainVM.callFramesEmpty() || !MainWorker.mainVM.inBreakpoint)
    return;

  debugStepCallFrame = MainWorker.mainVM.currCallFrame;

  debugLineChangeAction = DEBUG_ACTION_STEP_OVER;
  postMessage({msgId: DebugCommon.MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(MainWorker.mainVM, 0, DebugCommon.DEBUG_UI_STATUS_STEPPING)});

  MainWorker.mainVM.run();
}

function onMsgDebugStepOut(msgData)
//
{
  if(!debugEnabled || MainWorker.mainVM.callFramesEmpty() || !MainWorker.mainVM.inBreakpoint)
    return;

  debugStepCallFrame = MainWorker.mainVM.currCallFrame;

  debugLineChangeAction = DEBUG_ACTION_STEP_OUT;
  postMessage({msgId: DebugCommon.MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(MainWorker.mainVM, 0, DebugCommon.DEBUG_UI_STATUS_STEPPING)});

  MainWorker.mainVM.run();
}

function onMsgDebugSkip(msgData)
//
{
  if(!debugEnabled || MainWorker.mainVM.callFramesEmpty() || !MainWorker.mainVM.inBreakpoint)
    return;

  MainWorker.mainVM.skipSourceLine();
  MainWorker.mainVM.inBreakpoint = false;

  postMessage({msgId: DebugCommon.MSGID_DEBUG_UPDATE_UI, msgData: new DebugInfo(MainWorker.mainVM, 0, DebugCommon.DEBUG_UI_STATUS_STEPPING)});

  MainWorker.mainVM.run();
}

function onMsgDebugCallFrameInfoRequest(msgData)
//
{
  var sourceLineNum;

  if(msgData.callFrameIndex < 0 || msgData.callFrameIndex >= MainWorker.mainVM.callFrames.length)
    return;

  if(msgData.callFrameIndex == MainWorker.mainVM.callFrames.length - 1)
    sourceLineNum = MainWorker.mainVM.getNextOpSourceLineNum(MainWorker.mainVM.callFrames[msgData.callFrameIndex]);
  else
    sourceLineNum = MainWorker.mainVM.getCurrOpSourceLineNum(MainWorker.mainVM.callFrames[msgData.callFrameIndex]);

  postMessage({msgId: DebugCommon.MSGID_DEBUG_UPDATE_UI,
               msgData: new DebugInfo(MainWorker.mainVM, sourceLineNum, DebugCommon.DEBUG_UI_STATUS_BREAKPOINT, msgData.callFrameIndex)});
}

function onMsgDebugAddBreakpoint(msgData)
//
{
  if(debugBreakpoints.findIndex(breakpoint => breakpoint.matches(msgData.sourceLineNum, msgData.sourceName)) > -1)
    return;

  debugBreakpoints.push(new DebugCommon.DebugBreakpoint(msgData.sourceLineNum, msgData.sourceName));
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
  if(sourceName != MainCommon.mainSourceName)
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
