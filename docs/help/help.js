var titles = document.getElementsByClassName("title-closed");

for (var i = 0; i < titles.length; i++)
{
  titles[i].addEventListener("click", title_onClick);
}

function title_onClick(event)
{
  this.parentElement.querySelector(".submenu-closed").classList.toggle("submenu-open");
  this.classList.toggle("title-open");
}