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
  cleanupCanvas();
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
  progWorker.onmessage = progWorker_onMessage;
  clearConsoleOutput();
  clearCanvas();
  progWorker.postMessage({msgId: MSGID_START, msgData: editorStr});

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

function progWorker_onMessage(message)
//Process messages sent from the program thread
{
  switch(message.data.msgId)
  {
    case MSGID_DONE:
      progWorker_onDone(message.data.msgData);
      break;

    case MSGID_STATUS:
      progWorker_onStatus(message.data.msgData);
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

    case MSGID_CLEAR_CANVAS:
      clearCanvas();
      break;

    case MSGID_LOAD_CANVAS_IMAGE:
      loadCanvasImage(message.data.msgData);
      break;

    case MSGID_UNLOAD_CANVAS_IMAGE:
      unloadCanvasImage(message.data.msgData);
      break;

    case MSGID_DRAW_CANVAS_IMAGE:
      drawCanvasImage(message.data.msgData[0], message.data.msgData[1], message.data.msgData[2]);
      break;
  }
}

function progWorker_onDone(exitStatusStr)
//Stop the program (self-triggered)
{
  stopProg(exitStatusStr);
}

function progWorker_onStatus(statusStr)
//Display a status change
{
  statusBar.innerHTML = statusStr;
}
