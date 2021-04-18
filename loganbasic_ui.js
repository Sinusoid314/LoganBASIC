var isRunning = false;
var progWorker = null;
var progEditor = document.getElementById("progEditor");
var runBtn = document.getElementById("runBtn");
var stopBtn = document.getElementById("stopBtn");
var statusBar = document.getElementById("statusBar");
var progConsole = document.getElementById("progConsole");

runBtn.addEventListener("click", runBtn_onClick);
stopBtn.addEventListener("click", stopBtn_onClick);

progEditor.value = "print 2 + 2";

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

  progWorker.terminate();
  progWorker = null;
  statusBar.innerHTML = exitStatusStr;

  switchMode();
}

function runBtn_onClick(eventObj)
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

function stopBtn_onClick(eventObj)
//
{
  stopProg("Program stopped.");
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
}
