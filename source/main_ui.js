import * as ThreadMsgUI from "./thread_msg/thread_msg_ui.js";
import * as ProgLoadUI from "./prog_load/prog_load_ui.js";
import * as MainCommon from "./main_common.js";


const templateCSS =
`
<style id="mainUIStyle">
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
</style>

<style id="mainDivStyle">
  #mainDiv
  {
    padding: 0px;
  }
</style>

<style id="menuBarStyle">
  #menuBar
  {
    margin-bottom: 15px;
  }
</style>

<style id="commandBarStyle">
  #commandBar
  {
    margin-top: 10px;
    margin-bottom: 0px;
  }

  #runBtn
  {
    padding-inline: 1.5em;
    padding-block: 0.15em;
    background-color: rgb(136, 236, 166);
  }

  #stopBtn
  {
    padding-inline: 1.5em;
    padding-block: 0.15em;
    background-color: rgb(242, 168, 168);
  }
</style>

<style id="statusBarStyle">
  #statusBar
  {
    margin-bottom: 20px;
    white-space: pre-wrap;
  }
</style>

<style id="versionDivStyle">
  #versionDiv
  {
    margin-top: 30px;
  }
</style>
`;


const templateHTML =
`
<div id="mainDiv"></div>

<div id="menuBar" class="bar">
  <button id="newBtn"><img src="./assests/new.png" alt="New"><span>New</span></button>
  <button id="openBtn"><img src="./assests/open.png" alt="Open"><span>Open</span></button>
  <button id="saveBtn"><img src="./assests/save.png" alt="Save"><span>Save</span></button>
  <div class="bar-seperator"></div>
  <button id="examplesBtn"><img src="./assests/examples.png" alt="Examples"><span>Examples</span></button>
  <button id="helpBtn"><img src="./assests/help.png" alt="Help"><span>Help</span></button>
  <button id="aboutBtn"><img src="./assests/about.png" alt="About"><span>About</span></button>
  <button id="updatesBtn"><img src="./assests/updates.png" alt="Updates"><span>Updates</span></button>
</div>

<div id="commandBar" class="bar">
  <button id="runBtn"><img src="./assests/run.png" alt="Run"><span>Run</span></button>
  <button id="stopBtn" disabled><img src="./assests/stop.png" alt="Stop"><span>Stop</span></button>
  <div class="bar-seperator"></div>
  <button id="debugToggleBtn"><img src="./assests/debug.png" alt="Debug"><span>Debug</span></button>
  <div class="bar-seperator"></div>
</div>

<div id="statusBar">Ready.</div>

<div id="versionDiv">Version ${MainCommon.lbVersion} </div>
`;


var AboutUI, DebugUI, EditorUI, ConsoleUI, CanvasUI, SoundUI, SpriteUI;

var mainUIStyle, mainDivStyle, menuBarStyle, commandBarStyle, statusBarStyle, versionDivStyle;
var menuBar, mainDiv, commandBar, statusBar, versionDiv;
var newBtn, openBtn, saveBtn;
var examplesBtn, helpBtn, aboutBtn, updatesBtn;
var runBtn, stopBtn, debugToggleBtn;

var paramFileURL = "";
var autoRun = false;
var fileOpInProgress = false;
const WELCOME_HAS_BEEN_SHOWN_KEY = "welcomeHasBeenShown";
const LAST_VISITED_VERSION_KEY = "lastVisitedVersion";


readURLParams();

createStyles();
createElements();
setEvents();

await loadUIComponents();
mountUIComponents()


function readURLParams()
//
{
  var urlParams = new URLSearchParams(window.location.search);

  // if(urlParams.has("run"))
  // {
  //   paramFileURL = urlParams.get("run");
  //   MainCommon.setMainMode(MainCommon.MAIN_MODE_DEPLOY);
  //   return;
  // }

  if(urlParams.has("open"))
  {
    paramFileURL = urlParams.get("open");
    MainCommon.setMainMode(MainCommon.MAIN_MODE_EDIT);

    if(urlParams.has("autoRun"))
      autoRun = (urlParams.get("autoRun").toLowerCase() == "true");
  }
}

function createStyles()
//
{
  const template = document.createElement("template");
  template.innerHTML = templateCSS;

  mainUIStyle = template.content.getElementById("mainUIStyle");
  mainDivStyle = template.content.getElementById("mainDivStyle");
  menuBarStyle = template.content.getElementById("menuBarStyle");
  commandBarStyle = template.content.getElementById("commandBarStyle");
  statusBarStyle = template.content.getElementById("statusBarStyle");
  versionDivStyle = template.content.getElementById("versionDivStyle");
}

