const versionHTML = `<div id="version">Version 2.0.2.20 - <a href="../updates.html" target="_blank">Updates</a></div>`;

var isRunning = false;
var mainDiv = document.getElementById("mainDiv");
var statusBar = document.getElementById("statusBar");
var progWorker = null;
var uiMessageMap = new Map();
var urlParams = new URLSearchParams(window.location.search);
var paramFileURL = "";

if(urlParams.has("open"))
  paramFileURL = urlParams.get("open");

initWorker();

setMainEvents();

loadDebugUI();
loadEditorUI();
loadConsoleUI();
loadCanvasUI();
loadSoundUI();
loadSpriteUI();


function initWorker()
//Terminate and restart the worker thread
{
  if(progWorker)
    progWorker.terminate();

  progWorker = new Worker('main_worker.js?mode=' + mainMode);
  progWorker.onmessage = progUI_onMessage;
}

function setMainEvents()
//
{
  uiMessageMap.set(MSGID_PROG_DONE, onMsgProgDone);
  uiMessageMap.set(MSGID_STATUS_CHANGE, onMsgStatusChange);
  
  window.addEventListener("load", window_onLoad);
}

function loadDebugUI()
//
{
  loadScript("./core/object.js");
  loadScript("debug_common.js");
  loadScript("debug_ui.js");
}

function loadEditorUI()
//
{
  loadScript("editor_ui.js");
}

function loadConsoleUI()
//
{
  loadCSS("console.css");
  loadScript("console_html.js");
  loadScript("console_common.js");
  loadScript("console_ui.js");
}

function loadCanvasUI()
//
{
  loadCSS("canvas.css");
  loadScript("canvas_html.js");
  loadScript("canvas_common.js");
  loadScript("canvas_ui.js");
}

function loadSoundUI()
//
{
  loadScript("sound_common.js");
  loadScript("sound_ui.js");
}

function loadSpriteUI()
//
{
  loadScript("sprite_common.js");
  loadScript("sprite_ui.js");
}

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
  script.async = false;
  script.src = fileURL;
  document.head.appendChild(script);
}

function startProg(source)
//Signal the worker thread to start the program
{
  progWorker.postMessage({msgId: MSGID_START_PROG, msgData: {source: source}});
  isRunning = true;
}

function onProgEnd(exitMessage)
//Set the UI to reflect that the program has stopped running
{
  closeConsoleInput();
  cleanupCanvas();
  cleanupSounds();
  cleanupSpriteSheets();
  debugChangeUIStatus(DEBUG_UI_STATUS_DISABLED);
  switchEditorMode();
  
  statusBar.innerHTML = exitMessage;

  isRunning = false;
}

function window_onLoad(event)
//
{
  var toggles = document.getElementsByClassName("toggle-open");

  for(var i = 0; i < toggles.length; i++)
    toggles[i].addEventListener("click", toggle_onClick);

  mainDiv.insertAdjacentHTML("beforeend", versionHTML);
}

function progUI_onMessage(message)
//Process messages sent from the worker thread
{
  if(!isRunning)
    return;

  uiMessageMap.get(message.data.msgId)(message.data.msgData);
}

function onMsgProgDone(msgData)
//The worker thread has signaled that the program has ended
{
  var exitMessage;

  if(msgData.error)
  {
    if(msgData.error.sourceName == mainSourceName)
      selectEditorLine(msgData.error.sourceLineNum);

    exitMessage = msgData.error.message;
  }
  else
    exitMessage = "Program run successfully.";

  onProgEnd(exitMessage);
}

function onMsgStatusChange(msgData)
//Display a status change
{
  statusBar.innerHTML = msgData.statusText;
}

function toggle_onClick(event)
{
  this.parentElement.querySelector(".pane-open").classList.toggle("pane-closed");
  this.classList.toggle("toggle-closed");
}
