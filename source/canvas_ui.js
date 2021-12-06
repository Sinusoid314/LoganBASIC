var progCanvas = document.getElementById("progCanvas");
var progCanvasContext = progCanvas.getContext("2d");
var bufferCanvas = document.createElement("canvas");
var bufferCanvasContext = bufferCanvas.getContext("2d");
var activeContext = progCanvasContext;
var canvasImages = [];

bufferCanvas.width = progCanvas.width;
bufferCanvas.width = progCanvas.height;

function resetCanvas()
//Set the canvas back to its initial state
{
  activeContext = bufferCanvasContext;
  clearCanvas();
  activeContext = progCanvasContext;
  clearCanvas();

  setCanvasWidth(500);
  setCanvasHeight(300);
}

function cleanupImages()
//Unload all images
{
  if(canvasImages.length > 0)
    canvasImages.splice(0);
}

function image_onLoad(event)
//
{
  this.removeEventListener("load", image_onLoad);
  this.removeEventListener("error", image_onError);

  canvasImages.push(this);

  progWorker.postMessage({msgId: MSGID_LOAD_IMAGE_RESULT, msgData: [true, this.width, this.height]});
}

function image_onError(event)
//
{
  this.removeEventListener("load", image_onLoad);
  this.removeEventListener("error", image_onError);

  progWorker.postMessage({msgId: MSGID_LOAD_IMAGE_RESULT, msgData: [false]});
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

function showCanvas()
//Show the canvas pane
{
  var toggle = document.getElementById("canvasToggle");
  var pane = document.getElementById("canvasPane");

  if(toggle.classList.contains("toggle-closed"))
  {
    toggle.classList.toggle("toggle-closed");
    pane.classList.toggle("pane-closed");
    progCanvas.focus()
  }
}

function hideCanvas()
//Hide the canvas pane
{
  var toggle = document.getElementById("canvasToggle");
  var pane = document.getElementById("canvasPane");

  if(!(toggle.classList.contains("toggle-closed")))
  {
    toggle.classList.toggle("toggle-closed");
    pane.classList.toggle("pane-closed");
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

function loadImage(imageSource)
//Load an image for drawing on the canvas
{
  var newImage = new Image();

  newImage.addEventListener("load", image_onLoad);
  newImage.addEventListener("error", image_onError);

  newImage.src = imageSource;
}

function unloadImage(imageIndex)
//Unload a canvas image
{
  canvasImages.splice(imageIndex, 1);
}

function drawImage(imageIndex, drawX, drawY, drawWidth, drawHeight)
//Draw the given image to the active canvas
{
  if(drawWidth == null)
    drawWidth = canvasImages[imageIndex].width;

  if(drawHeight == null)
    drawHeight = canvasImages[imageIndex].height;

  activeContext.drawImage(canvasImages[imageIndex], drawX, drawY, drawWidth, drawHeight);
}

function drawImageClip(imageIndex, clipX, clipY, clipWidth, clipHeight, drawX, drawY, drawWidth, drawHeight)
//Draw the given image to the active canvas
{
  if(drawWidth == null)
    drawWidth = canvasImages[imageIndex].width;

  if(drawHeight == null)
    drawHeight = canvasImages[imageIndex].height;

  activeContext.drawImage(canvasImages[imageIndex], clipX, clipY, clipWidth, clipHeight, drawX, drawY, drawWidth, drawHeight);
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

function drawText(text, drawX, drawY, isFilled)
//
{
  if(isFilled)
    activeContext.fillText(text, drawX, drawY);
  else
    activeContext.strokeText(text, drawX, drawY);
}

function drawRect(drawX, drawY, drawWidth, drawHeight, isFilled)
//
{
  if(isFilled)
    activeContext.fillRect(drawX, drawY, drawWidth, drawHeight);
  else
    activeContext.strokeRect(drawX, drawY, drawWidth, drawHeight);
}

function drawCircle(centerX, centerY, radius, isFilled)
//
{
  activeContext.beginPath();
  activeContext.arc(centerX, centerY, radius, 0, 2 * Math.PI);

  if(isFilled)
    activeContext.fill();
  else
    activeContext.stroke();
}

function drawLine(startX, startY, endX, endY)
//
{
  activeContext.beginPath();
  activeContext.moveTo(startX, startY);
  activeContext.lineTo(endX, endY);
  activeContext.stroke();
}

function setTextFont(font)
//
{
  activeContext.font = font;
}

function setFillColor(color)
//
{
  activeContext.fillStyle = color;
}

function setLineColor(color)
//
{
  activeContext.strokeStyle = color;
}

function setLineSize(size)
//
{
  activeContext.lineWidth = size;
}

