import * as ProgLoadUI from "../prog_load/prog_load_ui.js";
import * as DebugUI from "../debug/debug_ui.js";
import * as MainCommon from "../main_common.js";


export var codeFileNameDisplay;

export var codeFileName;
export var codeHasChanged = false;

export function mountDiv(targetElement, insertPosition = "beforeend")
//
{
  document.head.appendChild(editorDivStyle);
  targetElement.insertAdjacentElement(insertPosition, editorDiv);
  
}

export function resetEditor()
//
{
  codeHasChanged = false;
  codeFileName = DEFAULT_FILE_NAME;
  codeFileHandle = null;
  codeFileNameDisplay.innerText = codeFileName;
  editorCode.value = "";
  updateEditorGutter();
}

export function selectEditorLine(selLine)
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

export async function readCodeFileFromLocalStorage()
//
{
  const fileName = window.localStorage.getItem("fileName");
  const fileData = window.localStorage.getItem("fileData");

  if(fileData)
    return new CodeFile(fileName, fileData);
  else
    throw "Failed to read local storage data.";
}

export async function readCodeFileFromURL(fileURL)
//Read code file from local storage or a given URL
{
  try
  {
    const fetchResponse = await fetch(fileURL);

    if(!fetchResponse.ok)
      throw fetchResponse.statusText;

    const fileData = await fetchResponse.text();
    const fileName = fileURL.split('/').pop();

    return new CodeFile(fileName, fileData);
  }
  catch(error)
  {
    throw `Failed to load '${fileURL}': ${error}`;
  }
}

export async function readCodeFileFromInput()
//Read code file from an Input element
{
  return new Promise((resolve, reject) => 
  {
    const fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.accept = "*.bas";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", async (event) =>
    {
      const file = event.target.files[0];

      try
      {
        const fileData = await file.text();
        resolve(new CodeFile(file.name, fileData));
      }
      catch(error)
      {
        reject(`Failed to load '${file.name}': ${error}`);
      }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  });
}

export async function readCodeFileFromHandle()
//
{
  try
  {
    const [fileHandle] = await window.showOpenFilePicker(filePickerOptions);
    const file = await fileHandle.getFile();
    const fileData = await file.text();

    return new CodeFile(file.name, fileData, fileHandle);
  }
  catch(error)
  {
    if(error.name == "AbortError")
      throw "File open cancelled.";
    else
      throw `Failed to load file: ${error}`;
  }
}

export async function saveCodeFileFromAnchor()
//Save code file from an Anchor element
{
  const blob = new Blob([editorCode.value], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const fileLink = document.createElement("a");

  fileLink.href = url;
  fileLink.download = codeFileName;
  fileLink.style.display = "none";

  document.body.appendChild(fileLink);
  fileLink.click();
  document.body.removeChild(fileLink);
  URL.revokeObjectURL(url);
}

export async function saveCodeFileFromHandle()
//
{
  try
  {
    if(!codeFileHandle)
    {
      codeFileHandle = await window.showSaveFilePicker(filePickerOptions);
      codeFileName = codeFileHandle.name;
    }

    const stream = await codeFileHandle.createWritable();
    await stream.write(editorCode.value);
    await stream.close();
  }
  catch(error)
  {
    if(error.name == "AbortError")
      throw "File save cancelled.";
    else
      throw `Failed to save file: ${error}`;
  }
}

export function loadCodeFileIntoEditor(codeFile)
//Load the code file's name and contents into the editor
{
  if(codeFile.name != "") codeFileName = codeFile.name;
  codeFileHandle = codeFile.handle;
  editorCode.value = codeFile.data;

  updateEditorGutter();

  codeFileNameDisplay.innerText = codeFileName;
}


const templateCSS =
`
<style id="editorDivStyle">
  #codeFileNameDisplay
  {
    margin-left: 20px;
    padding: 4px;
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
</style>
`;


const templateHTML =
`
<div id="editorDiv">
  <label id="editorToggle" class="toggle-open">Code Editor</label>
  <span>
    <span id="codeFileNameDisplay" class="buttonFacePressed"></span>
  </span>
  <div id="editorPane" class="pane-open">
    <div id="editorWrapper">
      <div id="editorGutter"></div>
      <textarea id="editorCode" wrap="off" spellcheck="false"></textarea>
    </div>
  </div>
</div>
`;


class CodeFile
{
  constructor(name, data, handle)
  {
    this.handle = handle;
    this.name = name;
    this.data = data;
  }
}

const filePickerOptions =
{
  types:
  [{
    description: "BASIC Source File",
    accept: { "text/plain": [".bas"] }
  }],
  multiple: false
};

const DEFAULT_FILE_NAME = "untitled.bas";

var editorDivStyle;
var editorDiv;
var editorCode, editorGutter;

var prevLineCount = 1;
var codeFileHandle = null;


createStyles();
createElements();
setEvents();

addEditorGutterItem();

codeFileName = DEFAULT_FILE_NAME;
codeFileNameDisplay.innerText = DEFAULT_FILE_NAME;


function createStyles()
//
{
  const template = document.createElement("template");
  template.innerHTML = templateCSS;

  editorDivStyle = template.content.getElementById("editorDivStyle");
}

function createElements()
//
{
  const template = document.createElement("template");
  template.innerHTML = templateHTML;

  editorDiv = template.content.getElementById("editorDiv");
  codeFileNameDisplay = template.content.getElementById("codeFileNameDisplay");
  editorCode = template.content.getElementById("editorCode");
  editorGutter = template.content.getElementById("editorGutter");
}

function setEvents()
//
{
  editorCode.addEventListener("input", editor_onInput);
  editorCode.addEventListener("scroll", editor_onScroll);

  ProgLoadUI.uiOnProgStartHandlers.push(editorUI_onProgStart);
  ProgLoadUI.uiOnProgEndHandlers.push(editorUI_onProgEnd);
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
    DebugUI.debugRemoveBreakpoint(lineNum, MainCommon.mainSourceName);
  }

  editorGutter.removeChild(editorGutterItem);
}

function editor_onInput(event)
{
  updateEditorGutter();
  codeHasChanged = true;
  codeFileNameDisplay.innerText = codeFileName + "*";
}

function editor_onScroll(event)
{
  editorGutter.style.top = "-" + editorCode.scrollTop + "px";
}

function editorGutterItem_onClick(event)
{
  var lineNum = Array.from(document.querySelectorAll(".editorGutterItem")).indexOf(event.target) + 1;

  if(event.target.classList.contains("editorBreakpoint"))
    DebugUI.debugRemoveBreakpoint(lineNum, MainCommon.mainSourceName);
  else
    DebugUI.debugAddBreakpoint(lineNum, MainCommon.mainSourceName);

  event.target.classList.toggle("editorBreakpoint");
}

function editorUI_onProgStart()
//
{
  editorCode.readOnly = true;
}

function editorUI_onProgEnd(exitStatus, error)
//
{
  editorCode.readOnly = false;

  if(exitStatus == ProgLoadUI.PROG_EXIT_STATUS_ERROR)
  {
    if(error.sourceName == MainCommon.mainSourceName)
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