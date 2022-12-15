var barOpen = false;
var barResizing = false;
var prevLineCount = 1;
var barToggle = document.getElementById("barToggle");
var barDiv = document.getElementById("barDiv");
var barResizer = document.getElementById("barResizer");
var mainDiv = document.getElementById("mainDiv");
var listBox = document.getElementById("listBox");
var editorCode = document.getElementById("editorCode");
var editorGutter = document.getElementById("editorGutter");
var other = document.getElementById("other");

barToggle.addEventListener("click", barToggle_onClick);
document.addEventListener("mousedown", document_onMouseDown);
document.addEventListener("mousemove", document_onMouseMove);
document.addEventListener("mouseup", document_onMouseUp);
listBox.addEventListener("click", listBox_onClick);
editorCode.addEventListener("input", editor_onInput);
editorCode.addEventListener("scroll", editor_onScroll);
other.addEventListener("click", other_onClick);

function updateEditorGutter()
{
  var currLineCount = editorCode.value.split("\n").length;
  var lineCountDelta = currLineCount - prevLineCount;
  var editorGutterItem, editorBreakpoint, editorLineNumber;

  if(lineCountDelta == 0)
    return;
  else if(lineCountDelta > 0)
  {
    for(var n = 0; n < lineCountDelta; n++)
    {
	/*
      editorGutterItem = document.createElement("div");
      editorBreakpoint = document.createElement("span");
      editorLineNumber = document.createElement("span");

      editorGutterItem.classList.toggle("editorGutterItem");
      editorBreakpoint.classList.toggle("editorBreakpoint");
      editorLineNumber.classList.toggle("editorLineNumber");

      editorGutter.append(editorGutterItem);
      editorGutterItem.append(editorBreakpoint);
      editorGutterItem.append(editorLineNumber);
    */

      editorGutter.innerHTML += `<div class="editorGutterItem">
      <span class="editorBreakpoint"></span>
      <span class="editorLineNumber"></span>
      </div>`;
    }
  }
  else if(lineCountDelta < 0)
  {
    for(var n = lineCountDelta; n < 0; n++)
      editorGutter.removeChild(editorGutter.lastChild);
  }

  editorGutter.style.height = editorGutter.scrollHeight + "px";
  prevLineCount = currLineCount;
}

function barToggle_onClick()
{
  if(barOpen)
  {
    barToggle.style.border = "";
	barDiv.style.display = "none";
    mainDiv.style.marginLeft = "0";
  }
  else
  {
    barToggle.style.border = "inset 2px";
	barDiv.style.display = "block";
    mainDiv.style.marginLeft = barDiv.clientWidth + "px";
  }

  barOpen = !barOpen;
}

function document_onMouseDown(event)
{
  if(event.target != barResizer)
    return false;

  barDiv.style.pointerEvents = "none";
  mainDiv.style.pointerEvents = "none";
  document.body.style.userSelect = "none";
  document.body.style.cursor = "ew-resize";
  barResizing = true;
}

function document_onMouseMove(event)
{
  if(!barResizing)
    return false;

  barDiv.style.width = event.clientX + "px";
  mainDiv.style.marginLeft = event.clientX + "px";
}

function document_onMouseUp(event)
{
  barDiv.style.pointerEvents = "";
  mainDiv.style.pointerEvents = "";
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
  barResizing = false;
}

function listBox_onClick(event)
{
  var items = listBox.getElementsByTagName("li");

  for(const item of items)
    item.style.backgroundColor = (item == event.target) ? "skyblue" : "white";
}

function editor_onInput(event)
{
  updateEditorGutter();
}

function editor_onScroll(event)
{
  editorGutter.style.top = "-" + editorCode.scrollTop + "px";
}

function other_onClick(event)
{
  for(var n = 0; n < 40; n++)
    editorCode.value += "llasdkfjndgjnasdl432890742374092374903242097gkndsklgnasldkg\n";

  updateEditorGutter();
}
