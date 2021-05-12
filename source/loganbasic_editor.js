var newBtn = document.getElementById("newBtn");
var openFileBtn = document.getElementById("openFileBtn");
var openURLBtn = document.getElementById("openURLBtn");
var saveBtn = document.getElementById("saveBtn");
var examplesBtn = document.getElementById("examplesBtn");
var helpBtn = document.getElementById("helpBtn");
var progEditor = document.getElementById("progEditor");

window.addEventListener("load", window_onLoad);
newBtn.addEventListener("click", newBtn_onClick);
openFileBtn.addEventListener("click", openFileBtn_onClick);
openURLBtn.addEventListener("click", openURLBtn_onClick);
saveBtn.addEventListener("click", saveBtn_onClick);
examplesBtn.addEventListener("click", examplesBtn_onClick);
helpBtn.addEventListener("click", helpBtn_onClick);

function window_onLoad(event)
//
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
    progEditor.value = window.localStorage.getItem("fileText");

    if(fileText != null)
    {
      progEditor.value = fileText;
      statusBar.innerHTML = "Ready.";
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
//
{
  window.open("loganbasic.html", "_blank");
}

function openFileBtn_onClick(event)
//
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
//
{
  var fileURL = prompt("Enter file URL: ");

  if((fileURL == null) || (fileURL == ""))
    return;

  window.open("loganbasic.html?open=" + fileURL, "_blank");
}

function saveBtn_onClick(event)
//
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
//
{
}

function helpBtn_onClick(event)
//
{
}