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

  sendImageRequestResult(true)
}

function image_onError(event)
//
{
  this.removeEventListener("load", image_onLoad);
  this.removeEventListener("error", image_onError);

  sendImageRequestResult(false)
}

function sendImageRequestResult(resultVal, errorMsg = "")
//
{
  progWorker.postMessage({msgId: MSGID_IMAGE_REQUEST_RESULT, msgData: {resultVal: resultVal, errorMsg: errorMsg}});
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
    progWorker.postMessage({msgId: MSGID_CANVAS_EVENT, msgData: {eventName: event.type, eventArgs: [pointerX, pointerY]}});
  }
  else if(event instanceof KeyboardEvent)
  {
    progWorker.postMessage({msgId: MSGID_CANVAS_EVENT, msgData: {eventName: event.type, eventArgs: [event.key]}});
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

function onMsgSetCanvasWidth(msgData)
//
{
  setCanvasWidth(msgData.newWidth);
}

function onMsgSetCanvasHeight(msgData)
//
{
  setCanvasHeight(msgData.newHeight);
}

function onMsgClearCanvas()
//
{
  clearCanvas();
}

function onMsgLoadImageRequest(msgData)
//Load an image for drawing on the canvas
{
  var newImage;

  if(!images.has(msgData.imageName))
  {
    newImage = new Image();

    newImage.addEventListener("load", image_onLoad);
    newImage.addEventListener("error", image_onError);

    newImage.id = msgData.imageName;
    newImage.src = msgData.imageSource;
  }
  else
    sendImageRequestResult(null, "Image '" + msgData.imageName + "' has already been loaded.");
}

function onMsgUnloadImageRequest(msgData)
//Unload a canvas image
{
  if(images.has(msgData.imageName))
  {
    images.delete(msgData.imageName);
    sendImageRequestResult(0);
  }
  else
    sendImageRequestResult(null, "Image '" + msgData.imageName + "' has not been loaded.");
}

function onMsgDrawImageRequest(msgData)
//Draw the given image to the active canvas
{
  var image;

  if(images.has(msgData.imageName))
  {
    image = images.get(msgData.imageName);

    if(msgData.drawWidth == null)
      msgData.drawWidth = image.width;

    if(msgData.drawHeight == null)
      msgData.drawHeight = image.height;

    activeContext.drawImage(image, msgData.drawX, msgData.drawY, msgData.drawWidth, msgData.drawHeight);

    sendImageRequestResult(0);
  }
  else
    sendImageRequestResult(null, "Image '" + msgData.imageName + "' has not been loaded.");
}

function onMsgDrawImageClipRequest(msgData)
//Draw the given image to the active canvas
{
  var image;

  if(images.has(msgData.imageName))
  {
    image = images.get(msgData.imageName);

    activeContext.drawImage(image, msgData.clipX, msgData.clipY, msgData.clipWidth, msgData.clipHeight,
                            msgData.drawX, msgData.drawY, msgData.drawWidth, msgData.drawHeight);

    sendImageRequestResult(0);
  }
  else
    sendImageRequestResult(null, "Image '" + msgData.imageName + "' has not been loaded.");
}

function onMsgDrawImageTiledRequest(msgData)
//
{
  var image;
  var initX, initY, destX, destY;

  if(!images.has(msgData.imageName))
  {
    sendImageRequestResult(null, "Image '" + msgData.imageName + "' has not been loaded.");
    return;
  }

  image = images.get(msgData.imageName);

  msgData.offsetX = msgData.offsetX % image.width;
  msgData.offsetY = msgData.offsetY % image.height;

  initX = msgData.drawX + msgData.offsetX - (msgData.offsetX > 0 ? image.width : 0);
  initY = msgData.drawY + msgData.offsetY - (msgData.offsetY > 0 ? image.height : 0);

  activeContext.save();
  activeContext.beginPath();
  activeContext.rect(msgData.drawX, msgData.drawY, msgData.drawWidth, msgData.drawHeight);
  activeContext.clip();

  for(destY = initY; destY < (msgData.drawY + msgData.drawHeight); destY += image.height)
  {
    for(destX = initX; destX < (msgData.drawX + msgData.drawWidth); destX += image.width)
    {
      activeContext.drawImage(image, destX, destY);
    }
  }

  activeContext.beginPath();
  activeContext.restore();

  sendImageRequestResult(0);
}

function onMsgGetImageWidthRequest(msgData)
//
{
  if(images.has(msgData.imageName))
    sendImageRequestResult(images.get(msgData.imageName).width);
  else
    sendImageRequestResult(null, "Image '" + msgData.imageName + "' has not been loaded.");
}

function onMsgGetImageHeightRequest(msgData)
//
{
  if(images.has(msgData.imageName))
    sendImageRequestResult(images.get(msgData.imageName).height);
  else
    sendImageRequestResult(null, "Image '" + msgData.imageName + "' has not been loaded.");
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

function onMsgAddCanvasEvent(msgData)
//
{
  progCanvas.addEventListener(msgData.eventName, canvas_onEvent);
}

function onMsgRemoveCanvasEvent(msgData)
//
{
  progCanvas.removeEventListener(msgData.eventName, canvas_onEvent);
}

function onMsgDrawText(msgData)
//
{
  if(msgData.isFilled)
    activeContext.fillText(msgData.text, msgData.drawX, msgData.drawY);
  else
    activeContext.strokeText(msgData.text, msgData.drawX, msgData.drawY);
}

function onMsgDrawRect(msgData)
//
{
  if(msgData.isFilled)
    activeContext.fillRect(msgData.drawX, msgData.drawY, msgData.drawWidth, msgData.drawHeight);
  else
    activeContext.strokeRect(msgData.drawX, msgData.drawY, msgData.drawWidth, msgData.drawHeight);
}

function onMsgDrawCircle(msgData)
//
{
  activeContext.beginPath();
  activeContext.arc(msgData.centerX, msgData.centerY, msgData.radius, 0, 2 * Math.PI);

  if(msgData.isFilled)
    activeContext.fill();
  else
    activeContext.stroke();
}

function onMsgDrawLine(msgData)
//
{
  activeContext.beginPath();
  activeContext.moveTo(msgData.startX, msgData.startY);
  activeContext.lineTo(msgData.endX, msgData.endY);
  activeContext.stroke();
}

function onMsgSetTextFont(msgData)
//
{
  activeContext.font = msgData.font;
}

function onMsgSetFillColor(msgData)
//
{
  activeContext.fillStyle = msgData.color;
}

function onMsgSetLineColor(msgData)
//
{
  activeContext.strokeStyle = msgData.color;
}

function onMsgSetLineSize(msgData)
//
{
  activeContext.lineWidth = msgData.size;
}

