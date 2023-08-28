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
mainDiv.insertAdjacentHTML("beforeend",
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

consoleInput.addEventListener("keydown", consoleInput_onKeydown);
consoleInputBtn.addEventListener("click", consoleInputBtn_onClick);

onProgStartHandlers.push(console_onProgStart);
onProgEndHandlers.push(console_onProgEnd);

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

function console_onProgStart()
//
{
  clearConsoleOutput();
}

function console_onProgEnd(exitStatus, error)
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
