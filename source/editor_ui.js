var newBtn = document.getElementById("newBtn");
var openFileBtn = document.getElementById("openFileBtn");
var openURLBtn = document.getElementById("openURLBtn");
var saveBtn = document.getElementById("saveBtn");
var examplesBtn = document.getElementById("examplesBtn");
var helpBtn = document.getElementById("helpBtn");
var aboutBtn = document.getElementById("aboutBtn");
var progEditor = document.getElementById("progEditor");

window.addEventListener("load", window_onLoad);
newBtn.addEventListener("click", newBtn_onClick);
openFileBtn.addEventListener("click", openFileBtn_onClick);
openURLBtn.addEventListener("click", openURLBtn_onClick);
saveBtn.addEventListener("click", saveBtn_onClick);
examplesBtn.addEventListener("click", examplesBtn_onClick);
helpBtn.addEventListener("click", helpBtn_onClick);
aboutBtn.addEventListener("click", aboutBtn_onClick);

function showEditor()
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

function hideEditor()
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

function selectEditorLine(selLine)
//Select the given editor line number
{
  var lines = progEditor.value.split("\n");
  var startPos = 0, endPos = 0;

  if((selLine < 1) || (selLine > lines.length))
    return;

  selLine--;

  for(var currLine = 0; currLine < selLine; currLine++)
    startPos += lines[currLine].length + 1;

  endPos = startPos + lines[selLine].length;

  progEditor.focus();
  progEditor.selectionStart = startPos;
  progEditor.selectionEnd = endPos;
  progEditor.scrollTop = (progEditor.clientHeight / progEditor.rows) * selLine;
}

function window_onLoad(event)
//Load a slource file into the editor if one if provided
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
      progEditor.value = fileText;
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
      progEditor.value = this.responseText;
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
  var blob = new Blob([progEditor.value], {type: 'text/plain'});
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
