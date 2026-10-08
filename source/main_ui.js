import * as ThreadMsgUI from "./thread_msg/thread_msg_ui.js";
import * as ProgLoadUI from "./prog_load/prog_load_ui.js";
import * as MainCommon from "./main_common.js";


export const statusBar;
export const uiOnMainResetHandlers = [];

export function resetMain()
//
{
  statusBar.innerText = "Ready.";
  
  uiOnMainResetHandlers.forEach(handler => handler());
}


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

<div id="statusBar">Ready.</div>

<div id="versionDiv">Version ${MainCommon.lbVersion} </div>
`;


var AboutUI, DebugUI, EditorUI, ConsoleUI, CanvasUI, SoundUI, SpriteUI;

var mainUIStyle, mainDivStyle, statusBarStyle, versionDivStyle;
var mainDiv, versionDiv;

var paramFileURL = "";
var autoRun = false;
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
  statusBarStyle = template.content.getElementById("statusBarStyle");
  versionDivStyle = template.content.getElementById("versionDivStyle");
}

function createElements()
//
{
  const template = document.createElement("template");
  template.innerHTML = templateHTML;

  mainDiv = template.content.getElementById("mainDiv");
  statusBar = template.content.getElementById("statusBar");
  versionDiv = template.content.getElementById("versionDiv");
}

function setEvents()
//
{
  window.addEventListener("load", window_onLoad);
  window.addEventListener("beforeunload", window_onBeforeUnload);
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

    EditorUI.mountMenuBar(mainDiv);
    EditorUI.mountDiv(mainDiv);
    EditorUI.mountCommandBar(mainDiv);
    EditorUI.setStatusElement(statusBar);
    
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

function toggle_onClick(event)
{
  this.parentElement.querySelector(".pane-open").classList.toggle("pane-closed");
  this.classList.toggle("toggle-closed");
}
