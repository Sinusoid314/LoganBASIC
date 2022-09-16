var consoleOutput = document.getElementById("consoleOutput");
var consoleInput = document.getElementById("consoleInput");
var consoleInputBtn = document.getElementById("consoleInputBtn");
var consoleInputDiv = document.getElementById("consoleInputDiv");

consoleInput.addEventListener("keydown", consoleInput_onKeydown);
consoleInputBtn.addEventListener("click", consoleInputBtn_onClick);

function onMsgShowConsole()
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

function onMsgHideConsole()
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

function onMsgPrint(val)
//Print to the console output
{
  consoleOutput.value += val;
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsoleOutput()
//Clear the console
{
  consoleOutput.value = "";
}

function onMsgInputRequest()
//
{
  consoleInputDiv.style.display = "block";
  consoleInput.focus();
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
  progWorker.postMessage({msgId: MSGID_INPUT_RESULT, msgData: consoleInput.value});
  closeConsoleInput();
}

function consoleInput_onKeydown(event)
//Process enter key for the console input
{
  if(event.key === "Enter")
  {
    enterConsoleInput();
    event.preventDefault();
  }
}

function consoleInputBtn_onClick(event)
//Process the console input button click
{
  enterConsoleInput();
}

