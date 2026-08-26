import * as MainUI from "../main_ui.js";
import * as ConsoleCommon from "./console_common.js";


//Console CSS
document.head.appendChild(document.createElement('style')).textContent =
`
#consoleOutput
{
  display: block;
  margin-top: 5px;
  width: 100%;
}

#consoleInputDiv
{
  display: none;
  margin-top: 5px;
  width: 100%;
}

#consoleDiv
{
  margin-bottom: 20px;
}
`;


//Console HTML
MainUI.mainDiv.insertAdjacentHTML("beforeend",
`
<div id="consoleDiv">
  <label id="consoleToggle" class="toggle-open">Console</label>
  <div id="consolePane" class="pane-open">
    <textarea id="consoleOutput" cols="80" rows="15" wrap="off" spellcheck="false" readonly></textarea>
    <div id="consoleInputDiv">
      <input id="consoleInput" type="text">
      <button id="consoleInputBtn">Enter</button>
    </div>
  </div>
</div>
`);


var consoleOutput = document.getElementById("consoleOutput");
var consoleInput = document.getElementById("consoleInput");
var consoleInputBtn = document.getElementById("consoleInputBtn");
var consoleInputDiv = document.getElementById("consoleInputDiv");

setConsoleUIEvents();


function setConsoleUIEvents()
//
{
  consoleInput.addEventListener("keydown", consoleInput_onKeydown);
  consoleInputBtn.addEventListener("click", consoleInputBtn_onClick);
  
  MainUI.uiOnMainResetHandlers.push(consoleUI_onMainReset);
  MainUI.uiOnProgStartHandlers.push(consoleUI_onProgStart);
  MainUI.uiOnProgEndHandlers.push(consoleUI_onProgEnd);
  
  MainUI.uiMessageMap.set(ConsoleCommon.MSGID_SHOW_CONSOLE, onMsgShowConsole);
  MainUI.uiMessageMap.set(ConsoleCommon.MSGID_HIDE_CONSOLE, onMsgHideConsole);
  MainUI.uiMessageMap.set(ConsoleCommon.MSGID_PRINT, onMsgPrint);
  MainUI.uiMessageMap.set(ConsoleCommon.MSGID_INPUT_REQUEST, onMsgInputRequest);
  MainUI.uiMessageMap.set(ConsoleCommon.MSGID_CLEAR_CONSOLE, onMsgClearConsole);
}

function clearConsoleOutput()
//Clear the console
{
  consoleOutput.value = "";
}

function closeConsoleInput()
//
{
  consoleInputDiv.style.display = "none";
  consoleInput.value = "";
}

function enterConsoleInput()
//
{
  consoleOutput.value += consoleInput.value + '\n';
  MainUI.progWorker.postMessage({msgId: ConsoleCommon.MSGID_INPUT_RESULT, msgData: {inputVal: consoleInput.value}});
  closeConsoleInput();
}

function consoleInput_onKeydown(event)
//Process enter key for the console input
{
  if(!MainUI.isRunning)
    return;

  if(event.key === "Enter")
  {
    enterConsoleInput();
    event.preventDefault();
  }
}

function consoleInputBtn_onClick(event)
//Process the console input button click
{
  if(!MainUI.isRunning)
    return;

  enterConsoleInput();
}

function consoleUI_onMainReset()
//
{
  clearConsoleOutput();
}

function consoleUI_onProgStart()
//
{
  clearConsoleOutput();
}

function consoleUI_onProgEnd(exitStatus, error)
//
{
  closeConsoleInput();
}

function onMsgShowConsole(msgData)
//Show the console pane
{
  var toggle = document.getElementById("consoleToggle");
  var pane = document.getElementById("consolePane");

  if(toggle.classList.contains("toggle-closed"))
  {
    toggle.classList.toggle("toggle-closed");
    pane.classList.toggle("pane-closed");
  }
}

function onMsgHideConsole(msgData)
//Hide the console pane
{
  var toggle = document.getElementById("consoleToggle");
  var pane = document.getElementById("consolePane");

  if(!(toggle.classList.contains("toggle-closed")))
  {
    toggle.classList.toggle("toggle-closed");
    pane.classList.toggle("pane-closed");
  }
}

function onMsgPrint(msgData)
//Print to the console output
{
  consoleOutput.value += msgData.printVal;
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function onMsgClearConsole(msgData)
//
{
  clearConsoleOutput();
}

function onMsgInputRequest(msgData)
//
{
  consoleInputDiv.style.display = "block";
  consoleInput.focus();
}
