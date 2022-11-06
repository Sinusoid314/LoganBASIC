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
                  new ObjNativeFunc("showCanvas", 0, 0, funcShowCanvas),
                  new ObjNativeFunc("hideCanvas", 0, 0, funcHideCanvas),
                  new ObjNativeFunc("setCanvasWidth", 1, 1, funcSetCanvasWidth),
                  new ObjNativeFunc("setCanvasHeight", 1, 1, funcSetCanvasHeight),
                  new ObjNativeFunc("clearCanvas", 0, 0, funcClearCanvas),
                  new ObjNativeFunc("loadImage", 2, 2, funcLoadImage),
                  new ObjNativeFunc("unloadImage", 1, 1, funcUnloadImage),
                  new ObjNativeFunc("drawImage", 3, 5, funcDrawImage),
                  new ObjNativeFunc("drawImageClip", 7, 9, funcDrawImageClip),
                  new ObjNativeFunc("drawImageTiled", 5, 7, funcDrawImageTiled),
                  new ObjNativeFunc("getImageWidth", 1, 1, funcGetImageWidth),
                  new ObjNativeFunc("getImageHeight", 1, 1, funcGetImageHeight),
                  new ObjNativeFunc("enableCanvasBuffer", 0, 0, funcEnableCanvasBuffer),
                  new ObjNativeFunc("disableCanvasBuffer", 0, 0, funcDisableCanvasBuffer),
                  new ObjNativeFunc("drawCanvasBuffer", 0, 1, funcDrawCanvasBuffer),
                  new ObjNativeFunc("setCanvasEvent", 1, 2, funcSetCanvasEvent),
                  new ObjNativeFunc("drawText", 3, 4, funcDrawText),
                  new ObjNativeFunc("drawRect", 4, 5, funcDrawRect),
                  new ObjNativeFunc("drawCircle", 3, 4, funcDrawCircle),
                  new ObjNativeFunc("drawLine", 4, 5, funcDrawLine),
                  new ObjNativeFunc("setTextFont", 1, 1, funcSetTextFont),
                  new ObjNativeFunc("setFillColor", 1, 1, funcSetFillColor),
                  new ObjNativeFunc("setLineColor", 1, 1, funcSetLineColor),
                  new ObjNativeFunc("setLineSize", 1, 1, funcSetLineSize)
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

function resetCanvas()
//
{
  imageResultCallback = null;
  drawBufferCallback = null;
}

function onMsgImageRequestResult(msgData)
//
{
  if(!imageResultCallback)
    return;

  if(msgData.errorMsg != "")
    imageResultCallback.vm.runError(msgData.errorMsg);
  else
  {
    imageResultCallback.vm.stack[imageResultCallback.vm.stack.length - 1] = msgData.resultVal;
    imageResultCallback.runFunc();
  }
}

function sendImageRequest(vm, msgId, msgData)
//
{
  if(!imageResultCallback)
    imageResultCallback = new CallbackContext(vm);
  else
    imageResultCallback.vm = vm;

  postMessage({msgId: msgId, msgData: msgData});

  vm.runLoopExitFlag = true;
}

function onMsgCanvasEvent(msgData)
//
{
  var eventIndex = canvasEvents.findIndex((event) => event.name == msgData.eventName);

  canvasEvents[eventIndex].callback.runFunc(msgData.eventArgs);
}

function onMsgDrawCanvasBufferDone()
//
{
  if(!drawBufferCallback)
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
  postMessage({msgId: MSGID_SET_CANVAS_WIDTH, msgData: {newWidth: args[0]}});
  return 0;
}

function funcSetCanvasHeight(vm, args)
//
{
  postMessage({msgId: MSGID_SET_CANVAS_HEIGHT, msgData: {newHeight: args[0]}});
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
  sendImageRequest(vm, MSGID_LOAD_IMAGE_REQUEST, {imageName: args[0], imageSource: args[1]});
  return false;
}

function funcUnloadImage(vm, args)
//Send a message to the canvas to unload an image
{
  sendImageRequest(vm, MSGID_UNLOAD_IMAGE_REQUEST, {imageName: args[0]});
  return 0;
}

function funcDrawImage(vm, args)
//Send a message to the canvas to draw an image
{
  var msgData = {
      imageName: args[0],
      drawX: args[1],
      drawY: args[2],
      drawWidth: null,
      drawHeight: null
  };

  if(args.length >= 4)
    msgData.drawWidth = args[3];

  if(args.length == 5)
    msgData.drawHeight = args[4];

  sendImageRequest(vm, MSGID_DRAW_IMAGE_REQUEST, msgData);

  return 0;
}

