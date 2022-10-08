var isDebugging = false;
var debugIsResizing = false;
var mainDiv = document.getElementById("mainDiv");
var debugToggleBtn = document.getElementById("debugToggleBtn");
var debugDiv = document.getElementById("debugDiv");
var debugResizer = document.getElementById("debugResizer");
var debugStepBtn = document.getElementById("debugStepBtn");
var debugSkipBtn = document.getElementById("debugSkipBtn");
var debugCallStackList = document.getElementById("debugCallStackList");

debugToggleBtn.addEventListener("click", debugToggleBtn_onClick);
document.addEventListener("mousedown", document_onMouseDown);
document.addEventListener("mousemove", document_onMouseMove);
document.addEventListener("mouseup", document_onMouseUp);
debugStepBtn.addEventListener("click", debugStepBtn_onClick);
debugSkipBtn.addEventListener("click", debugSkipBtn_onClick);

function clearDebugDisplays()
//
{
  selectEditorLine(0);
  
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
    mainDiv.style.marginLeft = debugDiv.clientWidth + "px";

    progWorker.postMessage({msgId: MSGID_DEBUG_START});
  }

  isDebugging = !isDebugging;
}

function document_onMouseDown(event)
{
  if(event.target != debugResizer)
    return false;

  debugDiv.style.pointerEvents = "none";
  mainDiv.style.pointerEvents = "none";
  document.body.style.userSelect = "none";
  document.body.style.cursor = "ew-resize";
  debugIsResizing = true;
}

function document_onMouseMove(event)
{
  if(!debugIsResizing)
    return false;

  debugDiv.style.width = event.clientX + "px";
  mainDiv.style.marginLeft = event.clientX + "px";
}

function document_onMouseUp(event)
{
  debugDiv.style.pointerEvents = "";
  mainDiv.style.pointerEvents = "";
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
  debugIsResizing = false;
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

function onMsgDebugBreakpoint(breakpointInfo)
//
{
  clearDebugDisplays();

  selectEditorLine(breakpointInfo.sourceLineNum);
  breakpointInfo.funcIdents.forEach(ident => debugCallStackList.add(new Option(ident), 0));
}
