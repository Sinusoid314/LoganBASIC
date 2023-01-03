var usageOpen = document.getElementById("usageOpen");
var usageCode = document.getElementById("usageCode");

usageOpen.addEventListener("click", usageOpen_onClick);

function usageOpen_onClick(event)
//
{
  var fileText = usageCode.innerText;

  window.localStorage.setItem("fileText", fileText);
  window.open(event.target.href + "source/loganbasic.html?open=local", "_blank");

  event.preventDefault();
}
