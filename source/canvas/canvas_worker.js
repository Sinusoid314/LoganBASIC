import * as Objects from "../core/objects.js";
import * as VM from "../core/vm.js";
import * as MainWorker from "../main_worker.js";
import * as CanvasCommon from "./canvas_common.js";


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
                  new Objects.ObjNativeFunc("showCanvas", 0, 0, funcShowCanvas),
                  new Objects.ObjNativeFunc("hideCanvas", 0, 0, funcHideCanvas),
                  new Objects.ObjNativeFunc("setCanvasWidth", 1, 1, funcSetCanvasWidth),
                  new Objects.ObjNativeFunc("setCanvasHeight", 1, 1, funcSetCanvasHeight),
                  new Objects.ObjNativeFunc("clearCanvas", 0, 0, funcClearCanvas),
                  new Objects.ObjNativeFunc("clearRect", 4, 4, funcClearRect),
                  new Objects.ObjNativeFunc("loadImage", 2, 2, funcLoadImage),
                  new Objects.ObjNativeFunc("unloadImage", 1, 1, funcUnloadImage),
                  new Objects.ObjNativeFunc("drawImage", 3, 5, funcDrawImage),
                  new Objects.ObjNativeFunc("drawImageClip", 7, 9, funcDrawImageClip),
                  new Objects.ObjNativeFunc("drawImageTiled", 5, 7, funcDrawImageTiled),
                  new Objects.ObjNativeFunc("getImageWidth", 1, 1, funcGetImageWidth),
                  new Objects.ObjNativeFunc("getImageHeight", 1, 1, funcGetImageHeight),
                  new Objects.ObjNativeFunc("enableCanvasBuffer", 0, 0, funcEnableCanvasBuffer),
                  new Objects.ObjNativeFunc("disableCanvasBuffer", 0, 0, funcDisableCanvasBuffer),
                  new Objects.ObjNativeFunc("drawCanvasBuffer", 0, 0, funcDrawCanvasBuffer),
                  new Objects.ObjNativeFunc("drawCanvasBufferClip", 6, 8, funcDrawCanvasBufferClip),
                  new Objects.ObjNativeFunc("setCanvasEvent", 1, 2, funcSetCanvasEvent),
                  new Objects.ObjNativeFunc("drawText", 3, 4, funcDrawText),
                  new Objects.ObjNativeFunc("drawRect", 4, 5, funcDrawRect),
                  new Objects.ObjNativeFunc("drawCircle", 3, 4, funcDrawCircle),
                  new Objects.ObjNativeFunc("drawLine", 4, 5, funcDrawLine),
                  new Objects.ObjNativeFunc("setTextFont", 1, 1, funcSetTextFont),
                  new Objects.ObjNativeFunc("setFillColor", 1, 1, funcSetFillColor),
                  new Objects.ObjNativeFunc("setLineColor", 1, 1, funcSetLineColor),
                  new Objects.ObjNativeFunc("setLineSize", 1, 1, funcSetLineSize),
                  new Objects.ObjNativeFunc("updateDeltaTime", 0, 0, funcUpdateDeltaTime),
                  new Objects.ObjNativeFunc("resetDeltaTime", 0, 0, funcResetDeltaTime),
                  new Objects.ObjNativeFunc("getDeltaTime", 0, 0, funcGetDeltaTime),
                  new Objects.ObjNativeFunc("setMaxDeltaTime", 1, 1, funcSetMaxDeltaTime),
                  new Objects.ObjNativeFunc("getMaxDeltaTime", 0, 0, funcGetMaxDeltaTime),
                  new Objects.ObjNativeFunc("getTextDrawWidth", 1, 1, funcGetTextDrawWidth),
                  new Objects.ObjNativeFunc("getTextDrawHeight", 1, 1, funcGetTextDrawHeight)
                 ];

var canvasEvents = [
                  new CanvasEvent("pointerdown", 2, null),
                  new CanvasEvent("pointerup", 2, null),
                  new CanvasEvent("pointermove", 2, null),
                  new CanvasEvent("keydown", 1, null),
                  new CanvasEvent("keyup", 1, null)
                 ];

