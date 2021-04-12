const STATUS_EDITING = 1;
const STATUS_SCANNING = 2;
const STATUS_RUNNING = 3;

var status = STATUS_EDITING;
var editor = document.getElementById("editor");
var runBtn = document.getElementById("runBtn");
var stopBtn = document.getElementById("stopBtn");
var statusBar = document.getElementById("statusBar");
var progConsole = document.getElementById("progConsole");

runBtn.addEventListener("click", runBtn_OnClick);
stopBtn.addEventListener("click", stopBtn_OnClick);

editor.value = "print 2 + 2";

function runBtn_OnClick(eventObj)
{
  var lexer;
  var interpreter;
  var editorStr;
  var tokenList;

  if(status != STATUS_EDITING)
  {
    return;
  }

  runBtn.disabled = true;

  statusBar.innerHTML = "Scanning...";
  status = STATUS_SCANNING;
  editorStr = editor.value;
  lexer = new Lexer(editorStr);
  tokenList = lexer.scan();

  if(lexer.errorMsg == "")
  {
    statusBar.innerHTML = "Running...";
    status = STATUS_RUNNING;
    interpreter = new Interpreter(tokenList, progConsole);
    progConsole.value = "";
    interpreter.run();

    if(interpreter.errorMsg == "")
    {
      statusBar.innerHTML = "Program run successfully.";
    }
    else
    {
      statusBar.innerHTML = interpreter.errorMsg;
    }
  }
  else
  {
    statusBar.innerHTML = lexer.errorMsg;
  }

  status = STATUS_EDITING;
  runBtn.disabled = false;
}

function stopBtn_OnClick(eventObj)
{
}
