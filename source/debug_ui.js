var isDebugging = false;
var debugIsResizing = false;

var debugCurrLocals = null;
var debugCurrGlobals = null;
var debugLocalsItemValueMap = new Map;
var debugGlobalsItemValueMap = new Map;

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
debugCallStackList.addEventListener("change", debugCallStackList_onChange);

function debugClearDisplays()
//
{
  selectEditorLine(0);
  
  debugClearCallFrameList();
  debugClearLocalsList();
  debugClearGlobalsList();
}

function debugClearCallFrameList()
//
{
  while(debugCallStackList.options.length)
    debugCallStackList.remove(0);
}

function debugClearLocalsList()
//
{
  debugLocalsList.innerHTML = "";
  debugLocalsItemValueMap.clear();
}

function debugClearGlobalsList()
//
{
  debugGlobalsList.innerHTML = "";
  debugGlobalsItemValueMap.clear();
}

function debugExpandVarListItem(parentItem, itemValueMap, parentValue)
//
{
  var list = document.createElement("ul");

  switch(parentValue.type)
  {
    case OBJ_TYPE_USER_FUNC:
      selectEditorLine(parentValue.declSourceLineNum);
      return;

    case OBJ_TYPE_ARRAY:
      break;

    case OBJ_TYPE_STRUCT:
      for (const [key, value] of parentValue.fieldMap)
        debugAddVarListItem(key, value, list, itemValueMap);
      break;

    case OBJ_TYPE_STRUCT_DEF:
      for(const ident of parentValue.fieldIdents)
        debugAddVarListItem(null, ident, list, itemValueMap);
      break;
  }

  parentItem.appendChild(list);
}

function debugCollapseVarListItem()
//
{

}

function debugAddVarListItem(key, value, parentList, itemValueMap)
//
{
  var listItem = document.createElement("li");
  var listItemText = document.createElement("span");

  if(value && (value instanceof Object))
  {
    itemValueMap.set(listItem, value)
    listItemText.innerHTML = key + " (" + value.type + ")";
    listItemText.style.cursor = "pointer";
    listItemText.addEventListener("click", debugVarListItem_onClick);
  }
  else if(key === null)
    listItemText.innerHTML = value;
  else if(typeof value == "string")
    listItemText.innerHTML = key + ' = "' + value + '"';
  else if(value === null)
    listItemText.innerHTML = key + " = Nothing";
  else
    listItemText.innerHTML = key + " = " + value;

  parentList.appendChild(listItem);
  listItem.appendChild(listItemText);
}

function debugRemoveVarListItem()
//
{

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

function debugCallStackList_onChange(event)
//
{
  var callFrameIndex = (event.target.length - 1) - event.target.selectedIndex;

  progWorker.postMessage({msgId: MSGID_DEBUG_CALL_FRAME_INFO_REQUEST, msgData: {callFrameIndex: callFrameIndex}});
}

function debugVarListItem_onClick(event)
//
{
  var parentItem = event.target.parentElement;
  var itemValueMap = (debugLocalsItemValueMap.has(parentItem) ? debugLocalsItemValueMap : debugGlobalsItemValueMap)
  var parentValue = itemValueMap.get(parentItem);
  var list = parentItem.querySelector("ul");

  if(list)
  {
    debugCollapseVarListItem();
  }
  else
  {
    debugExpandVarListItem(parentItem, itemValueMap, parentValue);
  }
}

function onMsgDebugUpdateUI(msgData)
//
{
  selectEditorLine(msgData.sourceLineNum);

  if(msgData.funcIdents)
  {
    debugClearCallFrameList();
    msgData.funcIdents.forEach(ident => debugCallStackList.add(new Option(ident), 0));
  }

  if(msgData.locals)
  {
    debugClearLocalsList();
    debugCurrLocals = msgData.locals;

    for (const [key, value] of debugCurrLocals)
      debugAddVarListItem(key, value, debugLocalsList, debugLocalsItemValueMap);
  }

  if(msgData.globals)
  {
    debugClearGlobalsList();
    debugCurrGlobals = msgData.globals;

    for (const [key, value] of debugCurrGlobals)
      debugAddVarListItem(key, value, debugGlobalsList, debugGlobalsItemValueMap);
  }
}