var drawBufferDoneEvent = new CanvasEvent("drawbufferdone", 0, null);
var imageResultCallback = null;
var contextResultCallback = null;
var deltaTime = 0;
var maxDeltaTime = 0.03;
var prevTime =  0;

canvasEvents.push(drawBufferDoneEvent);

MainWorker.mainVM.addNativeFuncArray(canvasNativeFuncs);

setCanvasWorkerEvents();


function setCanvasWorkerEvents()
//
{
  MainWorker.workerOnProgEndHandlers.push(canvasWorker_onProgEnd);

  MainWorker.workerMessageMap.set(CanvasCommon.MSGID_IMAGE_REQUEST_RESULT, onMsgImageRequestResult);
  MainWorker.workerMessageMap.set(CanvasCommon.MSGID_CONTEXT_REQUEST_RESULT, onMsgContextRequestResult);
  MainWorker.workerMessageMap.set(CanvasCommon.MSGID_CANVAS_EVENT, onMsgCanvasEvent);
  MainWorker.workerMessageMap.set(CanvasCommon.MSGID_DRAW_CANVAS_BUFFER_DONE, onMsgDrawCanvasBufferDone);
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
    imageResultCallback.vm.stack.push(msgData.resultVal);
    imageResultCallback.resumeVM();
  }
}

function sendImageRequest(vm, msgId, msgData)
//
{
  if(!imageResultCallback)
    imageResultCallback = new VM.CallbackContext(vm);
  else
    imageResultCallback.vm = vm;

  postMessage({msgId: msgId, msgData: msgData});

  MainWorker.setExpectedResultMessageID(CanvasCommon.MSGID_IMAGE_REQUEST_RESULT);
  vm.runLoopExitFlag = true;
}

function onMsgContextRequestResult(msgData)
//
{
  if(!contextResultCallback)
    return;

  if(msgData.errorMsg != "")
    contextResultCallback.vm.runError(msgData.errorMsg);
  else
  {
    contextResultCallback.vm.stack.push(msgData.resultVal);
    contextResultCallback.resumeVM();
  }
}

function sendContextRequest(vm, msgId, msgData)
//
{
  if(!contextResultCallback)
    contextResultCallback = new VM.CallbackContext(vm);
  else
    contextResultCallback.vm = vm;

  postMessage({msgId: msgId, msgData: msgData});

  MainWorker.setExpectedResultMessageID(CanvasCommon.MSGID_CONTEXT_REQUEST_RESULT);
  vm.runLoopExitFlag = true;
}

function canvasWorker_onProgEnd()
//
{
  canvasEvents.forEach(event => event.callback = null);
  imageResultCallback = null;
  contextResultCallback = null;
}

function onMsgCanvasEvent(msgData)
//
{
  var eventIndex = canvasEvents.findIndex((event) => event.name == msgData.eventName);

  if(!canvasEvents[eventIndex].callback)
    return;
  
  canvasEvents[eventIndex].callback.resumeVM(msgData.eventArgs);
}

function onMsgDrawCanvasBufferDone(msgData)
//
{
  if(!drawBufferDoneEvent.callback)
    return;

  if(drawBufferDoneEvent.callback.vm.inBreakpoint)
    postMessage({msgId: CanvasCommon.MSGID_DRAW_CANVAS_BUFFER, msgData: null});
  else
  {
    drawBufferDoneEvent.callback.resumeVM();
  }
}

function funcShowCanvas(vm, args)
//Tell the UI thread to show the canvas pane
{
  postMessage({msgId: CanvasCommon.MSGID_SHOW_CANVAS, msgData: null});
  return null;
}

function funcHideCanvas(vm, args)
//Tell the UI thread to hide the canvas pane
{
  postMessage({msgId: CanvasCommon.MSGID_HIDE_CANVAS, msgData: null});
  return null;
}

function funcSetCanvasWidth(vm, args)
//
{
  postMessage({msgId: CanvasCommon.MSGID_SET_CANVAS_WIDTH, msgData: {newWidth: args[0]}});
  return null;
}

function funcSetCanvasHeight(vm, args)
//
{
  postMessage({msgId: CanvasCommon.MSGID_SET_CANVAS_HEIGHT, msgData: {newHeight: args[0]}});
  return null;
}

