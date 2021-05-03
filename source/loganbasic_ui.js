var isRunning = false;
var progWorker = null;
var progEditor = document.getElementById("progEditor");
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
//
{
  runBtn.disabled = !runBtn.disabled;
  stopBtn.disabled = !stopBtn.disabled;
  isRunning = !isRunning;
}

function stopProg(exitStatusStr)
//
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
//
{
  var editorStr;

  if(isRunning)
    return;

  editorStr = progEditor.value;
  progWorker = new Worker('loganbasic_main.js');
  progWorker.onmessage = progWorker_onMessage;
  progConsole.value = "";
  progWorker.postMessage({msgId: MSGID_START, msgData: editorStr});

  switchMode();
}

function stopBtn_onClick(event)
//
{
  stopProg("Program stopped.");
}

function progConsole_onKeydown(event)
//
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
      break;

    case 13:
      progConsole.value += '\n';
      progWorker.postMessage({msgId: MSGID_INPUT_RESULT, msgData: progConsole.inputStr});
      progConsole.inputting = false;
      progConsole.inputStr = "";
      break;
  }
}

function progConsole_onKeypress(event)
//
{
  if(!progConsole.inputting) return;

  progConsole.value += event.key;
  progConsole.inputStr += event.key;
}

function progWorker_onMessage(message)
//
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
  }
}

function progWorker_onDone(exitStatusStr)
//
{
  stopProg(exitStatusStr);
}

function progWorker_onStatus(statusStr)
//
{
  statusBar.innerHTML = statusStr;
}

function progWorker_onPrint(val)
//
{
  progConsole.value += val;
  progConsole.scrollTop = progConsole.scrollHeight;
}

function progWorker_onInputRequest()
//
{
  progConsole.inputting = true;
  progConsole.focus();
}

