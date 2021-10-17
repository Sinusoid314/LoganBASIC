var canvasNativeFuncList = [
                  new ObjNativeFunc("clearCanvas", 0, 0, funcClearCanvas),
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
  postMessage({msgId: MSGID_LOAD_CANVAS_IMAGE, msgData: imageSource});

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
  postMessage({msgId: MSGID_UNLOAD_CANVAS_IMAGE, msgData: imageNameIndex});

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

  postMessage({msgId: MSGID_DRAW_CANVAS_IMAGE, msgData: [imageNameIndex, drawLeft, drawTop]});

  return 0;
}

