class CanvasEvent
{
  constructor(name, paramCount, callback)
  {
    this.name = name;
    this.paramCount = paramCount;
    this.callback = callback;
  }
}

var canvasNativeFuncs = [
                  new ObjNativeFunc("showcanvas", 0, 0, funcShowCanvas),
                  new ObjNativeFunc("hidecanvas", 0, 0, funcHideCanvas),
                  new ObjNativeFunc("setcanvaswidth", 1, 1, funcSetCanvasWidth),
                  new ObjNativeFunc("setcanvasheight", 1, 1, funcSetCanvasHeight),
                  new ObjNativeFunc("clearcanvas", 0, 0, funcClearCanvas),
                  new ObjNativeFunc("loadimage", 2, 2, funcLoadImage),
                  new ObjNativeFunc("unloadimage", 1, 1, funcUnloadImage),
                  new ObjNativeFunc("drawimage", 3, 3, funcDrawImage),
                  new ObjNativeFunc("enablecanvasbuffer", 0, 0, funcEnableCanvasBuffer),
                  new ObjNativeFunc("disablecanvasbuffer", 0, 0, funcDisableCanvasBuffer),
                  new ObjNativeFunc("drawcanvasbuffer", 0, 1, funcDrawCanvasBuffer),
                  new ObjNativeFunc("setcanvasevent", 1, 2, funcSetCanvasEvent),
                  new ObjNativeFunc("drawtext", 3, 3, funcDrawText),
                  new ObjNativeFunc("getimagewidth", 1, 1, funcGetImageWidth),
                  new ObjNativeFunc("getimageheight", 1, 1, funcGetImageHeight)
                 ];

var canvasEvents = [
                  new CanvasEvent("pointerdown", 2, null),
                  new CanvasEvent("pointerup", 2, null),
                  new CanvasEvent("pointermove", 2, null),
                  new CanvasEvent("keydown", 1, null),
                  new CanvasEvent("keyup", 1, null)
                 ];

var canvasImageNames = [];
var canvasImageSizes = [];
var loadImageCallback = null;
var drawBufferCallback = null;

function onLoadImageResult(resultData)
//
{
  if(!resultData[0])
    canvasImageNames.pop();
  else
    canvasImageSizes.push({width: resultData[1], height: resultData[2]});

  loadImageCallback.runtime.stack[loadImageCallback.runtime.stack.length - 1] = resultData[0];
  loadImageCallback.runFunc();
}

function onCanvasEvent(eventData)
//
{
  var eventIndex = canvasEvents.findIndex((event) => event.name == eventData[0]);

  eventData.splice(0, 1);
  canvasEvents[eventIndex].callback.runFunc(eventData);
}

function onDrawCanvasBufferDone()
//
{
  if(drawBufferCallback == null)
    return;

  drawBufferCallback.runFunc();
}

function getCanvasImageIndex(imageName)
//Return the index of the given image item
{
  imageName = imageName.toLowerCase();

  for(var imageIndex = 0; imageIndex < canvasImageNames.length; imageIndex++)
  {
    if(canvasImageNames[imageIndex].toLowerCase() == imageName)
      return imageIndex;
  }

  return -1;
}

function funcShowCanvas(runtime, args)
//Tell the UI thread to show the canvas pane
{
  postMessage({msgId: MSGID_SHOW_CANVAS});
}

function funcHideCanvas(runtime, args)
//Tell the UI thread to hide the canvas pane
{
  postMessage({msgId: MSGID_HIDE_CANVAS});
}

function funcSetCanvasWidth(runtime, args)
//
{
  var newWidth = args[0];

  postMessage({msgId: MSGID_SET_CANVAS_WIDTH, msgData: newWidth});

  return 0;
}

function funcSetCanvasHeight(runtime, args)
//
{
  var newHeight = args[0];

  postMessage({msgId: MSGID_SET_CANVAS_HEIGHT, msgData: newHeight});

  return 0;
}

function funcClearCanvas(runtime, args)
//Send a message to the canvas to clear it
{
  postMessage({msgId: MSGID_CLEAR_CANVAS});
  return 0;
}

function funcLoadImage(runtime, args)
//Send a message to the canvas to load an image
{
  var imageName = args[0];
  var imageSource = args[1];

  if(canvasImageNames.indexOf(imageName) != -1)
    runtime.raiseError("Image '" + imageName + "' is already loaded.");

  canvasImageNames.push(imageName);

  if(loadImageCallback == null)
    loadImageCallback = new CallbackContext(runtime);
  else
    loadImageCallback.runtime = runtime;

  postMessage({msgId: MSGID_LOAD_IMAGE_REQUEST, msgData: imageSource});

  runtime.status = RUNTIME_STATUS_PAUSED;

  return false;
}