function createElements()
//
{
  const template = document.createElement("template");
  template.innerHTML = templateHTML;

  mainDiv = template.content.getElementById("mainDiv");
  
  menuBar = template.content.getElementById("menuBar");
  newBtn = template.content.getElementById("newBtn");
  openBtn = template.content.getElementById("openBtn");
  saveBtn = template.content.getElementById("saveBtn");
  examplesBtn = template.content.getElementById("examplesBtn");
  helpBtn = template.content.getElementById("helpBtn");
  aboutBtn = template.content.getElementById("aboutBtn");
  updatesBtn = template.content.getElementById("updatesBtn");

  commandBar = template.content.getElementById("commandBar");
  runBtn = template.content.getElementById("runBtn");
  stopBtn = template.content.getElementById("stopBtn");
  debugToggleBtn = template.content.getElementById("debugToggleBtn");

  statusBar = template.content.getElementById("statusBar");
  versionDiv = template.content.getElementById("versionDiv");
}

function setEvents()
//
{
  window.addEventListener("load", window_onLoad);
  window.addEventListener("beforeunload", window_onBeforeUnload);

  newBtn.addEventListener("click", newBtn_onClick);
  openBtn.addEventListener("click", openBtn_onClick);
  saveBtn.addEventListener("click", saveBtn_onClick);
  examplesBtn.addEventListener("click", examplesBtn_onClick);
  helpBtn.addEventListener("click", helpBtn_onClick);
  aboutBtn.addEventListener("click", aboutBtn_onClick);
  updatesBtn.addEventListener("click", updatesBtn_onClick);

  runBtn.addEventListener("click", runBtn_onClick);
  stopBtn.addEventListener("click", stopBtn_onClick);
  debugToggleBtn.addEventListener("click", debugToggleBtn_onClick);

  ProgLoadUI.uiOnProgStartHandlers.push(mainUI_onProgStart);
  ProgLoadUI.uiOnProgEndHandlers.push(mainUI_onProgEnd);
  ProgLoadUI.uiOnStatusChange.push(mainUI_onStatusChange);
}

async function loadUIComponents()
//
{
  if(MainCommon.mainMode == MainCommon.MAIN_MODE_EDIT)
  {
    AboutUI = await import("./about/about_ui.js");
    DebugUI = await import("./debug/debug_ui.js");
    EditorUI = await import("./editor/editor_ui.js");
  }

  ConsoleUI = await import("./console/console_ui.js");
  CanvasUI = await import("./canvas/canvas_ui.js");
  SoundUI = await import("./sound/sound_ui.js");
  SpriteUI = await import("./sprite/sprite_ui.js");
}

function mountUIComponents()
//
{
  document.head.appendChild(mainUIStyle);

  mountMainDiv();

  if(MainCommon.mainMode == MainCommon.MAIN_MODE_EDIT)
  {
    AboutUI.mountDialog(mainDiv);

    DebugUI.mountDiv(mainDiv);

    mountMenuBar();
    EditorUI.mountDiv(mainDiv);
    mountCommandBar();
    
    mountStatusBar();
  }

  ConsoleUI.mountDiv(mainDiv);
  CanvasUI.mountDiv(mainDiv);

  if(MainCommon.mainMode == MainCommon.MAIN_MODE_EDIT)
    mountVersionDiv();
}

function mountMainDiv()
//
{
  document.head.appendChild(mainDivStyle);
  document.body.insertAdjacentElement("beforeend", mainDiv);
}

function mountMenuBar()
//
{
  document.head.appendChild(menuBarStyle);
  mainDiv.insertAdjacentElement("beforeend", menuBar);
}

function mountCommandBar()
//
{
  document.head.appendChild(commandBarStyle);
  mainDiv.insertAdjacentElement("beforeend", commandBar);
}

function mountStatusBar()
//
{
  document.head.appendChild(statusBarStyle);
  mainDiv.insertAdjacentElement("beforeend", statusBar);
}

function mountVersionDiv()
//
{
  document.head.appendChild(versionDivStyle);
  mainDiv.insertAdjacentElement("beforeend", versionDiv);
}

