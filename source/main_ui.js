const statusBarHTML = `<div id="statusBar">Ready.</div>`;
const versionHTML = `<div id="version">Version 2.0.2.11 - <a href="../updates.html" target="_blank">Updates</a></div>`;

var isRunning = false;
var mainDiv = document.getElementById("mainDiv");
var statusBar;
var toggles = document.getElementsByClassName("toggle-open");
var progWorker = new Worker('main_worker.js');
var uiMessageMap = new Map();

window.addEventListener("load", window_onLoad);

for(var i = 0; i < toggles.length; i++)
  toggles[i].addEventListener("click", toggle_onClick);

progWorker.onmessage = progUI_onMessage;

uiMessageMap.set(MSGID_PROG_DONE_SUCCESS, onMsgProgDoneSuccess);
uiMessageMap.set(MSGID_PROG_DONE_ERROR, onMsgProgDoneError);
uiMessageMap.set(MSGID_STATUS_CHANGE, onMsgStatusChange);

loadScript("debug_ui.js");
loadScript("editor_ui.js");
mainDiv.insertAdjacentHTML("beforeend", statusBarHTML);
loadScript("console_ui.js");
loadScript("canvas_ui.js");
mainDiv.insertAdjacentHTML("beforeend", versionHTML);
loadScript("sound_ui.js");
loadScript("sprite_ui.js");


function loadCSS(fileURL)
//
{
  var link = document.createElement('link');

  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = fileURL;
  document.head.appendChild(link);
}

function loadScript(fileURL)
//
{
  var script = document.createElement('script');

  script.type = "text/javascript";
  script.src = fileURL;
  document.head.appendChild(script);
}

function loadHTML(fileURL, position)
//
{
  var httpReq = new XMLHttpRequest();

  httpReq.onload = function()
  {
    mainDiv.insertAdjacentHTML(position, this.responseText);
  };

  httpReq.open("GET", fileURL);
  httpReq.send();
}

function switchMode()
//Switch between run and edit modes
{
  runBtn.disabled = !runBtn.disabled;
  stopBtn.disabled = !stopBtn.disabled;
  editorCode.readOnly = !editorCode.readOnly;
  isRunning = !isRunning;
}

function cleanupUI(exitStatus)
//Set the UI to reflect that the program has stopped running
{
  if(!isRunning)
    return;

  closeConsoleInput();
  cleanupCanvas();
  cleanupSounds();
  cleanupSpriteSheets();
  debugChangeUIStatus(DEBUG_UI_STATUS_DISABLED);
  
  statusBar.innerHTML = exitStatus;

  switchMode();
}

function startProg(source)
//Reset the UI and signal the worker thread to start the program
{
  if(isRunning)
    return;

  clearConsoleOutput();
  resetCanvas();
  debugClearDisplays();
  
  progWorker.postMessage({msgId: MSGID_START_PROG, msgData: {source: source}});

  switchMode();
}

function stopProg()
//Terminate and restart the worker thread
{
  progWorker.terminate();
  progWorker = new Worker('main_worker.js');
  progWorker.onmessage = progUI_onMessage;

  //Reload saved breakpoints into the worker thread
  for(const breakpoint of debugBreakpointBackups)
    progWorker.postMessage({msgId: MSGID_DEBUG_ADD_BREAKPOINT, msgData: breakpoint});

  if(isDebugging)
    progWorker.postMessage({msgId: MSGID_DEBUG_ENABLE, msgData: null});

  cleanupUI("Program stopped.");
}

function window_onLoad(event)
//Parse URL parameters (if present) and take appropriate action
{
  var urlParams = new URLSearchParams(window.location.search);
  var fileURL;

  if(!urlParams.has("open"))
    return;

  fileURL = urlParams.get("open");

  loadSourceFile(fileURL);
}

function progUI_onMessage(message)
//Process messages sent from the worker thread
{
  if(!isRunning)
    return;

  uiMessageMap.get(message.data.msgId)(message.data.msgData);
}

function toggle_onClick(event)
{
  this.parentElement.querySelector(".pane-open").classList.toggle("pane-closed");
  this.classList.toggle("toggle-closed");
}


function onMsgProgDoneSuccess(msgData)
//The worker thread has signaled that the program has completed successfully
{
  cleanupUI("Program run successfully.");
}

function onMsgProgDoneError(msgData)
//The worker thread has signaled that the program has stopped with an error
{
  if(msgData.error.sourceName == mainSourceName)
    selectEditorLine(msgData.error.sourceLineNum);

  cleanupUI(msgData.error.message);
}

function onMsgStatusChange(msgData)
//Display a status change
{
  statusBar.innerHTML = msgData.statusText;
}

