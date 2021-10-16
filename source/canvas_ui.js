var progCanvas = document.getElementById("progCanvas");
var canvasContext = progCanvas.getContext("2d");
var canvasImages = [];

function cleanupCanvas()
//Unload all the canvas resources
{
  canvasImages.splice(0);
}

function clearCanvas()
//Clear all graphics from the canvas
{
  canvasContext.clearRect(0, 0, progCanvas.width, progCanvas.height);
}

function loadCanvasImage(imageSource)
//Load an image for drawing on the canvas
{
  var newImage = new Image();
  newImage.src = imageSource;
  canvasImages.push(newImage);
}

function unloadCanvasImage(imageIndex)
//Unload a canvas image
{
  canvasImages.splice(imageIndex, 1);
}

function drawCanvasImage(imageIndex, drawLeft, drawTop)
//Draw the given image to the canvas
{
  canvasContext.drawImage(canvasImages[imageIndex], drawLeft, drawTop);
}

