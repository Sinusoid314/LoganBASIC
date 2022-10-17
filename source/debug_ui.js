var isDebugging = false;
var debugIsResizing = false;

var debugCurrLocals = null;
var debugCurrGlobals = null;
var debugItemValueMap = new Map;

var mainDiv = document.getElementById("mainDiv");
var debugToggleBtn = document.getElementById("debugToggleBtn");
var debugDiv = document.getElementById("debugDiv");
var debugResizer = document.getElementById("debugResizer");
var debugStepBtn = document.getElementById("debugStepBtn");
var debugStepOverBtn = document.getElementById("debugStepOverBtn");
var debugStepOutBtn = document.getElementById("debugStepOutBtn");
var debugSkipBtn = document.getElementById("debugSkipBtn");
var debugCallStackList = document.getElementById("debugCallStackList");
var debugLocalsList = document.getElementById("debugLocalsList");
var debugGlobalsList = document.getElementById("debugGlobalsList");

debugToggleBtn.addEventListener("click", debugToggleBtn_onClick);
document.addEventListener("mousedown", document_onMouseDown);
document.addEventListener("mousemove", document_onMouseMove);
document.addEventListener("mouseup", document_onMouseUp);
debugStepBtn.addEventListener("click", debugStepBtn_onClick);
debugStepOverBtn.addEventListener("click", debugStepOverBtn_onClick);
debugStepOutBtn.addEventListener("click", debugStepOutBtn_onClick);
debugSkipBtn.addEventListener("click", debugSkipBtn_onClick);

function clearDebugDisplays()
//
{
  var items

  selectEditorLine(0);
  
  while(debugCallStackList.options.length)
    debugCallStackList.remove(0);

  debugLocalsList.innerHTML = "";

  debugGlobalsList.innerHTML = "";

  debugItemValueMap.clear();
}

function debugAddVarListItem(key, value, parentList)
//
{
  listItem = document.createElement("li");

  if(value instanceof Object)
  {
    debugItemValueMap.set(listItem, value)
    listItem.innerHTML = key + " (" + value.type + ")";
    listItem.style.cursor = "pointer";
  }
  else if(typeof value == "string")
    listItem.innerHTML = key + ' = "' + value + '"';
  else if(value === null)
    listItem.innerHTML = key + " = Nothing";
  else
    listItem.innerHTML = key + " = " + value;

  parentList.appendChild(listItem);
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

function debugStepOverBtn_onClick(event)
//
{
  progWorker.postMessage({msgId: MSGID_DEBUG_STEP_OVER});
}

function debugStepOutBtn_onClick(event)
//
{
  progWorker.postMessage({msgId: MSGID_DEBUG_STEP_OUT});
}

function debugSkipBtn_onClick(event)
//
{
  progWorker.postMessage({msgId: MSGID_DEBUG_SKIP});
}

function onMsgDebugUpdateUI(msgData)
//
{
  var listItem;

  clearDebugDisplays();

  selectEditorLine(msgData.sourceLineNum);

  if(msgData.funcIdents)
    msgData.funcIdents.forEach(ident => debugCallStackList.add(new Option(ident), 0));

  if(msgData.locals)
  {
    debugCurrLocals = msgData.locals;

    for (const [key, value] of debugCurrLocals)
      debugAddVarListItem(key, value, debugLocalsList);
  }

  if(msgData.globals)
  {
    debugCurrGlobals = msgData.globals;

    for (const [key, value] of debugCurrGlobals)
      debugAddVarListItem(key, value, debugGlobalsList);
  }
}
