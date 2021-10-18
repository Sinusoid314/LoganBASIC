var canvasNativeFuncList = [
                  new ObjNativeFunc("clearcanvas", 0, 0, funcClearCanvas),
                  new ObjNativeFunc("setcanvaswidth", 1, 1, funcSetCanvasWidth),
                  new ObjNativeFunc("setcanvasheight", 1, 1, funcSetCanvasHeight),
                  new ObjNativeFunc("loadimage", 2, 2, funcLoadImage),
                  new ObjNativeFunc("unloadimage", 1, 1, funcUnloadImage),
                  new ObjNativeFunc("drawimage", 3, 3, funcDrawImage)
                 ];

var canvasImageNames = [];

function getCanvasImageIndex(imageName)
//Return the index of the given image item
{
  imageName = imageName.toLowerCase();

  for(var imageIndex = 0; imageIndex < canvasImageNames.length; imageIndex++)
  {
    if(canvasImageNames[imageIndex].id.toLowerCase() == imageName)
      return imageIndex;
  }

  return -1;
}

function funcClearCanvas(runtime, args)
//Send a message to the canvas to clear it
{
  postMessage({msgId: MSGID_CANVAS_MSG, msgData: [CANVAS_MSG_CLEAR_CANVAS]});

  return 0;
}

function funcSetCanvasWidth(runtime, args)
//
{
  var newWidth = args[0];

  postMessage({msgId: MSGID_CANVAS_MSG, msgData: [CANVAS_MSG_SET_CANVAS_WIDTH, newWidth]});

  return 0;
}

function funcSetCanvasHeight(runtime, args)
//
{
  var newHeight = args[0];

  postMessage({msgId: MSGID_CANVAS_MSG, msgData: [CANVAS_MSG_SET_CANVAS_HEIGHT, newHeight]});

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
  postMessage({msgId: MSGID_CANVAS_MSG, msgData: [CANVAS_MSG_LOAD_IMAGE, imageSource]});

  return 0;
}

function funcUnloadImage(runtime, args)
//Send a message to the canvas to unload an image
{
  var imageName = args[0];
  var imageNameIndex = canvasImageNames.indexOf(imageName);

  if(imageNameIndex == -1)
    runtime.raiseError("Image '" + imageName + "' does not exist.");

  canvasImageNames.splice(imageNameIndex, 1);
  postMessage({msgId: MSGID_CANVAS_MSG, msgData: [CANVAS_MSG_UNLOAD_IMAGE, imageNameIndex]});

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

  postMessage({msgId: MSGID_CANVAS_MSG, msgData: [CANVAS_MSG_DRAW_IMAGE, imageNameIndex, drawLeft, drawTop]});

  return 0;
}