function funcDrawImageClip(vm, args)
//Send an image to the canvas to draw an image
{
  var msgData = {
      imageName: args[0],
      clipX: args[1],
      clipY: args[2],
      clipWidth: args[3],
      clipHeight: args[4],
      drawX: args[5],
      drawY: args[6],
      drawWidth: args[3],
      drawHeight: args[4]
  };

  if(args.length >= 8)
    msgData.drawWidth = args[7];

  if(args.length == 9)
    msgData.drawHeight = args[8];

  sendImageRequest(vm, MSGID_DRAW_IMAGE_CLIP_REQUEST, msgData);

  return 0;
}

function funcDrawImageTiled(vm, args)
//
{
  var msgData = {
      imageName: args[0],
      drawX: args[1],
      drawY: args[2],
      drawWidth: args[3],
      drawHeight: args[4],
      offsetX: 0,
      offsetY: 0
  };

  if(args.length >= 6)
    msgData.offsetX = args[5];

  if(args.length == 7)
    msgData.offsetY = args[6];

  sendImageRequest(vm, MSGID_DRAW_IMAGE_TILED_REQUEST, msgData);

  return 0;
}

function funcGetImageWidth(vm, args)
//
{
  sendImageRequest(vm, MSGID_GET_IMAGE_WIDTH_REQUEST, {imageName: args[0]});
  return 0;
}

function funcGetImageHeight(vm, args)
//
{
  sendImageRequest(vm, MSGID_GET_IMAGE_HEIGHT_REQUEST, {imageName: args[0]});
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
    if(drawBufferCallback)
      drawBufferCallback = null;
  }
  else
  {
    callbackUserFunc = args[0];

    if(!(callbackUserFunc instanceof ObjUserFunc))
      vm.runError("Argument of DrawCanvasBuffer() must be a function.");

    if(callbackUserFunc.paramCount != 0)
      vm.runError("Callback function for DrawCanvasBuffer() must have zero parameters.");

    if(!drawBufferCallback)
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
    vm.runError("SetCanvasEvent() does not recognize event named '" + eventName + "'.");

  if(args.length == 2)
  {
    eventUserFunc = args[1];

    if(!(eventUserFunc instanceof ObjUserFunc))
      vm.runError("Second argument of SetCanvasEvent() must be a function.");

    if(eventUserFunc.paramCount != canvasEvents[eventIndex].paramCount)
      vm.runError("Handler function " + eventUserFunc.ident + "() for event '" + eventName + "' must have " + canvasEvents[eventIndex].paramCount + " parameters.");

    if(canvasEvents[eventIndex].callback == null)
    {
      canvasEvents[eventIndex].callback = new CallbackContext(vm, eventUserFunc);
    }
    else
    {
      canvasEvents[eventIndex].callback.vm = vm;
      canvasEvents[eventIndex].callback.userFunc = eventUserFunc;
    }

    postMessage({msgId: MSGID_ADD_CANVAS_EVENT, msgData: {eventName: eventName}});
  }
  else
  {
    canvasEvents[eventIndex].callback = null;
    postMessage({msgId: MSGID_REMOVE_CANVAS_EVENT, msgData: {eventName: eventName}});
  }

  return 0;
}

function funcDrawText(vm, args)
//
{
  var msgData = {
      text: args[0],
      drawX: args[1],
      drawY: args[2],
      isFilled: true
  };

  if(args.length == 4)
    msgData.isFilled = args[3];

  postMessage({msgId: MSGID_DRAW_TEXT, msgData: msgData});

  return 0;
}

function funcDrawRect(vm, args)
//
{
  var msgData = {
      drawX: args[0],
      drawY: args[1],
      drawWidth: args[2],
      drawHeight: args[3],
      isFilled: true
  };

  if(args.length == 5)
    msgData.isFilled = args[4];

  postMessage({msgId: MSGID_DRAW_RECT, msgData: msgData});

  return 0;
}

function funcDrawCircle(vm, args)
//
{
  var msgData = {
      centerX: args[0],
      centerY: args[1],
      radius: args[2],
      isFilled: true
  };

  if(args.length == 4)
    msgData.isFilled = args[3];

  postMessage({msgId: MSGID_DRAW_CIRCLE, msgData: msgData});

  return 0;
}

function funcDrawLine(vm, args)
//
{
  var msgData = {
      startX: args[0],
      startY: args[1],
      endX: args[2],
      endY: args[3]
  };

  postMessage({msgId: MSGID_DRAW_LINE, msgData: msgData});

  return 0;
}

function funcSetTextFont(vm, args)
//
{
  postMessage({msgId: MSGID_SET_TEXT_FONT, msgData: {font: args[0]}});
  return 0;
}

function funcSetFillColor(vm, args)
//
{
  postMessage({msgId: MSGID_SET_FILL_COLOR, msgData: {color: args[0]}});
  return 0;
}

function funcSetLineColor(vm, args)
//
{
  postMessage({msgId: MSGID_SET_LINE_COLOR, msgData: {color: args[0]}});
  return 0;
}

function funcSetLineSize(vm, args)
{
  postMessage({msgId: MSGID_SET_LINE_SIZE, msgData: {size: args[0]}});
  return 0;
}

