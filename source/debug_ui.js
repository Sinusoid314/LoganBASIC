loadCSS("debug.css");
loadHTML("debug.html", "beforebegin");
loadScript("debug_common.js");

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
var debugStepIntoBtn = document.getElementById("debugStepIntoBtn");
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
debugStepIntoBtn.addEventListener("click", debugStepIntoBtn_onClick);
debugStepOverBtn.addEventListener("click", debugStepOverBtn_onClick);
debugStepOutBtn.addEventListener("click", debugStepOutBtn_onClick);
debugSkipBtn.addEventListener("click", debugSkipBtn_onClick);
debugCallStackList.addEventListener("change", debugCallStackList_onChange);

uiMessageMap.set(MSGID_DEBUG_UPDATE_UI, onMsgDebugUpdateUI);


function debugChangeUIStatus(newStatus)
//
{
  if(!isDebugging)
    return;

  debugResumeBtn.disabled = !((newStatus == DEBUG_UI_STATUS_STEPPING) || (newStatus == DEBUG_UI_STATUS_BREAKPOINT));

  //debugPauseBtn.disabled = !(newStatus == DEBUG_UI_STATUS_RESUMED);
  
  debugStepIntoBtn.disabled = !((newStatus == DEBUG_UI_STATUS_RESUMED) || (newStatus == DEBUG_UI_STATUS_BREAKPOINT));
  
  debugStepOverBtn.disabled
  = debugStepOutBtn.disabled
  = debugSkipBtn.disabled
  = !(newStatus == DEBUG_UI_STATUS_BREAKPOINT);
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

function debugAddBreakpoint(sourceLineNum, sourceName)
//
{
  var newBreakpoint = new DebugBreakpoint(sourceLineNum, sourceName);

  debugBreakpointBackups.push(newBreakpoint);
  progWorker.postMessage({msgId: MSGID_DEBUG_ADD_BREAKPOINT, msgData: newBreakpoint});
}

function debugRemoveBreakpoint(sourceLineNum, sourceName)
//
{
  var breakpointIndex = debugBreakpointBackups.findIndex(breakpoint => breakpoint.matches(sourceLineNum, mainSourceName));
  
  debugBreakpointBackups.splice(breakpointIndex, 1);
  progWorker.postMessage({msgId: MSGID_DEBUG_REMOVE_BREAKPOINT, msgData: {sourceLineNum: sourceLineNum, sourceName: sourceName}});
}

function debugToggleBtn_onClick(event)
//
{
  if(isDebugging)
  { 
    debugToggleBtn.style.border = "";
	  debugDiv.style.display = "none";
    mainDiv.style.marginLeft = "0";
    debugChangeUIStatus(DEBUG_UI_STATUS_DISABLED);
    
    progWorker.postMessage({msgId: MSGID_DEBUG_DISABLE, msgData: null});
  }
  else
  {
    debugToggleBtn.style.border = "inset 2px";
	  debugDiv.style.display = "block";
    mainDiv.style.marginLeft = debugDiv.clientWidth + "px";

    progWorker.postMessage({msgId: MSGID_DEBUG_ENABLE, msgData: null});
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

  progWorker.postMessage({msgId: MSGID_DEBUG_RESUME, msgData: null});
}

function debugStepIntoBtn_onClick(event)
//
{
  if(!(isDebugging && isRunning))
    return;

  progWorker.postMessage({msgId: MSGID_DEBUG_STEP_INTO, msgData: null});
}

function debugStepOverBtn_onClick(event)
//
{
  if(!(isDebugging && isRunning))
    return;

  progWorker.postMessage({msgId: MSGID_DEBUG_STEP_OVER, msgData: null});
}

function debugStepOutBtn_onClick(event)
//
{
  if(!(isDebugging && isRunning))
    return;
  
  progWorker.postMessage({msgId: MSGID_DEBUG_STEP_OUT, msgData: null});
}

function debugSkipBtn_onClick(event)
//
{
  if(!(isDebugging && isRunning))
    return;

  progWorker.postMessage({msgId: MSGID_DEBUG_SKIP, msgData: null});
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
