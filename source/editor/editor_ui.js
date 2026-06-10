//Editor CSS
document.head.appendChild(document.createElement('style')).textContent =
`
#menuBar
{
  margin-bottom: 15px;
}

#codeFileNameInput
{
  margin-left: 20px;
  padding: 4px;
  field-sizing: content;
  min-width: 20px;
}

#codeHasChangedDisplay
{
  color: red;
}

.editorBreakpoint
{
  background: darkred;
  color: white;
}

.editorGutterItem
{
  counter-increment: lineNumber;
  display: block;
  padding-right: 5px;
  border-radius: 30%;
}

.editorGutterItem::before
{
  content: counter(lineNumber);
}

#editorWrapper
{
  height: 225px;
  width: 100%;
  display: flex;
  overflow-y: hidden;
  resize: vertical;
  gap: 1px;
  font-family: monospace;
  border: 1px solid;
  margin-top: 5px;
  background: #bfd5d0;
}

#editorGutter
{
  width: 40px;
  height: 100%;
  position: relative;
  line-height: 15px;
  text-align: right;
  border: 1px inset;
  background: #bfd5d0;
}

#editorCode
{
  width: 100%;
  line-height: 15px;
  padding: 0;
  border: 0px solid;
  outline: none;
  resize: none;
  padding-left: 5px;
}

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

#aboutDialog
{
  margin-block: auto;
  margin-inline: 20%;
}

#aboutForm
{
  margin-inline: 2em;
  text-align: center;
}

#aboutForm ul
{
  display: inline-block;
  text-align: left;
  margin-top: 0;
  margin-inline: 5em;
  font-weight: bolder;
  border: 0px solid black;
}

#aboutForm ul li
{
  margin-block: 0.3em;
}

#aboutCloseBtn
{
  padding-inline: 1.5em;
  padding-block: 0.5em;
}
`;


//Editor HTML
mainDiv.insertAdjacentHTML("afterbegin",
`
<div id="menuBar" class="bar">
  <button id="newBtn"><img src="/assests/new.png" alt="New"><span>New</span></button>
  <button id="openFileBtn"><img src="/assests/open_file.png" alt="Open File"><span>Open File</span></button>
  <button id="openURLBtn"><img src="/assests/open_url.png" alt="Open URL"><span>Open URL</span></button>
  <button id="saveBtn"><img src="/assests/save.png" alt="Save"><span>Save</span></button>
  <div class="bar-seperator"></div>
  <button id="examplesBtn"><img src="/assests/examples.png" alt="Examples"><span>Examples</span></button>
  <button id="helpBtn"><img src="/assests/help.png" alt="Help"><span>Help</span></button>
  <button id="aboutBtn"><img src="/assests/about.png" alt="About"><span>About</span></button>
  <button id="updatesBtn"><img src="/assests/updates.png" alt="Updates"><span>Updates</span></button>
</div>

<div id="editorDiv">
  <label id="editorToggle" class="toggle-open">Code Editor</label>
  <span>
    <input id="codeFileNameInput" type="text">
    <span id="codeHasChangedDisplay"></span>
  </span>
  <div id="editorPane" class="pane-open">
    <div id="editorWrapper">
      <div id="editorGutter"></div>
      <textarea id="editorCode" wrap="off" spellcheck="false"></textarea>
    </div>
  </div>
</div>

<div id="commandBar" class="bar">
  <button id="runBtn"><img src="/assests/run.png" alt="Run"><span>Run</span></button>
  <button id="stopBtn" disabled><img src="/assests/stop.png" alt="Stop"><span>Stop</span></button>
  <div class="bar-seperator"></div>
  <button id="debugToggleBtn"><img src="/assests/debug.png" alt="Debug"><span>Debug</span></button>
  <div class="bar-seperator"></div>
</div>

<dialog id="aboutDialog" class="buttonFace buttonFaceReleased">
  <form id="aboutForm" method="dialog">
    <div id="aboutContent">
      <h1>Welcome to Logan BASIC!</h1>
      <p>
        Logan BASIC is an online version of the <a href="https://en.wikipedia.org/wiki/BASIC" target="_blank">BASIC programming language</a>
        that creates both text-based and graphics-based programs that run directly in the web browser.
        <br><br>
        To get started, you can:
        <ul>
          <li>Check out the <a href="../examples/examples.html" target="_blank">example programs</a>.</li>
          <li>Browse the help <a href="../docs/help/help.html" target="_blank">files</a>.</li>
          <li>Write your code in the Code Editor, hit the Run button, and watch your program come to life!</li>
        </ul>
        Send any questions, comments, or bug reports to <a href="mailto:sinusoid314@gmail.com">sinusoid314@gmail.com</a>.
        <br>
        See more of my projects at <a href="https://sinusoft.com" target="_blank">sinusoft.com</a>
      </p>
    </div>
    <button id="aboutCloseBtn" type="submit">Close</button>
  </form>
</dialog>
`);