function resetMain()
//
{
  statusBar.innerText = "Ready.";
  
  DebugUI.debugClearDisplays();
  EditorUI.resetEditor();
  ConsoleUI.clearConsoleOutput();
  CanvasUI.resetCanvas();
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

function toggleUpdatesBtnHighlighted()
//
{
  if(updatesBtn.classList.toggle("buttonBlink"))
    updatesBtn.querySelector("span").textContent = "See what's new!";
  else
    updatesBtn.querySelector("span").textContent = "Updates";
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

  if(!lastVisitedVersion || lastVisitedVersion != MainCommon.lbVersion)
  {
    window.localStorage.setItem(LAST_VISITED_VERSION_KEY, MainCommon.lbVersion);
    return true;
  }

  return false;
}

function beginFileOpAwait(statusMessage)
//
{
  newBtn.disabled = true;
  openBtn.disabled = true;
  saveBtn.disabled = true;
  statusBar.innerText = statusMessage;
  fileOpInProgress = true;
}

function endFileOpAwait(statusMessage)
//
{
  newBtn.disabled = false;
  openBtn.disabled = false;
  saveBtn.disabled = false;
  statusBar.innerText = statusMessage;
  fileOpInProgress = false;
}

async function window_onLoad(event)
//
{
  var codeFile;

  if(MainCommon.mainMode == MainCommon.MAIN_MODE_EDIT)
  {
    setToggleEvents();
    
    if(!checkIfWelcomeHasBeenShown() && !autoRun)
    {
      AboutUI.showDialog();
    }
    else
    {
      if(checkIfVersionHasChanged() && !autoRun)
        EditorUI.toggleUpdatesBtnHighlighted();
    }

    if(paramFileURL == "")
      return;

    try
    {
      EditorUI.beginFileOpAwait(`Loading '${paramFileURL}'...`);

      codeFile = await ((paramFileURL == "local") ? EditorUI.readCodeFileFromLocalStorage() : EditorUI.readCodeFileFromURL(paramFileURL));
      EditorUI.loadCodeFileIntoEditor(codeFile);

      EditorUI.endFileOpAwait("File loaded successfully.");

      if(autoRun)
        startProg(codeFile.data);
    }
    catch(errorMessage)
    {
      EditorUI.endFileOpAwait(errorMessage);
    }

    return;
  }

  // if(MainCommon.mainMode == MainCommon.MAIN_MODE_DEPLOY)
  // {
  //   hideToggles();
  //   return;
  // }
}

function window_onBeforeUnload(event)
//
{
  if(MainCommon.mainMode == MainCommon.MAIN_MODE_EDIT)
  {
    if(EditorUI.codeHasChanged)
    {
      event.preventDefault();
      event.returnValue = "";
    }
  }
}

async function newBtn_onClick(event)
//Open a blank editor in a new tab
{
  if(ProgLoadUI.isRunning || fileOpInProgress)
    return;

  if(EditorUI.codeHasChanged)
  {
    if(!confirm("You have unsaved changes to '" + EditorUI.codeFileName + "'. Are you sure you want to start a new file?"))
      return;
  }
  
  resetMain();
}

async function openBtn_onClick(event)
//Open a code file from disk
{
  if(ProgLoadUI.isRunning || fileOpInProgress)
    return;

  if(EditorUI.codeHasChanged)
  {
    if(!confirm("You have unsaved changes to '" + EditorUI.codeFileName + "'. Are you sure you want to open another file?"))
      return;
  }

  try
  {
    beginFileOpAwait("Opening file...");

    const codeFile = await (("showOpenFilePicker" in window) ? EditorUI.readCodeFileFromHandle() : EditorUI.readCodeFileFromInput());
    resetMain();
    EditorUI.loadCodeFileIntoEditor(codeFile);

    endFileOpAwait("File opened successfully.");
  }
  catch(errorMessage)
  {
    endFileOpAwait(errorMessage);
  }
}

async function saveBtn_onClick(event)
//Save the current code to disk
{
  if(ProgLoadUI.isRunning || fileOpInProgress)
    return;

  try
  {
    beginFileOpAwait("Saving file...");

    if("showOpenFilePicker" in window)
      await EditorUI.saveCodeFileFromHandle();
    else
      await EditorUI.saveCodeFileFromAnchor();

    EditorUI.codeHasChanged = false;
    EditorUI.codeFileNameDisplay.innerText = EditorUI.codeFileName;

    endFileOpAwait("File saved successfully.");
  }
  catch(errorMessage)
  {
    endFileOpAwait(errorMessage);
  }
}

function examplesBtn_onClick(event)
//Open the examples page
{
  window.open("./examples/examples.html", "_blank");
}

function helpBtn_onClick(event)
//Open the help files page
{
  window.open("./docs/help/help.html", "_blank");
}

function aboutBtn_onClick(event)
//Open the About dialog box
{
  AboutUI.showDialog();
}

function updatesBtn_onClick(event)
//Open the Updates page
{
  window.open("./updates.html", "_blank");
  toggleUpdatesBtnHighlighted();
}

function runBtn_onClick(event)
//
{ 
  ProgLoadUI.startProg(EditorUI.editorCode.value);
}

function stopBtn_onClick(event)
//
{
  ProgLoadUI.endProg("Program stopped.", ProgLoadUI.PROG_EXIT_STATUS_TERMINATED, null);
}

function debugToggleBtn_onClick(event)
//
{
  debugToggleBtn.style.border = (DebugUI.isDebugging) ? "" : "inset 2px";
  DebugUI.debugToggleDiv();
}

function mainUI_onProgStart()
//
{
  newBtn.disabled = true;
  openBtn.disabled = true;
  saveBtn.disabled = true;
  runBtn.disabled = true;
  stopBtn.disabled = true;
}

function mainUI_onProgEnd(exitStatus, error)
//
{
  newBtn.disabled = false;
  openBtn.disabled = false;
  saveBtn.disabled = false;
  runBtn.disabled = false;
  stopBtn.disabled = false;

  statusBar.innerText = exitMessage;
}

function mainUI_onStatusChange(statusText)
//
{
  statusBar.innerText = statusText;
}

function toggle_onClick(event)
{
  this.parentElement.querySelector(".pane-open").classList.toggle("pane-closed");
  this.classList.toggle("toggle-closed");
}
