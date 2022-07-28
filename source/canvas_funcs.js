class CanvasEvent
{
  constructor(name, paramCount, callback)
  {
    this.name = name;
    this.paramCount = paramCount;
    this.callback = callback;
  }
}

const canvasNativeFuncs = [
                  new ObjNativeFunc("showcanvas", 0, 0, funcShowCanvas),
                  new ObjNativeFunc("hidecanvas", 0, 0, funcHideCanvas),
                  new ObjNativeFunc("setcanvaswidth", 1, 1, funcSetCanvasWidth),
                  new ObjNativeFunc("setcanvasheight", 1, 1, funcSetCanvasHeight),
                  new ObjNativeFunc("clearcanvas", 0, 0, funcClearCanvas),
                  new ObjNativeFunc("loadimage", 2, 2, funcLoadImage),
                  new ObjNativeFunc("unloadimage", 1, 1, funcUnloadImage),
                  new ObjNativeFunc("drawimage", 3, 5, funcDrawImage),
                  new ObjNativeFunc("drawimageclip", 7, 9, funcDrawImageClip),
                  new ObjNativeFunc("drawimagetiled", 5, 7, funcDrawImageTiled),
                  new ObjNativeFunc("getimagewidth", 1, 1, funcGetImageWidth),
                  new ObjNativeFunc("getimageheight", 1, 1, funcGetImageHeight),
                  new ObjNativeFunc("enablecanvasbuffer", 0, 0, funcEnableCanvasBuffer),
                  new ObjNativeFunc("disablecanvasbuffer", 0, 0, funcDisableCanvasBuffer),
                  new ObjNativeFunc("drawcanvasbuffer", 0, 1, funcDrawCanvasBuffer),
                  new ObjNativeFunc("setcanvasevent", 1, 2, funcSetCanvasEvent),
                  new ObjNativeFunc("drawtext", 3, 4, funcDrawText),
                  new ObjNativeFunc("drawrect", 4, 5, funcDrawRect),
                  new ObjNativeFunc("drawcircle", 3, 4, funcDrawCircle),
                  new ObjNativeFunc("drawline", 4, 5, funcDrawLine),
                  new ObjNativeFunc("settextfont", 1, 1, funcSetTextFont),
                  new ObjNativeFunc("setfillcolor", 1, 1, funcSetFillColor),
                  new ObjNativeFunc("setlinecolor", 1, 1, funcSetLineColor),
                  new ObjNativeFunc("setlinesize", 1, 1, funcSetLineSize)
                 ];

var canvasEvents = [
                  new CanvasEvent("pointerdown", 2, null),
                  new CanvasEvent("pointerup", 2, null),
                  new CanvasEvent("pointermove", 2, null),
                  new CanvasEvent("keydown", 1, null),
                  new CanvasEvent("keyup", 1, null)
                 ];

var imageResultCallback = null;
var drawBufferCallback = null;

function onImageRequestResult(result)
//
{
  if(result[0] != "")
    imageResultCallback.endVM(result[0]);
  else
  {
    imageResultCallback.vm.stack[imageResultCallback.vm.stack.length - 1] = result[1];
    imageResultCallback.runFunc();
  }
}

