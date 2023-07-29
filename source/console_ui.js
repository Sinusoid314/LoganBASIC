loadCSS("console.css");
loadHTML("console.html", "beforeend");
loadScript("console_common.js");

var consoleOutput = document.getElementById("consoleOutput");
var consoleInput = document.getElementById("consoleInput");
var consoleInputBtn = document.getElementById("consoleInputBtn");
var consoleInputDiv = document.getElementById("consoleInputDiv");

consoleInput.addEventListener("keydown", consoleInput_onKeydown);
consoleInputBtn.addEventListener("click", consoleInputBtn_onClick);

uiMessageMap.set(MSGID_SHOW_CONSOLE, onMsgShowConsole);
uiMessageMap.set(MSGID_HIDE_CONSOLE, onMsgHideConsole);
uiMessageMap.set(MSGID_PRINT, onMsgPrint);
uiMessageMap.set(MSGID_INPUT_REQUEST, onMsgInputRequest);
uiMessageMap.set(MSGID_CLEAR_CONSOLE, onMsgClearConsole);


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
  progWorker.postMessage({msgId: MSGID_INPUT_RESULT, msgData: {inputVal: consoleInput.value}});
  closeConsoleInput();
}

function consoleInput_onKeydown(event)
//Process enter key for the console input
{
  if(!isRunning)
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
  if(!isRunning)
    return;

  enterConsoleInput();
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
