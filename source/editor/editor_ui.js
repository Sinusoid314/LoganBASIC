//Editor CSS
document.head.appendChild(document.createElement('style')).textContent =
`
#menuBar
{
  margin-bottom: 15px;
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
`;


//Editor HTML
mainDiv.insertAdjacentHTML("afterbegin",
`
<div id="menuBar" class="bar">
  <button id="newBtn">New</button>
  <button id="openFileBtn">Open File</button>
  <button id="openURLBtn">Open URL</button>
  <button id="saveBtn">Save</button>
  <div class="bar-seperator"></div>
  <button id="examplesBtn">Examples</button>
  <button id="helpBtn">Help</button>
  <button id="aboutBtn">About</button>
</div>

<div id="editorDiv">
  <label id="editorToggle" class="toggle-open">Code Editor</label>
  <div id="editorPane" class="pane-open">
    <div id="editorWrapper">
      <div id="editorGutter"></div>
      <textarea id="editorCode" wrap="off" spellcheck="false"></textarea>
    </div>
  </div>
</div>

<div id="commandBar" class="bar">
  <button id="runBtn">Run</button>
  <button id="stopBtn" disabled>Stop</button>
  <div class="bar-seperator"></div>
  <button id="debugToggleBtn">Debug</button>
  <div class="bar-seperator"></div>
</div>
`);


var newBtn = document.getElementById("newBtn");
var openFileBtn = document.getElementById("openFileBtn");
var openURLBtn = document.getElementById("openURLBtn");
var saveBtn = document.getElementById("saveBtn");
var examplesBtn = document.getElementById("examplesBtn");
var helpBtn = document.getElementById("helpBtn");
var aboutBtn = document.getElementById("aboutBtn");
var editorCode = document.getElementById("editorCode");
var editorGutter = document.getElementById("editorGutter");
var runBtn = document.getElementById("runBtn");
var stopBtn = document.getElementById("stopBtn");
var debugToggleBtn = document.getElementById("debugToggleBtn");

var prevLineCount = 1;

newBtn.addEventListener("click", newBtn_onClick);
openFileBtn.addEventListener("click", openFileBtn_onClick);
openURLBtn.addEventListener("click", openURLBtn_onClick);
saveBtn.addEventListener("click", saveBtn_onClick);
examplesBtn.addEventListener("click", examplesBtn_onClick);
helpBtn.addEventListener("click", helpBtn_onClick);
aboutBtn.addEventListener("click", aboutBtn_onClick);
editorCode.addEventListener("input", editor_onInput);
editorCode.addEventListener("scroll", editor_onScroll);
runBtn.addEventListener("click", runBtn_onClick);
stopBtn.addEventListener("click", stopBtn_onClick);
debugToggleBtn.addEventListener("click", debugToggleBtn_onClick);

onProgStartHandlers.push(editor_onProgStart);
onProgEndHandlers.push(editor_onProgEnd);

addEditorGutterItem();

if(paramFileURL != "")
  loadSourceFile(paramFileURL);


function switchEditorMode()
//Switch between run and edit modes
{
  runBtn.disabled = !runBtn.disabled;
  stopBtn.disabled = !stopBtn.disabled;
  editorCode.readOnly = !editorCode.readOnly;
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
//Load a slource file into the editor
{
  var httpReq, fileText;

  statusBar.innerHTML = "Loading file...";

  if(fileURL == "local")
  {
    fileText = window.localStorage.getItem("fileText");

    if(fileText != null)
    {
      editorCode.value = fileText;
      updateEditorGutter();
      statusBar.innerHTML = "Ready.";
    }
    else
    {
      statusBar.innerHTML = "Failed to open file.";
    }
  }
  else
  {
    httpReq = new XMLHttpRequest();

    httpReq.onload = function()
    {
      editorCode.value = this.responseText;
      updateEditorGutter();
      statusBar.innerHTML = "Ready.";
    };

    httpReq.open("GET", fileURL);
    httpReq.send();
  }
}

function newBtn_onClick(event)
//Open a blank editor in a new tab
{
  window.open("index.html", "_blank");
}

function openFileBtn_onClick(event)
//Open a source file from disk
{
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "*.bas";

    fileInput.onchange = function()
    {
      this.files[0].text().then(fileText => window.localStorage.setItem("fileText", fileText));
      window.open("index.html?open=local", "_blank");
    };

    fileInput.click();
}

function openURLBtn_onClick(event)
//Open a source file from a URL
{
  var fileURL = prompt("Enter file URL: ");

  if((fileURL == null) || (fileURL == ""))
    return;

  window.open("index.html?open=" + fileURL, "_blank");
}

function saveBtn_onClick(event)
//Save the current source code to disk
{
  var blob = new Blob([editorCode.value], {type: 'text/plain'});
  var url = URL.createObjectURL(blob);
  var fileLink = document.createElement("a");

  fileLink.href = url;
  fileLink.download = "untitled.bas";
  fileLink.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
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
//Open the About page
{
  window.open("../about.html", "_blank");
}

function editor_onInput(event)
{
  updateEditorGutter();
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
  onProgEnd("Program stopped.", PROG_EXIT_STATUS_TERMINATED, null);
}

function debugToggleBtn_onClick(event)
//
{
  debugToggleDiv();
}

function editor_onProgStart()
//
{
  switchEditorMode();
}

function editor_onProgEnd(exitStatus, error)
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