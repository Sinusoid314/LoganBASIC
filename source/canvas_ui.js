var progCanvas = document.getElementById("progCanvas");
var progCanvasContext = progCanvas.getContext("2d");
var bufferCanvas = document.createElement("canvas");
var bufferCanvasContext = bufferCanvas.getContext("2d");
var activeContext = progCanvasContext;
var images = new Map();

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

function cleanupCanvas()
//Unload all images and clear event listeners
{
  images.clear();

  progCanvas.removeEventListener("pointerdown", canvas_onEvent);
  progCanvas.removeEventListener("pointerup", canvas_onEvent);
  progCanvas.removeEventListener("pointermove", canvas_onEvent);
  progCanvas.removeEventListener("keydown", canvas_onEvent);
  progCanvas.removeEventListener("keyup", canvas_onEvent);
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

function image_onLoad(event)
//
{
  this.removeEventListener("load", image_onLoad);
  this.removeEventListener("error", image_onError);

  images.set(this.id, this);

  sendImageRequestResult(["", true])
}

function image_onError(event)
//
{
  this.removeEventListener("load", image_onLoad);
  this.removeEventListener("error", image_onError);

  sendImageRequestResult(["", false])
}

function sendImageRequestResult(msgData)
//
{
  progWorker.postMessage({msgId: MSGID_IMAGE_REQUEST_RESULT, msgData: msgData});
}


function canvas_onAnimationFrame()
//
{
  //var imageData = bufferCanvasContext.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
  //progCanvasContext.putImageData(imageData, 0, 0);

  progCanvasContext.clearRect(0, 0, progCanvas.width, progCanvas.height);
  progCanvasContext.drawImage(bufferCanvas, 0, 0);

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

  event.preventDefault();
}

function onMsgShowCanvas()
//Show the canvas pane
{
  var toggle = document.getElementById("canvasToggle");
  var pane = document.getElementById("canvasPane");

  progCanvas.focus()

  if(toggle.classList.contains("toggle-closed"))
  {
    toggle.classList.toggle("toggle-closed");
    pane.classList.toggle("pane-closed");
  }
}

function onMsgHideCanvas()
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

function onMsgSetCanvasWidth(newWidth)
//
{
  setCanvasWidth(newWidth);
}

function onMsgSetCanvasHeight(newHeight)
//
{
  setCanvasHeight(newHeight);
}

function onMsgClearCanvas()
//
{
  clearCanvas();
}

function onMsgLoadImageRequest(imageName, imageSource)
//Load an image for drawing on the canvas
{
  var newImage;

  if(!images.has(imageName))
  {
    newImage = new Image();

    newImage.addEventListener("load", image_onLoad);
    newImage.addEventListener("error", image_onError);

    newImage.id = imageName;
    newImage.src = imageSource;
  }
  else
    sendImageRequestResult(["Image '" + imageName + "' has already been loaded."]);
}

function onMsgUnloadImageRequest(imageName)
//Unload a canvas image
{
  if(images.has(imageName))
  {
    images.delete(imageName);
    sendImageRequestResult(["", 0]);
  }
  else
    sendImageRequestResult(["Image '" + imageName + "' has not been loaded."]);
}

function onMsgDrawImageRequest(imageName, drawX, drawY, drawWidth, drawHeight)
//Draw the given image to the active canvas
{
  var image;

  if(images.has(imageName))
  {
    image = images.get(imageName);

    if(drawWidth == null)
      drawWidth = image.width;

    if(drawHeight == null)
      drawHeight = image.height;

    activeContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    sendImageRequestResult(["", 0]);
  }
  else
    sendImageRequestResult(["Image '" + imageName + "' has not been loaded."]);
}

function onMsgDrawImageClipRequest(imageName, clipX, clipY, clipWidth, clipHeight, drawX, drawY, drawWidth, drawHeight)
//Draw the given image to the active canvas
{
  var image;

  if(images.has(imageName))
  {
    image = images.get(imageName);

    activeContext.drawImage(image, clipX, clipY, clipWidth, clipHeight, drawX, drawY, drawWidth, drawHeight);

    sendImageRequestResult(["", 0]);
  }
  else
    sendImageRequestResult(["Image '" + imageName + "' has not been loaded."]);
}

function onMsgDrawImageTiledRequest(imageName, drawX, drawY, drawWidth, drawHeight, offsetX, offsetY)
//
{
  var image;
  var initX, initY, destX, destY;

  if(!images.has(imageName))
  {
    sendImageRequestResult(["Image '" + imageName + "' has not been loaded."]);
    return;
  }

  image = images.get(imageName);

  offsetX = offsetX % image.width;
  offsetY = offsetY % image.height;

  initX = drawX + offsetX - (offsetX > 0 ? image.width : 0);
  initY = drawY + offsetY - (offsetY > 0 ? image.height : 0);

  activeContext.save();
  activeContext.beginPath();
  activeContext.rect(drawX, drawY, drawWidth, drawHeight);
  activeContext.clip();

  for(destY = initY; destY < (drawY + drawHeight); destY += image.height)
  {
    for(destX = initX; destX < (drawX + drawWidth); destX += image.width)
    {
      activeContext.drawImage(image, destX, destY);
    }
  }

  activeContext.beginPath();
  activeContext.restore();

  sendImageRequestResult(["", 0]);
}

function onMsgGetImageWidthRequest(imageName)
//
{
  if(images.has(imageName))
    sendImageRequestResult(["", images.get(imageName).width]);
  else
    sendImageRequestResult(["Image '" + imageName + "' has not been loaded."]);
}

function onMsgGetImageHeightRequest(imageName)
//
{
  if(images.has(imageName))
    sendImageRequestResult(["", images.get(imageName).height]);
  else
    sendImageRequestResult(["Image '" + imageName + "' has not been loaded."]);
}

function onMsgEnableCanvasBuffer()
//
{
  activeContext = bufferCanvasContext;
}

function onMsgDisableCanvasBuffer()
//
{
  activeContext = progCanvasContext;
}

function onMsgDrawCanvasBuffer()
//
{
  window.requestAnimationFrame(canvas_onAnimationFrame);
}

function onMsgAddCanvasEvent(eventName)
//
{
  progCanvas.addEventListener(eventName, canvas_onEvent);
}

function onMsgRemoveCanvasEvent(eventName)
//
{
  progCanvas.removeEventListener(eventName, canvas_onEvent);
}

function onMsgDrawText(text, drawX, drawY, isFilled)
//
{
  if(isFilled)
    activeContext.fillText(text, drawX, drawY);
  else
    activeContext.strokeText(text, drawX, drawY);
}

function onMsgDrawRect(drawX, drawY, drawWidth, drawHeight, isFilled)
//
{
  if(isFilled)
    activeContext.fillRect(drawX, drawY, drawWidth, drawHeight);
  else
    activeContext.strokeRect(drawX, drawY, drawWidth, drawHeight);
}

function onMsgDrawCircle(centerX, centerY, radius, isFilled)
//
{
  activeContext.beginPath();
  activeContext.arc(centerX, centerY, radius, 0, 2 * Math.PI);

  if(isFilled)
    activeContext.fill();
  else
    activeContext.stroke();
}

function onMsgDrawLine(startX, startY, endX, endY)
//
{
  activeContext.beginPath();
  activeContext.moveTo(startX, startY);
  activeContext.lineTo(endX, endY);
  activeContext.stroke();
}

function onMsgSetTextFont(font)
//
{
  activeContext.font = font;
}

function onMsgSetFillColor(color)
//
{
  activeContext.fillStyle = color;
}

function onMsgSetLineColor(color)
//
{
  activeContext.strokeStyle = color;
}

function onMsgSetLineSize(size)
//
{
  activeContext.lineWidth = size;
}

