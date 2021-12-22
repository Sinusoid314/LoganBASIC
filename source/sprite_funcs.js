class Sprite
{
  constructor(sheetName, x = 0, y = 0)
  {
    this.sheetName = sheetName;
    this.x = x;
    this.y = y;
  }
}

var spriteNativeFuncs = [
                  new ObjNativeFunc("loadspritesheet", 2, 2, funcLoadSpriteSheet),
                  new ObjNativeFunc("unloadspritesheet", 1, 1, funcUnloadSpriteSheet),
                  new ObjNativeFunc("drawsprites", 0, 0, funcDrawSprites),
                  new ObjNativeFunc("getspriteframewidth", 1, 1, funcGetSpriteFrameWidth),
                  new ObjNativeFunc("getspriteframeheight", 1, 1, funcGetSpriteFrameHeight)
                 ];

var spriteSheetResultCallback = null;

function onSpriteSheetRequestResult(result)
//
{
  if(result[0] != "")
    spriteSheetResultCallback.endRuntime(result[0]);
  else
  {
    spriteSheetResultCallback.runtime.stack[spriteSheetResultCallback.runtime.stack.length - 1] = result[1];
    spriteSheetResultCallback.runFunc();
  }
}

function sendSpriteSheetRequest(runtime, msgId, msgData)
//
{
  if(spriteSheetResultCallback == null)
    spriteSheetResultCallback = new CallbackContext(runtime);
  else
    spriteSheetResultCallback.runtime = runtime;

  postMessage({msgId: msgId, msgData: msgData});

  runtime.status = RUNTIME_STATUS_PAUSED;
}

function funcLoadSpriteSheet(runtime, args)
//
{
  var sheetName = args[0];
  var sheetSource = args[1];

  sendSpriteSheetRequest(runtime, MSGID_LOAD_SPRITE_SHEET_REQUEST, [sheetName, sheetSource]);

  return false;
}

function funcUnloadSpriteSheet(runtime, args)
//
{
  var sheetName = args[0];

  sendSpriteSheetRequest(runtime, MSGID_UNLOAD_SPRITE_SHEET_REQUEST, sheetName);

  return 0;
}

function funcDrawSprites(runtime, args)
//
{
  //sendSpriteSheetRequest(runtime, MSGID_DRAW_SPRITE_SHEET_FRAMES_REQUEST, );

  return 0;
}

function funcGetSpriteFrameWidth(runtime, args)
//
{
  var sheetName = args[0];

  sendSpriteSheetRequest(runtime, MSGID_GET_SPRITE_SHEET_FRAME_WIDTH_REQUEST, sheetName);

  return 0;
}

function funcGetSpriteFrameHeight(runtime, args)
//
{
  var sheetName = args[0];

  sendSpriteSheetRequest(runtime, MSGID_GET_SPRITE_SHEET_FRAME_HEIGHT_REQUEST, sheetName);

  return 0;
}

