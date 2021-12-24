class Sprite
{
  constructor(sheetName, x, y)
  {
    this.sheetName = sheetName;
    this.x = x;
    this.y = y;
    this.frameWidth = 0;
    this.frameHeight = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.velocityX = 0;
    this.velocityY = 0;

    this.frameCount = 0;
    this.updatesPerFrame = 0;
    this.frameUpdateCount = 0;
    this.currFrameIndex = 0;
  }
}

var spriteNativeFuncs = [
                  new ObjNativeFunc("loadspritesheet", 2, 2, funcLoadSpriteSheet),
                  new ObjNativeFunc("unloadspritesheet", 1, 1, funcUnloadSpriteSheet),
                  new ObjNativeFunc("drawsprites", 0, 0, funcDrawSprites),
                  new ObjNativeFunc("getspriteframewidth", 1, 1, funcGetSpriteFrameWidth),
                  new ObjNativeFunc("getspriteframeheight", 1, 1, funcGetSpriteFrameHeight),
                  new ObjNativeFunc("addsprite", 4, 4, funcAddSprite),
                  new ObjNativeFunc("removesprite", 1, 1, funcRemoveSprite),
                  new ObjNativeFunc("updatesprites", 1, 1, funcUpdateSprites)
                 ];

var sprites = new Map();
var spriteSheetResultCallback = null;

function onSpriteSheetRefRequestResult(result)
//
{
  var sprite;

  if(result[0] != "")
    spriteSheetResultCallback.endRuntime(result[0]);
  else
  {
    sprite = sprites.get(result[1]);
    sprite.frameWidth = result[2];
    sprite.frameHeight = result[3];
    sprite.frameCount = result[4];

    spriteSheetResultCallback.runtime.stack[spriteSheetResultCallback.runtime.stack.length - 1] = result[1];
    spriteSheetResultCallback.runFunc();
  }
}

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
  var drawData = [];

  for(const [spriteName, sprite] of sprites)
  {
    drawData.push([sprite.sheetName, sprite.currFrameIndex, sprite.x, sprite.y, sprite.scaleX, sprite.scaleY]);
  }

  sendSpriteSheetRequest(runtime, MSGID_DRAW_SPRITE_SHEET_FRAMES_REQUEST, drawData);

  return 0;
}

function funcGetSpriteFrameWidth(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    sendSpriteSheetRequest(runtime, MSGID_GET_SPRITE_SHEET_FRAME_WIDTH_REQUEST, sprites.get(spriteName).sheetName);
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return 0;
}

function funcGetSpriteFrameHeight(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    sendSpriteSheetRequest(runtime, MSGID_GET_SPRITE_SHEET_FRAME_HEIGHT_REQUEST, sprites.get(spriteName).sheetName);
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return 0;
}

function funcAddSprite(runtime, args)
//
{
  var spriteName = args[0];
  var sheetName = args[1];
  var x = args[2];
  var y = args[3];

  if(!sprites.has(spriteName))
  {
    sprites.set(spriteName, new Sprite(sheetName, x, y));
    postMessage({msgId: MSGID_SPRITE_SHEET_REF_REQUEST, msgData: [sheetName, spriteName]});
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' already exists.");

  return 0;
}

function funcRemoveSprite(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    sprites.delete(spriteName);
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return 0;
}

function funcUpdateSprites(runtime, args)
//
{
  var deltaTime = args[0];

  for(const [spriteName, sprite] of sprites)
  {
	sprite.x += (sprite.velocityX * deltaTime);
	sprite.y += (sprite.velocityY * deltaTime);

	sprite.frameUpdateCount++;

    if(sprite.frameUpdateCount == sprite.updatesPerFrame)
    {
      sprite.currFrameIndex = (sprite.currFrameIndex + 1) % sprite.frameCount;
	  sprite.frameUpdateCount = 0;
    }
  }

  return 0;
}

