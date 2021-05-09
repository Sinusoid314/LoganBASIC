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

  if(!urlParams.has("open"))
    return;

  fileURL = urlParams.get("open");

  if(fileURL == "local")
  {
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
    statusBar.innerHTML = "Loading file...";
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
  window.open("loganbasic.html?open=local", "_blank");
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
}

function examplesBtn_onClick(event)
//
{
}

function helpBtn_onClick(event)
//
{
}