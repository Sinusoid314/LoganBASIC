var prevLineCount = 1;

var newBtn = document.getElementById("newBtn");
var openFileBtn = document.getElementById("openFileBtn");
var openURLBtn = document.getElementById("openURLBtn");
var saveBtn = document.getElementById("saveBtn");
var examplesBtn = document.getElementById("examplesBtn");
var helpBtn = document.getElementById("helpBtn");
var aboutBtn = document.getElementById("aboutBtn");
var editorCode = document.getElementById("editorCode");
var editorGutter = document.getElementById("editorGutter");

window.addEventListener("load", window_onLoad);
newBtn.addEventListener("click", newBtn_onClick);
openFileBtn.addEventListener("click", openFileBtn_onClick);
openURLBtn.addEventListener("click", openURLBtn_onClick);
saveBtn.addEventListener("click", saveBtn_onClick);
examplesBtn.addEventListener("click", examplesBtn_onClick);
helpBtn.addEventListener("click", helpBtn_onClick);
aboutBtn.addEventListener("click", aboutBtn_onClick);
editorCode.addEventListener("input", editor_onInput);
editorCode.addEventListener("scroll", editor_onScroll);

addEditorGutterItem();

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
      editorGutter.removeChild(editorGutter.lastChild);
  }

  editorGutter.style.height = editorGutter.scrollHeight + "px";
  prevLineCount = currLineCount;
}

function addEditorGutterItem()
{
  var editorGutterItem;

  editorGutterItem = document.createElement("div");
  editorGutterItem.classList.add("editorGutterItem")
  editorGutterItem.addEventListener("click", editorGutterItem_onClick);
  editorGutter.appendChild(editorGutterItem);
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

function window_onLoad(event)
//Load a slource file into the editor if one is provided
{
  var urlParams = new URLSearchParams(window.location.search);
  var fileURL;
  var httpReq;
  var fileText;

  if(!urlParams.has("open"))
    return;

  fileURL = urlParams.get("open");
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
  window.open("loganbasic.html", "_blank");
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
      window.open("loganbasic.html?open=local", "_blank");
    };

    fileInput.click();
}

function openURLBtn_onClick(event)
//Open a source file from a URL
{
  var fileURL = prompt("Enter file URL: ");

  if((fileURL == null) || (fileURL == ""))
    return;

  window.open("loganbasic.html?open=" + fileURL, "_blank");
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
  var breakpointIndex;

  if(event.target.classList.contains("editorBreakpoint"))
  {
    progWorker.postMessage({msgId: MSGID_DEBUG_REMOVE_BREAKPOINT, msgData: {sourceLineNum: lineNum, sourceName: mainSourceName}});
    breakpointIndex = debugBreakpointBackups.findIndex(breakpoint => breakpoint.matches(lineNum, mainSourceName));
    debugBreakpointBackups.splice(breakpointIndex, 1);
  }
  else
  {
    progWorker.postMessage({msgId: MSGID_DEBUG_ADD_BREAKPOINT, msgData: {sourceLineNum: lineNum, sourceName: mainSourceName}});
    debugBreakpointBackups.push(new DebugBreakpoint(lineNum, mainSourceName));
  }

  event.target.classList.toggle("editorBreakpoint");
}

function onMsgShowEditor()
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

function onMsgHideEditor()
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