function funcClearCanvas(vm, args)
//Send a message to the canvas to clear it
{
  postMessage({msgId: CanvasCommon.MSGID_CLEAR_CANVAS, msgData: null});
  return null;
}

function funcClearRect(vm, args)
//
{
  var msgData = {
      rectX: args[0],
      rectY: args[1],
      rectWidth: args[2],
      rectHeight: args[3]
  };

  postMessage({msgId: CanvasCommon.MSGID_CLEAR_RECT, msgData: msgData});
  return null;
}

function funcLoadImage(vm, args)
//Send a message to the canvas to load an image
{
  sendImageRequest(vm, CanvasCommon.MSGID_LOAD_IMAGE_REQUEST, {imageName: args[0], imageSource: args[1]});
  return undefined;
}

function funcUnloadImage(vm, args)
//Send a message to the canvas to unload an image
{
  sendImageRequest(vm, CanvasCommon.MSGID_UNLOAD_IMAGE_REQUEST, {imageName: args[0]});
  return undefined;
}

function funcDrawImage(vm, args)
//Send a message to the canvas to draw an image
{
  var msgData = {
      imageName: args[0],
      drawX: args[1],
      drawY: args[2],
      drawWidth: (args.length >= 4) ? args[3] : null,
      drawHeight: (args.length == 5) ? args[4] : null
  };

  sendImageRequest(vm, CanvasCommon.MSGID_DRAW_IMAGE_REQUEST, msgData);

  return undefined;
}

function funcDrawImageClip(vm, args)
//Send an message to the canvas to draw an image
{
  var msgData = {
      imageName: args[0],
      clipX: args[1],
      clipY: args[2],
      clipWidth: args[3],
      clipHeight: args[4],
      drawX: args[5],
      drawY: args[6],
      drawWidth: (args.length >= 8) ? args[7] : args[3],
      drawHeight: (args.length == 9) ? args[8] : args[4]
  };

  sendImageRequest(vm, CanvasCommon.MSGID_DRAW_IMAGE_CLIP_REQUEST, msgData);

  return undefined;
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
      offsetX: (args.length >= 6) ? args[5] : 0,
      offsetY: (args.length == 7) ? args[6] : 0
  };

  sendImageRequest(vm, CanvasCommon.MSGID_DRAW_IMAGE_TILED_REQUEST, msgData);

  return undefined;
}

function funcGetImageWidth(vm, args)
//
{
  sendImageRequest(vm, CanvasCommon.MSGID_GET_IMAGE_WIDTH_REQUEST, {imageName: args[0]});
  return undefined;
}

function funcGetImageHeight(vm, args)
//
{
  sendImageRequest(vm, CanvasCommon.MSGID_GET_IMAGE_HEIGHT_REQUEST, {imageName: args[0]});
  return undefined;
}

function funcEnableCanvasBuffer(vm, args)
//
{
  postMessage({msgId: CanvasCommon.MSGID_ENABLE_CANVAS_BUFFER, msgData: null});
  return null;
}

function funcDisableCanvasBuffer(vm, args)
//
{
  postMessage({msgId: CanvasCommon.MSGID_DISABLE_CANVAS_BUFFER, msgData: null});
  return null;
}

function funcDrawCanvasBuffer(vm, args)
//
{
  postMessage({msgId: CanvasCommon.MSGID_DRAW_CANVAS_BUFFER, msgData: null});

  return null;
}

function funcDrawCanvasBufferClip(vm, args)
//
{
  var msgData = {
      clipX: args[0],
      clipY: args[1],
      clipWidth: args[2],
      clipHeight: args[3],
      drawX: args[4],
      drawY: args[5],
      drawWidth: (args.length >= 7) ? args[6] : args[2],
      drawHeight: (args.length == 8) ? args[7] : args[3]
  };

  postMessage({msgId: CanvasCommon.MSGID_DRAW_CANVAS_BUFFER_CLIP, msgData: msgData});

  return null;
}