var newBtn = document.getElementById("newBtn");
var openFileBtn = document.getElementById("openFileBtn");
var openURLBtn = document.getElementById("openURLBtn");
var saveBtn = document.getElementById("saveBtn");
var examplesBtn = document.getElementById("examplesBtn");
var helpBtn = document.getElementById("helpBtn");
var aboutBtn = document.getElementById("aboutBtn");
var updatesBtn = document.getElementById("updatesBtn");
var codeFileNameInput = document.getElementById("codeFileNameInput");
var codeHasChangedDisplay = document.getElementById("codeHasChangedDisplay");
var editorCode = document.getElementById("editorCode");
var editorGutter = document.getElementById("editorGutter");
var runBtn = document.getElementById("runBtn");
var stopBtn = document.getElementById("stopBtn");
var debugToggleBtn = document.getElementById("debugToggleBtn");
var aboutDialog = document.getElementById("aboutDialog");
var prevLineCount = 1;
var codeHasChanged = false;
var codeFileName = "untitled.bas";

codeFileNameInput.value = codeFileName;

setEditorUIEvents();

addEditorGutterItem();


function setEditorUIEvents()
//
{
  newBtn.addEventListener("click", newBtn_onClick);
  openFileBtn.addEventListener("click", openFileBtn_onClick);
  openURLBtn.addEventListener("click", openURLBtn_onClick);
  saveBtn.addEventListener("click", saveBtn_onClick);
  examplesBtn.addEventListener("click", examplesBtn_onClick);
  helpBtn.addEventListener("click", helpBtn_onClick);
  aboutBtn.addEventListener("click", aboutBtn_onClick);
  updatesBtn.addEventListener("click", updatesBtn_onClick);
  codeFileNameInput.addEventListener("input", codeFileNameInput_onInput);
  editorCode.addEventListener("input", editor_onInput);
  editorCode.addEventListener("scroll", editor_onScroll);
  runBtn.addEventListener("click", runBtn_onClick);
  stopBtn.addEventListener("click", stopBtn_onClick);
  debugToggleBtn.addEventListener("click", debugToggleBtn_onClick);
  
  uiOnProgStartHandlers.push(editorUI_onProgStart);
  uiOnProgEndHandlers.push(editorUI_onProgEnd);
}

function switchEditorMode()
//Switch between run and edit modes
{
  runBtn.disabled = !runBtn.disabled;
  stopBtn.disabled = !stopBtn.disabled;
  editorCode.readOnly = !editorCode.readOnly;
}

function toggleUpdatesBtnHighlighted()
//
{
  if(updatesBtn.classList.toggle("buttonBlink"))
    updatesBtn.querySelector("span").textContent = "See what's new!";
  else
    updatesBtn.querySelector("span").textContent = "Updates";
}

function updateEditorGutter()
{
  var currLineCount = editorCode.value.split("\n").length;
  var lineCountDelta = currLineCount - prevLineCount;

  if(lineCountDelta == 0)
    return;
  else if(lineCountDelta > 0)
  {
    for(var n = 0; n < lineCountDelta; n++)
      addEditorGutterItem();
  }
  else if(lineCountDelta < 0)
  {
    for(var n = lineCountDelta; n < 0; n++)
      removeEditorGutterItem();
  }

  editorGutter.style.height = editorGutter.scrollHeight + "px";
  prevLineCount = currLineCount;
}

function addEditorGutterItem()
//
{
  var editorGutterItem;

  editorGutterItem = document.createElement("div");
  editorGutterItem.classList.add("editorGutterItem")
  editorGutterItem.addEventListener("click", editorGutterItem_onClick);
  editorGutter.appendChild(editorGutterItem);
}

function removeEditorGutterItem()
//
{
  var editorGutterItem = editorGutter.lastChild;
  var lineNum;

  if(editorGutterItem.classList.contains("editorBreakpoint"))
  {
    lineNum = Array.from(document.querySelectorAll(".editorGutterItem")).length;
    debugRemoveBreakpoint(lineNum, mainSourceName);
  }

  editorGutter.removeChild(editorGutterItem);
}

function selectEditorLine(selLine)
//Select the given editor line number
{
  var lines = editorCode.value.split("\n");
  var startPos = 0, endPos = 0;

  if((selLine < 1) || (selLine > lines.length))
  {
    editorCode.focus();
    editorCode.setSelectionRange(0, 0);
    return;
  }

  selLine--;

  for(var currLine = 0; currLine < selLine; currLine++)
    startPos += lines[currLine].length + 1;

  endPos = startPos + lines[selLine].length;

  editorCode.focus();
  editorCode.setSelectionRange(startPos, endPos);
  editorCode.scrollTop = ((editorCode.scrollHeight / lines.length) * selLine) - (editorCode.clientHeight / 2);
}

