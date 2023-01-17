var isDebugging = false;
var debugIsResizing = false;

var debugCurrLocals = null;
var debugCurrGlobals = null;
var debugLocalsItemValueMap = new Map;
var debugGlobalsItemValueMap = new Map;
var debugBreakpointBackups = [];

var mainDiv = document.getElementById("mainDiv");
var debugToggleBtn = document.getElementById("debugToggleBtn");
var debugDiv = document.getElementById("debugDiv");
var debugResizer = document.getElementById("debugResizer");
var debugResumeBtn = document.getElementById("debugResumeBtn");
var debugPauseBtn = document.getElementById("debugPauseBtn");
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
debugResumeBtn.addEventListener("click", debugResumeBtn_onClick);
debugPauseBtn.addEventListener("click", debugPauseBtn_onClick);
debugStepBtn.addEventListener("click", debugStepBtn_onClick);
debugStepOverBtn.addEventListener("click", debugStepOverBtn_onClick);
debugStepOutBtn.addEventListener("click", debugStepOutBtn_onClick);
debugSkipBtn.addEventListener("click", debugSkipBtn_onClick);
debugCallStackList.addEventListener("change", debugCallStackList_onChange);

function debugChangeUIStatus(newStatus)
//
{
  debugPauseBtn.disabled = (newStatus == DEBUG_UI_STATUS_PAUSED) || (newStatus == DEBUG_UI_STATUS_DISABLED);

  debugResumeBtn.disabled
  = debugStepBtn.disabled
  = debugStepOverBtn.disabled
  = debugStepOutBtn.disabled
  = debugSkipBtn.disabled
  = (newStatus == DEBUG_UI_STATUS_RESUMED) || (newStatus == DEBUG_UI_STATUS_DISABLED);
}

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

function debugExpandVarListItem(parentItem, itemValueMap, childList)
//
{
  var key, value;
  var parentValue = itemValueMap.get(parentItem);

  parentItem.classList.replace("debugVarListItem-collapsed", "debugVarListItem-expanded");
  
  if(childList)
  {
    childList.style.display = "block";
    return;
  }
  
  childList = document.createElement("ul");

  switch(parentValue.type)
  {
    case OBJ_TYPE_USER_FUNC:
      selectEditorLine(parentValue.declSourceLineNum);
      return;

    case OBJ_TYPE_ARRAY:
      for(var linearIndex = 0; linearIndex < parentValue.items.length; linearIndex++)
      {
        value = parentValue.items[linearIndex];
        if(value === null) continue;
        key = "[" + ObjArray.prototype.getIndexes.call(parentValue, linearIndex).join() + "]";
        debugAddVarListItem(key, value, childList, itemValueMap);
      }
      break;

    case OBJ_TYPE_STRUCT:
      for ([key, value] of parentValue.fieldMap)
        debugAddVarListItem(key, value, childList, itemValueMap);
      break;

    case OBJ_TYPE_STRUCT_DEF:
      for(const ident of parentValue.fieldIdents)
        debugAddVarListItem(null, ident, childList, itemValueMap);
      break;
  }

  parentItem.appendChild(childList);
}

function debugCollapseVarListItem(parentItem, itemValueMap, childList)
//If any of the items in the given child list have child lists of their own, just hide
//the given list; otherwise, remove it and any entries it has in the itemValueMap
{
  var childListItems = childList.getElementsByTagName("li");

  parentItem.classList.replace("debugVarListItem-expanded", "debugVarListItem-collapsed");

  for(const item of childListItems)
  {
    if(item.querySelector("ul"))
    {
      childList.style.display = "none";
      return;
    }
  }

  for(const item of childListItems)
  {
    if(itemValueMap.has(item))
      itemValueMap.delete(item);
  }

  childList.remove();
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
    listItem.classList.add("debugVarListItem-collapsed");
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

function debugToggleBtn_onClick(event)
//
{
  if(isDebugging)
  { 
    debugToggleBtn.style.border = "";
	  debugDiv.style.display = "none";
    mainDiv.style.marginLeft = "0";
    
    progWorker.postMessage({msgId: MSGID_DEBUG_DISABLE});
  }
  else
  {
    debugToggleBtn.style.border = "inset 2px";
	  debugDiv.style.display = "block";
    mainDiv.style.marginLeft = debugDiv.clientWidth + "px";

    progWorker.postMessage({msgId: MSGID_DEBUG_ENABLE});
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

function debugResumeBtn_onClick(event)
//
{
  if(!(isDebugging && isRunning))
    return;

  progWorker.postMessage({msgId: MSGID_DEBUG_RESUME});
}

function debugPauseBtn_onClick(event)
//
{
  if(!(isDebugging && isRunning))
    return;

  progWorker.postMessage({msgId: MSGID_DEBUG_PAUSE});
}

function debugStepBtn_onClick(event)
//
{
  if(!(isDebugging && isRunning))
    return;

  progWorker.postMessage({msgId: MSGID_DEBUG_STEP});
}

function debugStepOverBtn_onClick(event)
//
{
  if(!(isDebugging && isRunning))
    return;

  progWorker.postMessage({msgId: MSGID_DEBUG_STEP_OVER});
}

function debugStepOutBtn_onClick(event)
//
{
  if(!(isDebugging && isRunning))
    return;
  
  progWorker.postMessage({msgId: MSGID_DEBUG_STEP_OUT});
}

function debugSkipBtn_onClick(event)
//
{
  if(!(isDebugging && isRunning))
    return;

  progWorker.postMessage({msgId: MSGID_DEBUG_SKIP});
}

function debugCallStackList_onChange(event)
//
{
  var callFrameIndex;
  
  if(!(isDebugging && isRunning))
    return;

  callFrameIndex = (event.target.length - 1) - event.target.selectedIndex;

  progWorker.postMessage({msgId: MSGID_DEBUG_CALL_FRAME_INFO_REQUEST, msgData: {callFrameIndex: callFrameIndex}});
}

function debugVarListItem_onClick(event)
//
{
  var parentItem = event.target.parentElement;
  var itemValueMap = (debugLocalsItemValueMap.has(parentItem) ? debugLocalsItemValueMap : debugGlobalsItemValueMap)
  var childList = parentItem.querySelector("ul");

  if(childList && (childList.style.display != "none"))
    debugCollapseVarListItem(parentItem, itemValueMap, childList);
  else
    debugExpandVarListItem(parentItem, itemValueMap, childList);
}

function onMsgDebugUpdateUI(msgData)
//
{
  selectEditorLine(msgData.sourceLineNum);

  debugChangeUIStatus(msgData.uiStatus);

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
