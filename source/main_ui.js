//Main CSS
document.head.appendChild(document.createElement('style')).textContent =
`
button
{
  margin-right: 2px;
  margin-left: 2px;
  text-shadow: 1px 1px white;
}

.bar
{
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 2px;
  background-color: #ccccff;
  box-shadow: 1px 1px gray;
}

.bar-seperator
{
  display: inline;
  border-left: 1px solid gray;
  border-right: 1px solid white;
  margin-left: 8px;
  margin-right: 8px;
}

.toggle-open
{
  text-shadow: 1px 1px lightgray;
  cursor: pointer;
  user-select: none;
}

.toggle-open::after
{
  content: "\\25BC";
  color: black;
  display: inline-block;
  margin-left: 6px;
}

.toggle-closed::after
{
  transform: rotate(-90deg);
}

.pane-open
{
  display: block;
}

.pane-closed
{
  display: none;
}

#mainDiv
{
  padding: 0px;
}

#statusBar
{
  margin-bottom: 20px;
  padding-top: 1px;
  padding-bottom: 1px;
  padding-left: 2px;
  border: inset 2px;
  white-space: pre-wrap;
  background-color: rgb(231, 241, 241);
}

#version
{
  margin-top: 30px;
}
`;


//Main HTML
document.body.insertAdjacentHTML("afterbegin",
`
<div id="mainDiv">
  <div id="statusBar">Ready.</div>
</div>
`);


const PROG_EXIT_STATUS_SUCCESS = 1;
const PROG_EXIT_STATUS_ERROR = 2;
const PROG_EXIT_STATUS_TERMINATED = 3;

const versionHTML = `<div id="version">Version 2.0.2.28 - <a href="updates.html" target="_blank">Updates</a></div>`;
var mainDiv = document.getElementById("mainDiv");
var statusBar = document.getElementById("statusBar");

var isRunning = false;
var onProgStartHandlers = [];
var onProgEndHandlers = [];
var progWorker = null;
var uiMessageMap = new Map();
var paramFileURL = "";

readURLParams();

initWorker();

setMainUIEvents();

loadUIComponents();


function readURLParams()
//
{
  var urlParams = new URLSearchParams(window.location.search);

  if(urlParams.has("run"))
  {
    paramFileURL = urlParams.get("run");
    mainMode = MAIN_MODE_DEPLOY;
    return;
  }

  if(urlParams.has("open"))
    paramFileURL = urlParams.get("open");
}

function initWorker()
//Terminate and restart the worker thread
{
  progWorker = new Worker('./source/main_worker.js?mode=' + mainMode);
  progWorker.onmessage = progUI_onMessage;
}

function setMainUIEvents()
//
{
  uiMessageMap.set(MSGID_PROG_DONE, onMsgProgDone);
  uiMessageMap.set(MSGID_STATUS_CHANGE, onMsgStatusChange);
  
  window.addEventListener("load", window_onLoad);
}

function loadUIComponents()
//
{
  if(mainMode == MAIN_MODE_EDIT)
  {
    loadDebugUI();
    loadEditorUI();
  }

  loadConsoleUI();
  loadCanvasUI();
  loadSoundUI();
  loadSpriteUI();
}

function loadDebugUI()
//
{
  loadScript("./source/core/object.js");
  loadScript("./source/debug/debug_common.js");
  loadScript("./source/debug/debug_ui.js");
}

function loadEditorUI()
//
{
  loadScript("./source/editor/editor_ui.js");
}

function loadConsoleUI()
//
{
  loadScript("./source/console/console_common.js");
  loadScript("./source/console/console_ui.js");
}

function loadCanvasUI()
//
{
  loadScript("./source/canvas/canvas_common.js");
  loadScript("./source/canvas/canvas_ui.js");
}

function loadSoundUI()
//
{
  loadScript("./source/sound/sound_common.js");
  loadScript("./source/sound/sound_ui.js");
}

function loadSpriteUI()
//
{
  loadScript("./source/sprite/sprite_common.js");
  loadScript("./source/sprite/sprite_ui.js");
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

function loadSourceFile(fileURL)
//Load a slource file from either local storage or a given URL
{
  var httpReq, fileData;

  statusBar.innerHTML = `Loading '${fileURL}'...`;

  return new Promise((resolve, reject)  =>
  {
    if(fileURL == "local")
    {
      fileData = window.localStorage.getItem("fileData");
      if(fileData)
        resolve(fileData);
      else
        reject("Failed to read local storage data.");
    }
    else
    {
      httpReq = new XMLHttpRequest();
      httpReq.open("GET", fileURL);

      httpReq.onreadystatechange = function()
      {
        if(this.readyState != XMLHttpRequest.DONE)
          return;

        if(this.status == 200)
          resolve(this.responseText);
        else
          reject(`Failed to load '${this.responseURL}': ${this.statusText}`);
      };
      
      httpReq.onerror = function()
      {
        reject(`Failed to load '${this.responseURL}': ${this.statusText}`);
      };

      httpReq.send();
    }
  });
}

function setToggleEvents()
//
{
  var toggles = document.getElementsByClassName("toggle-open");

  for(var i = 0; i < toggles.length; i++)
    toggles[i].addEventListener("click", toggle_onClick);
}

function hideToggles()
//
{
  var toggles = document.getElementsByClassName("toggle-open");

  for(var i = 0; i < toggles.length; i++)
    toggles[i].style.display = "none";
}

function startProg(source)
//Signal the worker thread to start the program
{
  if(isRunning)
    return;

  onProgStartHandlers.forEach(handler => handler());

  progWorker.postMessage({msgId: MSGID_START_PROG, msgData: {source: source}});

  isRunning = true;
}

function onProgEnd(exitMessage, exitStatus, error)
//Set the UI to reflect that the program has stopped running
{
  if(!isRunning)
    return;

  statusBar.innerHTML = exitMessage;

  if(exitStatus == PROG_EXIT_STATUS_TERMINATED)
  {
    progWorker.terminate();
    initWorker();
  }

  onProgEndHandlers.forEach(handler => handler(exitStatus, error));

  isRunning = false;
}

function window_onLoad(event)
//
{
  if(mainMode == MAIN_MODE_EDIT)
  {
    setToggleEvents();
    mainDiv.insertAdjacentHTML("beforeend", versionHTML);
  }
  else
  {
    hideToggles();

    loadSourceFile(paramFileURL)
      .then((fileData) => {startProg(fileData)})
      .catch((errorMessage) => {statusBar.innerHTML = errorMessage});
  }
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
  if(msgData.error)
    onProgEnd(msgData.error.message, PROG_EXIT_STATUS_ERROR, msgData.error);
  else
    onProgEnd("Program run successfully.", PROG_EXIT_STATUS_SUCCESS, null);
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
