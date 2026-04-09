var runOnOpenToggle = document.getElementById("runOnOpenToggle");
var runOnOpenKey = "runExampleOnOpen";
var runOnOpenValue = window.localStorage.getItem(runOnOpenKey);

runOnOpenToggle.addEventListener("change", runOnOpenToggle_onChange);
document.querySelectorAll("a").forEach(link => link.addEventListener("click", link_onClick));

if(runOnOpenValue == null)
{
  runOnOpenValue = String(true);
  window.localStorage.setItem(runOnOpenKey, runOnOpenValue);
}

runOnOpenToggle.checked = (runOnOpenValue == String(true));


function runOnOpenToggle_onChange(event)
{
  runOnOpenValue = String(runOnOpenToggle.checked);
  window.localStorage.setItem(runOnOpenKey, runOnOpenValue);
}

function link_onClick(event)
{
  window.open(event.target.href + "&autoRun=" + runOnOpenValue, "docview");
  event.preventDefault();
}