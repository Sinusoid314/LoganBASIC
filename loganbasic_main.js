const STATUS_EDITING = 1;
const STATUS_SCANNING = 2;
const STATUS_RUNNING = 3;

var status = STATUS_EDITING;
var editor = document.getElementById("editor");
var runBtn = document.getElementById("runBtn");
var stopBtn = document.getElementById("stopBtn");
var statusBar = document.getElementById("statusBar");
var consol = document.getElementById("consol");

runBtn.addEventListener("click", runBtn_OnClick);
stopBtn.addEventListener("click", stopBtn_OnClick);

function runBtn_OnClick(eventObj)
{
  var editorStr;
  var lexer;
  var tokenList;

  if(status != STATUS_EDITING)
    return;

  runBtn.disabled = true;
  status = STATUS_SCANNING;
  statusBar.innerHTML = "Scanning...";

  editorStr = editor.value;
  lexer = new Lexer(editorStr);
  tokenList = lexer.scan();

  if(lexer.errorMsg != "")
  {
    statusBar.innerHTML = "Scan error: " + lexer.errorMsg;
  }
  else
  {
    statusBar.innerHTML = "Scan successful.";
    tokenList.forEach(token => consol.value += token.toString() + "\n");
  }

  status = STATUS_EDITING;
  runBtn.disabled = false;
}

function stopBtn_OnClick(eventObj)
{
}