function funcSetCanvasEvent(vm, args)
//
{
  var eventName = args[0];
  var eventIndex = canvasEvents.findIndex((event) => event.name == eventName);
  var eventUserFunc;

  if(eventIndex == -1)
    vm.runError("setCanvasEvent() does not recognize event named '" + eventName + "'.");

  if(args.length == 2)
  {
    eventUserFunc = args[1];

    if(!(eventUserFunc instanceof Objects.ObjUserFunc))
      vm.runError("Second argument of setCanvasEvent() must be a function.");

    if(eventUserFunc.paramCount != canvasEvents[eventIndex].paramCount)
      vm.runError("Handler function " + eventUserFunc.ident + "() for event '" + eventName + "' must have " + canvasEvents[eventIndex].paramCount + " parameters.");

    if(!canvasEvents[eventIndex].callback)
    {
      canvasEvents[eventIndex].callback = new VM.CallbackContext(vm, eventUserFunc);
    }
    else
    {
      canvasEvents[eventIndex].callback.vm = vm;
      canvasEvents[eventIndex].callback.userFunc = eventUserFunc;
    }

    postMessage({msgId: CanvasCommon.MSGID_ADD_CANVAS_EVENT, msgData: {eventName: eventName}});
  }
  else
  {
    canvasEvents[eventIndex].callback = null;
    postMessage({msgId: CanvasCommon.MSGID_REMOVE_CANVAS_EVENT, msgData: {eventName: eventName}});
  }

  return null;
}

function funcDrawText(vm, args)
//
{
  var msgData = {
      text: args[0],
      drawX: args[1],
      drawY: args[2],
      isFilled: (args.length == 4) ? args[3] : true
  };

  postMessage({msgId: CanvasCommon.MSGID_DRAW_TEXT, msgData: msgData});

  return null;
}

function funcDrawRect(vm, args)
//
{
  var msgData = {
      drawX: args[0],
      drawY: args[1],
      drawWidth: args[2],
      drawHeight: args[3],
      isFilled: (args.length == 5) ? args[4] : true
  };

  postMessage({msgId: CanvasCommon.MSGID_DRAW_RECT, msgData: msgData});

  return null;
}

function funcDrawCircle(vm, args)
//
{
  var msgData = {
      centerX: args[0],
      centerY: args[1],
      radius: args[2],
      isFilled: (args.length == 4) ? args[3] : true
  };

  postMessage({msgId: CanvasCommon.MSGID_DRAW_CIRCLE, msgData: msgData});

  return null;
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

  postMessage({msgId: CanvasCommon.MSGID_DRAW_LINE, msgData: msgData});

  return null;
}

function funcSetTextFont(vm, args)
//
{
  postMessage({msgId: CanvasCommon.MSGID_SET_TEXT_FONT, msgData: {font: args[0]}});
  return null;
}

function funcSetFillColor(vm, args)
//
{
  postMessage({msgId: CanvasCommon.MSGID_SET_FILL_COLOR, msgData: {color: args[0]}});
  return null;
}

function funcSetLineColor(vm, args)
//
{
  postMessage({msgId: CanvasCommon.MSGID_SET_LINE_COLOR, msgData: {color: args[0]}});
  return null;
}

function funcSetLineSize(vm, args)
//
{
  postMessage({msgId: CanvasCommon.MSGID_SET_LINE_SIZE, msgData: {size: args[0]}});
  return null;
}

function funcUpdateDeltaTime(vm, args)
//
{
  if(prevTime != 0)
    deltaTime = Math.min(((Date.now() - prevTime) / 1000), maxDeltaTime);

  prevTime = Date.now();

  return deltaTime;
}

function funcResetDeltaTime(vm, args)
//
{
  deltaTime = 0;
  prevTime = 0;

  return null;
}

function funcGetDeltaTime(vm, args)
//
{
  return deltaTime;
}

function funcSetMaxDeltaTime(vm, args)
//
{
  maxDeltaTime = args[0];
  return null;
}

function funcGetMaxDeltaTime(vm, args)
//
{
  return maxDeltaTime;
}

function funcGetTextDrawWidth(vm, args)
//
{
  sendContextRequest(vm, CanvasCommon.MSGID_GET_TEXT_DRAW_WIDTH_REQUEST, {text: args[0]});
  return undefined;
}

function funcGetTextDrawHeight(vm, args)
//
{
  sendContextRequest(vm, CanvasCommon.MSGID_GET_TEXT_DRAW_HEIGHT_REQUEST, {text: args[0]});
  return undefined;
}