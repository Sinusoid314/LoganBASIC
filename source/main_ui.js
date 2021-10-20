var isRunning = false;
var progWorker = null;
var runBtn = document.getElementById("runBtn");
var stopBtn = document.getElementById("stopBtn");
var statusBar = document.getElementById("statusBar");
var toggles = document.getElementsByClassName("toggle-open");

runBtn.addEventListener("click", runBtn_onClick);
stopBtn.addEventListener("click", stopBtn_onClick);

for(var i = 0; i < toggles.length; i++)
  toggles[i].addEventListener("click", toggle_onClick);

function switchMode()
//Switch between run and edit modes
{
  runBtn.disabled = !runBtn.disabled;
  stopBtn.disabled = !stopBtn.disabled;
  isRunning = !isRunning;
}

function stopProg(exitStatusStr)
//Stop the running program
{
  if(!isRunning)
    return;

  progWorker.terminate();
  progWorker = null;

  closeConsoleInput();
  statusBar.innerHTML = exitStatusStr;

  switchMode();
}

function runBtn_onClick(event)
//Run the program
{
  var editorStr;

  if(isRunning)
    return;

  editorStr = progEditor.value;
  progWorker = new Worker('main.js');
  progWorker.onmessage = progUI_onMessage;
  clearConsoleOutput();
  cleanupCanvas();
  progWorker.postMessage({msgId: MSGID_START_PROG, msgData: editorStr});

  switchMode();
}

function toggle_onClick(event)
{
  this.parentElement.querySelector(".pane-open").classList.toggle("pane-closed");
  this.classList.toggle("toggle-closed");
}

function stopBtn_onClick(event)
//Stop the program (user-triggered)
{
  stopProg("Program stopped.");
}

function progUI_onMessage(message)
//Process messages sent from the worker thread
{
  switch(message.data.msgId)
  {
    case MSGID_PROG_DONE:
      onProgDone(message.data.msgData);
      break;

    case MSGID_STATUS_CHANGE:
      onStatusChange(message.data.msgData);
      break;

    case MSGID_PRINT:
      printToConsoleOutput(message.data.msgData);
      break;

    case MSGID_INPUT_REQUEST:
      openConsoleInput();
      break;

    case MSGID_CLEAR_CONSOLE:
      clearConsoleOutput();
      break;

    case MSGID_CANVAS_MSG:
      canvasUI_onMessage(message.data.msgData);
      break;
  }
}

function onProgDone(exitStatusStr)
//Stop the program (self-triggered)
{
  stopProg(exitStatusStr);
}

function onStatusChange(statusStr)
//Display a status change
{
  statusBar.innerHTML = statusStr;
}
