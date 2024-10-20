window.addEventListener("load", window_onLoad);
document.addEventListener("DOMContentLoaded", document_onDOMContentLoaded);

loadDynamicScript();

//window.localStorage.setItem("fileData", "Some local test data.");

console.log("Static script run.");


function window_onLoad(event)
{
  console.log("Load event.");

  loadSourceFile("./test.txt").then((result) =>
  {
    console.log(`Auto run: ${result}`);
  })
  .catch((error) => {console.log(`(window_onLoad) Error loading file: ${error}`);});
}

function document_onDOMContentLoaded(event)
{
  console.log("DOMContentLoaded event.");
}

function loadDynamicScript()
{
  var script = document.createElement('script');

  script.type = "text/javascript";
  script.async = false;
  script.src = "dynamic.js";
  document.head.appendChild(script);
}