function sendImageRequest(vm, msgId, msgData)
//
{
  if(imageResultCallback == null)
    imageResultCallback = new CallbackContext(vm);
  else
    imageResultCallback.vm = vm;

  postMessage({msgId: msgId, msgData: msgData});

  vm.changeStatus(VM_STATUS_IDLE);
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

function funcShowCanvas(vm, args)
//Tell the UI thread to show the canvas pane
{
  postMessage({msgId: MSGID_SHOW_CANVAS});
}

function funcHideCanvas(vm, args)
//Tell the UI thread to hide the canvas pane
{
  postMessage({msgId: MSGID_HIDE_CANVAS});
}

function funcSetCanvasWidth(vm, args)
//
{
  var newWidth = args[0];

  postMessage({msgId: MSGID_SET_CANVAS_WIDTH, msgData: newWidth});

  return 0;
}

function funcSetCanvasHeight(vm, args)
//
{
  var newHeight = args[0];

  postMessage({msgId: MSGID_SET_CANVAS_HEIGHT, msgData: newHeight});

  return 0;
}

function funcClearCanvas(vm, args)
//Send a message to the canvas to clear it
{
  postMessage({msgId: MSGID_CLEAR_CANVAS});
  return 0;
}

function funcLoadImage(vm, args)
//Send a message to the canvas to load an image
{
  var imageName = args[0];
  var imageSource = args[1];

  sendImageRequest(vm, MSGID_LOAD_IMAGE_REQUEST, [imageName, imageSource]);

  return false;
}

function funcUnloadImage(vm, args)
//Send a message to the canvas to unload an image
{
  var imageName = args[0];

  sendImageRequest(vm, MSGID_UNLOAD_IMAGE_REQUEST, imageName);

  return 0;
}

function funcDrawImage(vm, args)
//Send a message to the canvas to draw an image
{
  var imageName = args[0];
  var drawX = args[1];
  var drawY = args[2];
  var drawWidth = null;
  var drawHeight = null;

  if(args.length >= 4)
    drawWidth = args[3];

  if(args.length == 5)
    drawHeight = args[4];

  sendImageRequest(vm, MSGID_DRAW_IMAGE_REQUEST, [imageName, drawX, drawY, drawWidth, drawHeight]);

  return 0;
}

function funcDrawImageClip(vm, args)
//Send an image to the canvas to draw an image
{
  var imageName = args[0];
  var clipX = args[1];
  var clipY = args[2];
  var clipWidth = args[3];
  var clipHeight = args[4];
  var drawX = args[5];
  var drawY = args[6];
  var drawWidth = clipWidth;
  var drawHeight = clipHeight;

  if(args.length >= 8)
    drawWidth = args[7];

  if(args.length == 9)
    drawHeight = args[8];

  sendImageRequest(vm, MSGID_DRAW_IMAGE_CLIP_REQUEST, [imageName, clipX, clipY, clipWidth, clipHeight, drawX, drawY, drawWidth, drawHeight]);

  return 0;
}

function funcDrawImageTiled(vm, args)
//
{
  var imageName = args[0];
  var drawX = args[1];
  var drawY = args[2];
  var drawWidth = args[3];
  var drawHeight = args[4];
  var offsetX = 0;
  var offsetY = 0;

  if(args.length >= 6)
    offsetX = args[5];

  if(args.length == 7)
    offsetY = args[6];

  sendImageRequest(vm, MSGID_DRAW_IMAGE_TILED_REQUEST, [imageName, drawX, drawY, drawWidth, drawHeight, offsetX, offsetY]);

  return 0;
}

function funcGetImageWidth(vm, args)
//
{
  var imageName = args[0];

  sendImageRequest(vm, MSGID_GET_IMAGE_WIDTH_REQUEST, imageName);

  return 0;
}

function funcGetImageHeight(vm, args)
//
{
  var imageName = args[0];

  sendImageRequest(vm, MSGID_GET_IMAGE_HEIGHT_REQUEST, imageName);

  return 0;
}

function funcEnableCanvasBuffer(vm, args)
//
{
  postMessage({msgId: MSGID_ENABLE_CANVAS_BUFFER});
  return 0;
}

function funcDisableCanvasBuffer(vm, args)
//
{
  postMessage({msgId: MSGID_DISABLE_CANVAS_BUFFER});
  return 0;
}

function funcDrawCanvasBuffer(vm, args)
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
      vm.endWithError("Argument of DrawCanvasBuffer() must be a function.");

    if(callbackUserFunc.paramCount != 0)
      vm.endWithError("Callback function for DrawCanvasBuffer() must have zero parameters.");

    if(drawBufferCallback == null)
    {
      drawBufferCallback = new CallbackContext(vm, callbackUserFunc);
    }
    else
    {
      drawBufferCallback.vm = vm;
      drawBufferCallback.userFunc = callbackUserFunc;
    }
  }

  postMessage({msgId: MSGID_DRAW_CANVAS_BUFFER});

  return 0;
}

function funcSetCanvasEvent(vm, args)
//
{
  var eventName = args[0];
  var eventIndex = canvasEvents.findIndex((event) => event.name == eventName);
  var eventUserFunc;

  if(eventIndex == -1)
    vm.endWithError("SetCanvasEvent() does not recognize event named '" + eventName + "'.");

  if(args.length == 2)
  {
    eventUserFunc = args[1];

    if(!(eventUserFunc instanceof ObjUserFunc))
      vm.endWithError("Second argument of SetCanvasEvent() must be a function.");

    if(eventUserFunc.paramCount != canvasEvents[eventIndex].paramCount)
      vm.endWithError("Handler function " + eventUserFunc.ident + "() for event '" + eventName + "' must have " + canvasEvents[eventIndex].paramCount + " parameters.");

    if(canvasEvents[eventIndex].callback == null)
    {
      canvasEvents[eventIndex].callback = new CallbackContext(vm, eventUserFunc);
    }
    else
    {
      canvasEvents[eventIndex].callback.vm = vm;
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

function funcDrawText(vm, args)
//
{
  var text = args[0];
  var drawX = args[1];
  var drawY = args[2];
  var isFilled = true;

  if(args.length == 4)
    isFilled = args[3];

  postMessage({msgId: MSGID_DRAW_TEXT, msgData: [text, drawX, drawY, isFilled]});

  return 0;
}

function funcDrawRect(vm, args)
//
{
  var drawX = args[0];
  var drawY = args[1];
  var drawWidth = args[2];
  var drawHeight = args[3];
  var isFilled = true;

  if(args.length == 5)
    isFilled = args[4];

  postMessage({msgId: MSGID_DRAW_RECT, msgData: [drawX, drawY, drawWidth, drawHeight, isFilled]});

  return 0;
}

function funcDrawCircle(vm, args)
//
{
  var centerX = args[0];
  var centerY = args[1];
  var radius = args[2];
  var isFilled = true;

  if(args.length == 4)
    isFilled = args[3];

  postMessage({msgId: MSGID_DRAW_CIRCLE, msgData: [centerX, centerY, radius, isFilled]});

  return 0;
}

function funcDrawLine(vm, args)
//
{
  var startX = args[0];
  var startY = args[1];
  var endX = args[2];
  var endY = args[3];

  postMessage({msgId: MSGID_DRAW_LINE, msgData: [startX, startY, endX, endY]});

  return 0;
}

function funcSetTextFont(vm, args)
//
{
  var font = args[0];

  postMessage({msgId: MSGID_SET_TEXT_FONT, msgData: font});

  return 0;
}

function funcSetFillColor(vm, args)
//
{
  var color = args[0];

  postMessage({msgId: MSGID_SET_FILL_COLOR, msgData: color});

  return 0;
}

function funcSetLineColor(vm, args)
//
{
  var color = args[0];

  postMessage({msgId: MSGID_SET_LINE_COLOR, msgData: color});

  return 0;
}

function funcSetLineSize(vm, args)
{
  var size = args[0];

  postMessage({msgId: MSGID_SET_LINE_SIZE, msgData: size});

  return 0;
}