function funcUnloadImage(runtime, args)
//Send a message to the canvas to unload an image
{
  var imageName = args[0];
  var imageNameIndex = canvasImageNames.indexOf(imageName);

  if(imageNameIndex == -1)
    runtime.raiseError("Image '" + imageName + "' does not exist.");

  canvasImageNames.splice(imageNameIndex, 1);
  postMessage({msgId: MSGID_UNLOAD_IMAGE, msgData: imageNameIndex});

  return 0;
}

function funcDrawImage(runtime, args)
//Send an image to the canvas to draw an image
{
  var imageName = args[0];
  var imageNameIndex = canvasImageNames.indexOf(imageName);
  var drawLeft = args[1];
  var drawTop = args[2];

  if(imageNameIndex == -1)
    runtime.raiseError("Image '" + imageName + "' does not exist.");

  postMessage({msgId: MSGID_DRAW_IMAGE, msgData: [imageNameIndex, drawLeft, drawTop]});

  return 0;
}

function funcEnableCanvasBuffer(runtime, args)
//
{
  postMessage({msgId: MSGID_ENABLE_CANVAS_BUFFER});
  return 0;
}

function funcDisableCanvasBuffer(runtime, args)
//
{
  postMessage({msgId: MSGID_DISABLE_CANVAS_BUFFER});
  return 0;
}

function funcDrawCanvasBuffer(runtime, args)
//
{
  var callbackUserFunc;

  if(args.length == 0)
  {
    if(drawBufferCallback != null)
      drawBufferCallback = null;
  }
  else
  {
    callbackUserFunc = args[0];

    if(!(callbackUserFunc instanceof ObjUserFunc))
      runtime.raiseError("Argument of DrawCanvasBuffer() must be a function.");

    if(callbackUserFunc.paramCount != 0)
      runtime.raiseError("Callback function for DrawCanvasBuffer() must have zero parameters.");

    if(drawBufferCallback == null)
    {
      drawBufferCallback = new CallbackContext(runtime, callbackUserFunc);
    }
    else
    {
      drawBufferCallback.runtime = runtime;
      drawBufferCallback.userFunc = callbackUserFunc;
    }
  }

  postMessage({msgId: MSGID_DRAW_CANVAS_BUFFER});

  return 0;
}

function funcSetCanvasEvent(runtime, args)
//
{
  var eventName = args[0];
  var eventIndex = canvasEvents.findIndex((event) => event.name == eventName);
  var eventUserFunc;

  if(eventIndex == -1)
    runtime.raiseError("SetCanvasEvent() does not recognize event named '" + eventName + "'.");

  if(args.length == 2)
  {
    eventUserFunc = args[1];

    if(!(eventUserFunc instanceof ObjUserFunc))
      runtime.raiseError("Second argument of SetCanvasEvent() must be a function.");

    if(eventUserFunc.paramCount != canvasEvents[eventIndex].paramCount)
      runtime.raiseError("Handler function " + eventUserFunc.ident + "() for event '" + eventName + "' must have " + canvasEvents[eventIndex].paramCount + " parameters.");

    if(canvasEvents[eventIndex].callback == null)
    {
      canvasEvents[eventIndex].callback = new CallbackContext(runtime, eventUserFunc);
    }
    else
    {
      canvasEvents[eventIndex].callback.runtime = runtime;
      canvasEvents[eventIndex].callback.userFunc = eventUserFunc;
    }

    postMessage({msgId: MSGID_ADD_CANVAS_EVENT, msgData: eventName});
  }
  else
  {
    canvasEvents[eventIndex].callback = null;
    postMessage({msgId: MSGID_REMOVE_CANVAS_EVENT, msgData: eventName});
  }

  return 0;
}

function funcDrawText(runtime, args)
//
{
  var text = args[0];
  var drawLeft = args[1];
  var drawTop = args[2];

  postMessage({msgId: MSGID_DRAW_TEXT, msgData: [text, drawLeft, drawTop]});

  return 0;
}

function funcGetImageWidth(runtime, args)
//
{
  var imageName = args[0];
  var imageNameIndex = canvasImageNames.indexOf(imageName);

  if(imageNameIndex == -1)
    runtime.raiseError("Image '" + imageName + "' does not exist.");

  return canvasImageSizes[imageNameIndex].width;
}

function funcGetImageHeight(runtime, args)
//
{
  var imageName = args[0];
  var imageNameIndex = canvasImageNames.indexOf(imageName);

  if(imageNameIndex == -1)
    runtime.raiseError("Image '" + imageName + "' does not exist.");

  return canvasImageSizes[imageNameIndex].height;
}

