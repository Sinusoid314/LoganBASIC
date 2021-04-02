var sourceStr = "";
var tokenList = [];
var lexer = new Lexer();
var interpreter = new Interpreter();
var runBtn = document.getElementById("runBtn");
var stopBtn = document.getElementById("stopBtn");

runBtn.addEventListener("click", runBtn_OnClick);
stopBtn.addEventListener("click", stopBtn_OnClick);

function runBtn_OnClick(eventObj)
{
  runBtn.disabled = true;
  stopBtn.disabled = false;
}

function stopBtn_OnClick(eventObj)
{
  runBtn.disabled = false;
  stopBtn.disabled = true;
}
