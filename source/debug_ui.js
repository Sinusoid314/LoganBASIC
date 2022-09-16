var isDebugging = false;
var mainDiv = document.getElementById("mainDiv");
var debugToggleBtn = document.getElementById("debugToggleBtn");
var debugDiv = document.getElementById("debugDiv");
var debugStepBtn = document.getElementById("debugStepBtn");
var debugSkipBtn = document.getElementById("debugSkipBtn");
var debugCallStackList = document.getElementById("debugCallStackList");

debugToggleBtn.addEventListener("click", debugToggleBtn_onClick);
debugStepBtn.addEventListener("click", debugStepBtn_onClick);
debugSkipBtn.addEventListener("click", debugSkipBtn_onClick);

function clearDebugDisplays()
//
{
  while(debugCallStackList.options.length)
    debugCallStackList.remove(0);
}

function debugToggleBtn_onClick(event)
//
{
  if(isDebugging)
  {
    debugToggleBtn.style.border = "";
	  debugDiv.style.display = "none";
    mainDiv.style.marginLeft = "0";
    
    progWorker.postMessage({msgId: MSGID_DEBUG_STOP});
  }
  else
  {
    debugToggleBtn.style.border = "inset 2px";
	  debugDiv.style.display = "block";
    mainDiv.style.marginLeft = debugDiv.clientWidth;

    progWorker.postMessage({msgId: MSGID_DEBUG_START});
  }

  isDebugging = !isDebugging;
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

function onMsgDebugUpdateDisplays(displayInfo)
//
{
  selectEditorLine(displayInfo.currSourceLineNum);
  displayInfo.funcIdents.forEach(ident => debugCallStackList.add(new Option(funcIdent), 0));
}

function onMsgDebugUserFuncCall(funcIdent)
//
{
  debugCallStackList.add(new Option(funcIdent), 0);
}

function onMsgDebugUserFuncReturn()
//
{
  debugCallStackList.remove(0);
}

function onMsgDebugSourceLineChange(nextSourceLineNum)
//
{
  selectEditorLine(nextSourceLineNum);
}
