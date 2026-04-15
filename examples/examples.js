var runOnOpenToggle = document.getElementById("runOnOpenToggle");
const RUN_ON_OPEN_KEY = "runExampleOnOpen";
var runOnOpen = window.localStorage.getItem(RUN_ON_OPEN_KEY);

runOnOpenToggle.addEventListener("change", runOnOpenToggle_onChange);
document.querySelectorAll("a").forEach(link => link.addEventListener("click", link_onClick));

if(runOnOpen == null)
{
  runOnOpen = String(true);
  window.localStorage.setItem(RUN_ON_OPEN_KEY, runOnOpen);
}

runOnOpenToggle.checked = (runOnOpen == String(true));


function runOnOpenToggle_onChange(event)
{
  runOnOpen = String(runOnOpenToggle.checked);
  window.localStorage.setItem(RUN_ON_OPEN_KEY, runOnOpen);
}

function link_onClick(event)
{
  window.open(event.target.href + "&autoRun=" + runOnOpen, "docview");
  event.preventDefault();
}