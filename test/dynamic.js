sleep(2000);
console.log("Dynamic script run.");


function sleep(milliseconds)
{
  const date = Date.now();
  let currentDate = null;

  do
  {
    currentDate = Date.now();
  }
  while (currentDate - date < milliseconds);
}

function loadSourceFile(fileURL)
{
  console.log(`Loading '${fileURL}'...`);

  return new Promise((resolve, reject) => 
  {
    if(fileURL == "local")
    {
      fileData = window.localStorage.getItem("fileData");
      if(fileData)
        resolve(fileData);
      else
        reject("Failed to read local storage data.");
    }
    else
    {
      fetch(fileURL).then((response) => 
      {
        if(!response.ok) return Promise.reject(response.statusText);
        return response.text();
      })
      .then((fileData) => {resolve(fileData)})
      .catch((error) => {reject(error)});
    }
  })
  .then((fileData) => 
  {
    console.log(`File loaded successfully: \n${fileData}`);
    return fileData;
  })
  .catch((error) => 
  {
    console.log(`(loadSourceFile) Error loading file: ${error}`);
    return Promise.reject(error);
  });
}