function loadSourceFile(fileURL)
//Load source file from local storage or a given URL
{
  statusBar.innerText = `Loading '${fileURL}'...`;

  return new Promise((resolve, reject) =>
  {
    var fileData;

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
      fetch(fileURL)
      .then((response) =>
      {
        if(!response.ok)
          return Promise.reject(response.statusText);

        return response.text();
      })
      .then(fileData => resolve(fileData))
      .catch(error => reject(`Failed to load '${fileURL}': ${error}`));
    }
  })
  .then((fileData) =>
  {
    editorCode.value = fileData;
    updateEditorGutter();
    statusBar.innerText = "Ready.";

    return fileData;
  })
  .catch((errorMessage) =>
  {
    statusBar.innerText = errorMessage;

    return Promise.reject(errorMessage);
  });
}

function newBtn_onClick(event)
//Open a blank editor in a new tab
{
  window.location.replace("index.html");
}

function openFileBtn_onClick(event)
//Open a source file from disk
{
    var fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.accept = "*.bas";

    fileInput.addEventListener("change", (event) =>
    {
      event.target.files[0].text().then((fileData) =>
      {
        window.localStorage.setItem("fileData", fileData);
      });
      
      window.location.replace("index.html?open=local");
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

function openURLBtn_onClick(event)
//Open a source file from a URL
{
  var fileURL = prompt("Enter file URL: ");

  if((fileURL == null) || (fileURL == ""))
    return;

  window.location.replace("index.html?open=" + fileURL);
}

function saveBtn_onClick(event)
//Save the current source code to disk
{
  var blob = new Blob([editorCode.value], {type: 'text/plain'});
  var url = URL.createObjectURL(blob);
  var fileLink = document.createElement("a");

  fileLink.href = url;
  fileLink.download = codeFileName;
  fileLink.style.display = "none";

  document.body.appendChild(fileLink);
  fileLink.click();
  document.body.removeChild(fileLink);

  setTimeout(() => URL.revokeObjectURL(url), 0);

  codeHasChanged = false;
  codeHasChangedDisplay.innerText = "";
}

function examplesBtn_onClick(event)
//Open the examples page
{
  window.open("../examples/examples.html", "_blank");
}

function helpBtn_onClick(event)
//Open the help files page
{
  window.open("../docs/help/help.html", "_blank");
}

function aboutBtn_onClick(event)
//Open the About dialog box
{
  aboutDialog.showModal();
}

function updatesBtn_onClick(event)
//Open the Updates page
{
  window.open("../updates.html", "_blank");
  toggleUpdatesBtnHighlighted();
}

function codeFileNameInput_onInput(event)
//
{
  codeFileName = event.target.value;
}

function editor_onInput(event)
{
  updateEditorGutter();
  codeHasChanged = true;
  codeHasChangedDisplay.innerText = "*";
}

function editor_onScroll(event)
{
  editorGutter.style.top = "-" + editorCode.scrollTop + "px";
}

function editorGutterItem_onClick(event)
{
  var lineNum = Array.from(document.querySelectorAll(".editorGutterItem")).indexOf(event.target) + 1;

  if(event.target.classList.contains("editorBreakpoint"))
    debugRemoveBreakpoint(lineNum, mainSourceName);
  else
    debugAddBreakpoint(lineNum, mainSourceName);

  event.target.classList.toggle("editorBreakpoint");
}

function runBtn_onClick(event)
//
{ 
  startProg(editorCode.value);
}

function stopBtn_onClick(event)
//
{
  mainUI_onProgEnd("Program stopped.", PROG_EXIT_STATUS_TERMINATED, null);
}

function debugToggleBtn_onClick(event)
//
{
  debugToggleDiv();
}

function editorUI_onProgStart()
//
{
  switchEditorMode();
}

function editorUI_onProgEnd(exitStatus, error)
//
{
  switchEditorMode();

  if(exitStatus == PROG_EXIT_STATUS_ERROR)
  {
    if(error.sourceName == mainSourceName)
      selectEditorLine(error.sourceLineNum);
  }
}

function onMsgShowEditor(msgData)
//Show the program editor pane
{
  var toggle = document.getElementById("editorToggle");
  var pane = document.getElementById("editorPane");

  if(toggle.classList.contains("toggle-closed"))
  {
    toggle.classList.toggle("toggle-closed");
    pane.classList.toggle("pane-closed");
  }
}

function onMsgHideEditor(msgData)
//Hide the program editor pane
{
  var toggle = document.getElementById("editorToggle");
  var pane = document.getElementById("editorPane");

  if(!(toggle.classList.contains("toggle-closed")))
  {
    toggle.classList.toggle("toggle-closed");
    pane.classList.toggle("pane-closed");
  }
}