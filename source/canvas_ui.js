var progCanvas = document.getElementById("progCanvas");
var canvasContext = progCanvas.getContext("2d");
var canvasImages = [];

function cleanupCanvas()
//Unload all the canvas resources
{
  if(canvasImages.length > 0)
    canvasImages.splice(0);

  clearCanvas();

  setCanvasWidth(500);
  setCanvasHeight(300);
}

function canvasWorker_onMessage(msgData)
//Process canvas messages sent from the program thread
{
  switch(msgData[0])
  {
    case CANVAS_MSG_CLEAR_CANVAS:
      clearCanvas();
      break;

    case CANVAS_MSG_SET_CANVAS_WIDTH:
      setCanvasWidth(msgData[1]);
      break;

    case CANVAS_MSG_SET_CANVAS_HEIGHT:
      setCanvasHeight(msgData[1]);
      break;

    case CANVAS_MSG_LOAD_IMAGE:
      loadCanvasImage(msgData[1]);
      break;

    case CANVAS_MSG_UNLOAD_IMAGE:
      unloadCanvasImage(msgData[1]);
      break;

    case CANVAS_MSG_DRAW_IMAGE:
      drawCanvasImage(msgData[1], msgData[2], msgData[3]);
      break;
  }
}

function clearCanvas()
//Clear all graphics from the canvas
{
  canvasContext.clearRect(0, 0, progCanvas.width, progCanvas.height);
}

function setCanvasWidth(newWidth)
//
{
  progCanvas.width = newWidth;
}

function setCanvasHeight(newHeight)
//
{
  progCanvas.height = newHeight;
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

