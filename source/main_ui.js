//Main CSS
document.head.appendChild(document.createElement('style')).textContent =
`
*
{
  box-sizing: border-box;
}

body
{
  background-color: lightgray;
}

@keyframes buttonBlinkAnimation {
  0%, 100%
  {
    background-color: lightgray;
    color: black;
    text-shadow: 1px 1px white;
  }
  50%
  {
    background-color: royalblue;
    color: white;
    text-shadow: none;
  }
}

.buttonBlink {
  animation: buttonBlinkAnimation 2s 3;
}

button img
{
  vertical-align: middle;
  margin-right: 0.3em;
}

button:disabled img
{
  opacity: 0.5;
  filter: grayscale(100%);
}

button span
{
  vertical-align: middle;
}

.buttonFace,
button,
.bar,
#statusBar
{
  background-color: lightgray;
  padding: 4px;
  border: 1px solid lightgray;
}

.buttonFaceReleased,
button:not(:disabled):not(:active):hover,
.bar
{
  border-bottom: 1px solid gray;
  border-right: 1px solid gray;
  border-top: 1px solid white;
  border-left: 1px solid white;
}

.buttonFacePressed,
button:not(:disabled):active,
#statusBar
{
  border-bottom: 1px solid white;
  border-right: 1px solid white;
  border-top: 1px solid gray;
  border-left: 1px solid gray;
}

button:focus-visible
{
  outline: 1px solid black;
}

button
{
  text-shadow: 1px 1px white;
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
  white-space: pre-wrap;
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

const versionHTML = `<div id="version">Version ` + lbVersion;
var mainDiv = document.getElementById("mainDiv");
var statusBar = document.getElementById("statusBar");

var isRunning = false;
var uiOnProgStartHandlers = [];
var uiOnProgEndHandlers = [];
var uiOnMainResetHandlers = [];
var progWorker = null;
var uiMessageMap = new Map();
var paramFileURL = "";
var autoRun = false;
const WELCOME_HAS_BEEN_SHOWN_KEY = "welcomeHasBeenShown";
const LAST_VISITED_VERSION_KEY = "lastVisitedVersion";

readURLParams();

initWorker();

setMainUIEvents();

loadUIComponents();


function readURLParams()
//
{
  var urlParams = new URLSearchParams(window.location.search);

  // if(urlParams.has("run"))
  // {
  //   paramFileURL = urlParams.get("run");
  //   mainMode = MAIN_MODE_DEPLOY;
  //   return;
  // }

  if(urlParams.has("open"))
  {
    paramFileURL = urlParams.get("open");
    mainMode = MAIN_MODE_EDIT;

    if(urlParams.has("autoRun"))
      autoRun = (urlParams.get("autoRun").toLowerCase() == "true");
  }
}

function checkIfWelcomeHasBeenShown()
//
{
  var welcomeHasBeenShown = window.localStorage.getItem(WELCOME_HAS_BEEN_SHOWN_KEY);

  if(!welcomeHasBeenShown)
  {
    window.localStorage.setItem(WELCOME_HAS_BEEN_SHOWN_KEY, "true");
    return false;
  }
  
  return true;
}

function checkIfVersionHasChanged()
//
{
  var lastVisitedVersion = window.localStorage.getItem(LAST_VISITED_VERSION_KEY);

  if(!lastVisitedVersion || lastVisitedVersion != lbVersion)
  {
    window.localStorage.setItem(LAST_VISITED_VERSION_KEY, lbVersion);
    return true;
  }

  return false;
}

function initWorker()
//Terminate and restart the worker thread
{
  progWorker = new Worker('./source/main_worker.js?mode=' + mainMode);
  progWorker.onmessage = mainUI_onMessage;
}

function setMainUIEvents()
//
{
  uiMessageMap.set(MSGID_PROG_DONE, onMsgProgDone);
  uiMessageMap.set(MSGID_STATUS_CHANGE, onMsgStatusChange);
  
  window.addEventListener("load", window_onLoad);
  window.addEventListener("beforeunload", window_onBeforeUnload);
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

function resetMain()
//
{
  statusBar.innerText = "Ready.";
  
  uiOnMainResetHandlers.forEach(handler => handler());
}

function startProg(source)
//Signal the worker thread to start the program
{
  if(isRunning)
    return;

  uiOnProgStartHandlers.forEach(handler => handler());

  progWorker.postMessage({msgId: MSGID_START_PROG, msgData: {source: source}});

  isRunning = true;
}

function endProg(exitMessage, exitStatus, error)
//Set the UI to reflect that the program has stopped running
{
  if(!isRunning)
    return;

  statusBar.innerText = exitMessage;

  if(exitStatus == PROG_EXIT_STATUS_TERMINATED)
  {
    progWorker.terminate();
    initWorker();
  }

  uiOnProgEndHandlers.forEach(handler => handler(exitStatus, error));

  isRunning = false;
}

function window_onLoad(event)
//
{
  if(mainMode == MAIN_MODE_EDIT)
  {
    setToggleEvents();
    mainDiv.insertAdjacentHTML("beforeend", versionHTML);
    
    if(!checkIfWelcomeHasBeenShown() && !autoRun)
    {
      aboutDialog.showModal();
    }
    else
    {
      if(checkIfVersionHasChanged() && !autoRun)
        toggleUpdatesBtnHighlighted();
    }

    if(paramFileURL == "")
      return;

    statusBar.innerText = `Loading '${paramFileURL}'...`;

    readCodeFileFromURL(paramFileURL)
    .then((codeFile) =>
    {
      loadCodeFile(codeFile);

      if(autoRun)
        startProg(codeFile.data);
    })
    .catch((errorMessage) =>
    {
      statusBar.innerText = errorMessage;
    });

    return;
  }

  // if(mainMode == MAIN_MODE_DEPLOY)
  // {
  //   hideToggles();
  //   return;
  // }
}

function window_onBeforeUnload(event)
//
{
  if(codeHasChanged)
  {
    event.preventDefault();
    event.returnValue = "";
  }
}

function mainUI_onMessage(message)
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
    endProg(msgData.error.message, PROG_EXIT_STATUS_ERROR, msgData.error);
  else
    endProg("Program run successfully.", PROG_EXIT_STATUS_SUCCESS, null);
}

function onMsgStatusChange(msgData)
//Display a status change
{
  statusBar.innerText = msgData.statusText;
}

function toggle_onClick(event)
{
  this.parentElement.querySelector(".pane-open").classList.toggle("pane-closed");
  this.classList.toggle("toggle-closed");
}
