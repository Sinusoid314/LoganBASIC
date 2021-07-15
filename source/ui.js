var isRunning = false;
var progWorker = null;
var runBtn = document.getElementById("runBtn");
var stopBtn = document.getElementById("stopBtn");
var statusBar = document.getElementById("statusBar");
var progConsole = document.getElementById("progConsole");

runBtn.addEventListener("click", runBtn_onClick);
stopBtn.addEventListener("click", stopBtn_onClick);
progConsole.addEventListener("keydown", progConsole_onKeydown);
progConsole.addEventListener("keypress", progConsole_onKeypress);

progConsole.inputting = false;
progConsole.inputStr = "";

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

  if(progConsole.inputting)
  {
    progConsole.inputting = false;
    progConsole.inputStr = "";
  }

  progWorker.terminate();
  progWorker = null;
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
  progConsole.value = "";
  progWorker.postMessage({msgId: MSGID_START, msgData: editorStr});

  switchMode();
}

function stopBtn_onClick(event)
//Stop the program (user-triggered)
{
  stopProg("Program stopped.");
}

function progConsole_onKeydown(event)
//Process the backspace and enter key inputs to the console
{
  if(!progConsole.inputting) return;

  switch(event.keyCode)
  {
    case 8:
      if(progConsole.inputStr.length > 0)
      {
        progConsole.value = progConsole.value.slice(0, progConsole.value.length - 1);
        progConsole.inputStr = progConsole.inputStr.slice(0, progConsole.inputStr.length - 1);
      }
      event.preventDefault();
      break;

    case 13:
      progConsole.value += '\n';
      progWorker.postMessage({msgId: MSGID_INPUT_RESULT, msgData: progConsole.inputStr});
      progConsole.inputting = false;
      progConsole.inputStr = "";
      event.preventDefault();
      break;
  }
}

function progConsole_onKeypress(event)
//Add the input character to the console
{
  event.preventDefault();
  if(!progConsole.inputting) return;

  progConsole.value += event.key;
  progConsole.inputStr += event.key;
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
      progWorker_onPrint(message.data.msgData);
      break;

    case MSGID_INPUT_REQUEST:
      progWorker_onInputRequest();
      break;

    case MSGID_CLEAR_CONSOLE:
      progWorker_onClearConsole();
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

function progWorker_onPrint(val)
//Print to the console
{
  progConsole.value += val;
  progConsole.scrollTop = progConsole.scrollHeight;
}

function progWorker_onInputRequest()
//Allow user to enter input to the console
{
  progConsole.inputting = true;
  progConsole.focus();
}

function progWorker_onClearConsole()
//Clear the console
{
  progConsole.value = "";
}
