var usageOpen = document.getElementById("usageOpen");
var usageCode = document.getElementById("usageCode");

usageOpen.addEventListener("click", usageOpen_onClick);

function usageOpen_onClick(event)
//
{
  var fileData = usageCode.innerText;

  window.localStorage.setItem("fileData", fileData);
  window.open(event.target.href + "index.html?open=local", "_blank");

  event.preventDefault();
}
