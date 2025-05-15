var usageRun = document.getElementById("usageRun");
var usageOpen = document.getElementById("usageOpen");
var usageCode = document.getElementById("usageCode");
var fileData = usageCode.innerText;

usageRun.addEventListener("click", usage_onClick);
usageOpen.addEventListener("click", usage_onClick);

function usage_onClick(event)
//
{
  var autoRun = event.target == usageRun;
  
  window.localStorage.setItem("fileData", fileData);
  window.open(event.target.href + "index.html?open=local&autoRun=" + autoRun, "_blank");

  event.preventDefault();
}
