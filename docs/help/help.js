var titles = document.getElementsByClassName("title-closed");
var testToggle = document.getElementById("testToggle");
var testMode = false;


for (var i = 0; i < titles.length; i++)
{
  titles[i].addEventListener("click", title_onClick);
}

testToggle.addEventListener("click", testToggle_onClick);


function title_onClick(event)
{
  this.parentElement.querySelector(".submenu-closed").classList.toggle("submenu-open");
  this.classList.toggle("title-open");
}

function testToggle_onClick(event)
{
  testMode = !testMode;

  if(testMode)
  {
    testToggle.style.color = "green";
    document.querySelectorAll("a").forEach(link => link.addEventListener("click", link_onClick));
  }
  else
  {
    testToggle.style.color = "black";
    document.querySelectorAll("a").forEach(link => link.removeEventListener("click", link_onClick));
  }
}

function link_onClick(event)
{
  if(!testMode) return;

  fetch(event.target.href)
    .then(response => response.text())
    .then(text => {
      let fileData = (new DOMParser()).parseFromString(text, 'text/html').querySelector('#usageCode').innerText;
    
      window.localStorage.setItem("fileData", fileData);
      window.open("../../../index.html?open=local&autoRun=true", "docview");
    });

  event.preventDefault();
}
