var progCanvas = document.getElementById("progCanvas");
var progCanvasContext = progCanvas.getContext("2d");
var bufferCanvas = document.createElement("canvas");
var bufferCanvasContext = bufferCanvas.getContext("2d");
var activeContext = progCanvasContext;
var canvasImages = [];

bufferCanvas.width = progCanvas.width;
bufferCanvas.width = progCanvas.height;

function cleanupCanvas()
//Unload all the canvas resources
{
  if(canvasImages.length > 0)
    canvasImages.splice(0);

  activeContext = bufferCanvasContext;
  clearCanvas();
  activeContext = progCanvasContext;
  clearCanvas();

  setCanvasWidth(500);
  setCanvasHeight(300);
}

function canvas_onAnimationFrame()
//
{
  var imageData = bufferCanvasContext.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
  progCanvasContext.putImageData(imageData, 0, 0);

  progWorker.postMessage({msgId: MSGID_DRAW_CANVAS_BUFFER_DONE});
}

function canvas_onEvent(event)
//
{
  var canvasRect;
  var pointerX, pointerY;

  if(event instanceof PointerEvent)
  {
    canvasRect = progCanvas.getBoundingClientRect();
    pointerX = event.clientX - canvasRect.left;
    pointerY = event.clientY - canvasRect.top;
    progWorker.postMessage({msgId: MSGID_CANVAS_EVENT, msgData: [event.type, pointerX, pointerY]});
  }
  else if(event instanceof KeyboardEvent)
  {
    progWorker.postMessage({msgId: MSGID_CANVAS_EVENT, msgData: [event.type, event.key]});
  }
}

function canvasUI_onMessage(msgData)
//Process canvas messages sent from the worker thread
{
  switch(msgData[0])
  {
    case CANVAS_MSG_SET_CANVAS_WIDTH:
      setCanvasWidth(msgData[1]);
      break;

    case CANVAS_MSG_SET_CANVAS_HEIGHT:
      setCanvasHeight(msgData[1]);
      break;

    case CANVAS_MSG_CLEAR_CANVAS:
      clearCanvas();
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

    case CANVAS_MSG_ENABLE_CANVAS_BUFFER:
      enableCanvasBuffer();
      break;

    case CANVAS_MSG_DISABLE_CANVAS_BUFFER:
      disableCanvasBuffer();
      break;

    case CANVAS_MSG_DRAW_CANVAS_BUFFER:
      drawCanvasBuffer();
      break;

    case CANVAS_MSG_ADD_CANVAS_EVENT:
      addCanvasEvent(msgData[1]);
      break;

    case CANVAS_MSG_REMOVE_CANVAS_EVENT:
      removeCanvasEvent(msgData[1]);
      break;
  }
}

function setCanvasWidth(newWidth)
//
{
  var imageData;

  imageData = progCanvasContext.getImageData(0, 0, progCanvas.width, progCanvas.height);
  progCanvas.width = newWidth;
  progCanvasContext.putImageData(imageData, 0, 0);

  imageData = bufferCanvasContext.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
  bufferCanvas.width = newWidth;
  bufferCanvasContext.putImageData(imageData, 0, 0);
}

function setCanvasHeight(newHeight)
//
{
  var imageData;

  imageData = progCanvasContext.getImageData(0, 0, progCanvas.width, progCanvas.height);
  progCanvas.height = newHeight;
  progCanvasContext.putImageData(imageData, 0, 0);

  imageData = bufferCanvasContext.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
  bufferCanvas.height = newHeight;
  bufferCanvasContext.putImageData(imageData, 0, 0);
}

function clearCanvas()
//Clear all graphics from the active canvas
{
  activeContext.clearRect(0, 0, activeContext.canvas.width, activeContext.canvas.height);
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
//Draw the given image to the active canvas
{
  activeContext.drawImage(canvasImages[imageIndex], drawLeft, drawTop);
}

function enableCanvasBuffer()
//
{
  activeContext = bufferCanvasContext;
}

function disableCanvasBuffer()
//
{
  activeContext = progCanvasContext;
}

function drawCanvasBuffer()
//
{
  window.requestAnimationFrame(canvas_onAnimationFrame);
}

function addCanvasEvent(eventName)
//
{
  progCanvas.addEventListener(eventName, canvas_onEvent);
}

function removeCanvasEvent(eventName)
//
{
  progCanvas.removeEventListener(eventName, canvas_onEvent);
}