var progConsole = document.getElementById("progConsole");

progConsole.inputting = false;
progConsole.inputStr = "";

progConsole.addEventListener("keydown", progConsole_onKeydown);
progConsole.addEventListener("keypress", progConsole_onKeypress);

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
