var debugToggleBtn = document.getElementById("debugToggleBtn");
var debugStepBtn = document.getElementById("debugStepBtn");
var debugSkipBtn = document.getElementById("debugSkipBtn");
var debugCallStackList = document.getElementById("debugCallStackList");

debugToggleBtn.addEventListener("click", debugToggleBtn_onClick);
debugStepBtn.addEventListener("click", debugStepBtn_onClick);
debugSkipBtn.addEventListener("click", debugSkipBtn_onClick);

debugToggleBtn.value = false;

function debugToggleBtn_onClick(event)
//
{
  if(debugToggleBtn.value)
  {
    progWorker.postMessage({msgId: MSGID_DEBUG_STOP});
  }
  else
  {
    progWorker.postMessage({msgId: MSGID_DEBUG_START});
  }

  debugToggleBtn.value = !debugToggleBtn.value;
}

function debugStepBtn_onClick(event)
//
{
  progWorker.postMessage({msgId: MSGID_DEBUG_STEP});
}

function debugSkipBtn_onClick(event)
//
{
  progWorker.postMessage({msgId: MSGID_DEBUG_SKIP});
}

function onDebugUpdateDisplays(displayInfo)
//
{
  selectEditorLine(displayInfo.nextSourceLineNum);
}

function onDebugUserFuncCall(funcIdent)
//
{
  
}

function onDebugUserFuncReturn()
//
{
  
}

function onDebugSourceLineChange(nextSourceLineNum)
//
{
  selectEditorLine(nextSourceLineNum);
}
