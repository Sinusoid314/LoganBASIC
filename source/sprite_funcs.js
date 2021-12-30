class Sprite
{
  constructor(sheetName, x, y)
  {
    this.sheetName = sheetName;
    this.frameCount = 0;
    this.x = x;
    this.y = y;
    this.drawWidth = 0;
    this.drawHeight = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isVisible = true;
    this.isPlaying = true;
    this.updatesPerFrame = 1;
    this.firstFrameIndex = 0;
    this.lastFrameIndex = 0;
    this.currFrameIndex = 0;
    this.maxCycles = 0;

    this.frameUpdateCount = 0;
    this.currCycle = 0;
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
                  new ObjNativeFunc("updatesprites", 1, 1, funcUpdateSprites),
                  new ObjNativeFunc("getspriteframecount", 1, 1, funcGetSpriteFrameCount),
                  new ObjNativeFunc("getspritex", 1, 1, funcGetSpriteX),
                  new ObjNativeFunc("setspritex", 2, 2, funcSetSpriteX),
                  new ObjNativeFunc("getspritey", 1, 1, funcGetSpriteY),
                  new ObjNativeFunc("setspritey", 2, 2, funcSetSpriteY),
                  new ObjNativeFunc("getspritedrawwidth", 1, 1, funcGetSpriteDrawWidth),
                  new ObjNativeFunc("setspritedrawwidth", 2, 2, funcSetSpriteDrawWidth),
                  new ObjNativeFunc("getspritedrawheight", 1, 1, funcGetSpriteDrawHeight),
                  new ObjNativeFunc("setspritedrawheight", 2, 2, funcSetSpriteDrawHeight),
                  new ObjNativeFunc("getspritevelocityx", 1, 1, funcGetSpriteVelocityX),
                  new ObjNativeFunc("setspritevelocityx", 2, 2, funcSetSpriteVelocityX),
                  new ObjNativeFunc("getspritevelocityy", 1, 1, funcGetSpriteVelocityY),
                  new ObjNativeFunc("setspritevelocityy", 2, 2, funcSetSpriteVelocityY),
                  new ObjNativeFunc("getspritevisible", 1, 1, funcGetSpriteVisible),
                  new ObjNativeFunc("setspritevisible", 2, 2, funcSetSpriteVisible),
                  new ObjNativeFunc("getspriteplaying", 1, 1, funcGetSpritePlaying),
                  new ObjNativeFunc("setspriteplaying", 2, 2, funcSetSpritePlaying),
                  new ObjNativeFunc("getspriteframerate", 1, 1, funcGetSpriteFrameRate),
                  new ObjNativeFunc("setspriteframerate", 2, 2, funcSetSpriteFrameRate),
                  new ObjNativeFunc("setspriteframerange", 3, 3, funcSetSpriteFrameRange),
                  new ObjNativeFunc("getspriteframe", 1, 1, funcGetSpriteFrame),
                  new ObjNativeFunc("setspriteframe", 2, 2, funcSetSpriteFrame),
                  new ObjNativeFunc("getspritecycles", 1, 1, funcGetSpriteCycles),
                  new ObjNativeFunc("setspritecycles", 2, 2, funcSetSpriteCycles)
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
    sprite.drawWidth = result[2];
    sprite.drawHeight = result[3];
    sprite.frameCount = result[4];
    sprite.lastFrameIndex = sprite.frameCount - 1;

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
  var columnCount = args[2];
  var rowCount = args[3];

  sendSpriteSheetRequest(runtime, MSGID_LOAD_SPRITE_SHEET_REQUEST, [sheetName, sheetSource, columnCount, rowCount]);

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
    if(sprite.isVisible)
      drawData.push([sprite.sheetName, sprite.currFrameIndex, sprite.x, sprite.y, sprite.drawWidth, sprite.drawHeight]);
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

    if(sprite.isPlaying)
    {
      sprite.frameUpdateCount++;

      if(sprite.frameUpdateCount >= sprite.updatesPerFrame)
      {
        sprite.frameUpdateCount = 0;
        sprite.currFrameIndex++;

        if(sprite.currFrameIndex > sprite.lastFrameIndex)
        {
	      sprite.currFrameIndex = sprite.firstFrameIndex;

          if(sprite.maxCycles > 0)
          {
            sprite.currCycle++;

            if(sprite.currCycle >= sprite.maxCycles)
            {
              sprite.currCycle = 0;
              sprite.isPlaying = false;
            }
          }
        }
      }
    }
  }

  return 0;
}

function funcGetSpriteFrameCount(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).frameCount;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpriteX(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).x;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteX(runtime, args)
//
{
  var spriteName = args[0];
  var x = args[1];

  if(sprites.has(spriteName))
  {
    sprites.get(spriteName).x = x;
    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpriteY(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).y;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteY(runtime, args)
//
{
  var spriteName = args[0];
  var y = args[1];

  if(sprites.has(spriteName))
  {
    sprites.get(spriteName).y = y;
    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpriteDrawWidth(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).drawWidth;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteDrawWidth(runtime, args)
//
{
  var spriteName = args[0];
  var drawWidth = args[1];

  if(sprites.has(spriteName))
  {
    sprites.get(spriteName).drawWidth = drawWidth;
    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpriteDrawHeight(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).drawHeight;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteDrawHeight(runtime, args)
//
{
  var spriteName = args[0];
  var drawHeight = args[1];

  if(sprites.has(spriteName))
  {
    sprites.get(spriteName).drawHeight = drawHeight;
    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpriteVelocityX(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).velocityX;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteVelocityX(runtime, args)
//
{
  var spriteName = args[0];
  var velocityX = args[1];

  if(sprites.has(spriteName))
  {
    sprites.get(spriteName).velocityX = velocityX;
    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpriteVelocityY(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).velocityY;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteVelocityY(runtime, args)
//
{
  var spriteName = args[0];
  var velocityY = args[1];

  if(sprites.has(spriteName))
  {
    sprites.get(spriteName).velocityY = velocityY;
    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpriteVisible(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).isVisible;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteVisible(runtime, args)
//
{
  var spriteName = args[0];
  var isVisible = args[1];

  if(sprites.has(spriteName))
  {
    sprites.get(spriteName).isVisible = isVisible;
    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpritePlaying(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).isPlaying;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpritePlaying(runtime, args)
//
{
  var spriteName = args[0];
  var isPlaying = args[1];

  if(sprites.has(spriteName))
  {
    sprites.get(spriteName).isPlaying = isPlaying;
    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpriteFrameRate(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).updatesPerFrame;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteFrameRate(runtime, args)
//
{
  var spriteName = args[0];
  var frameRate = args[1];

  if(sprites.has(spriteName))
  {
    sprites.get(spriteName).updatesPerFrame = frameRate;
    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteFrameRange(runtime, args)
//
{
  var sprite;
  var spriteName = args[0];
  var firstFrameIndex = args[1];
  var lastFrameIndex = args[2];

  if(sprites.has(spriteName))
  {
    sprite = sprites.get(spriteName);

    firstFrameIndex = Math.max(0, Math.min(firstFrameIndex, sprite.frameCount - 1));
    lastFrameIndex = Math.max(0, Math.min(lastFrameIndex, sprite.frameCount - 1));

    sprite.firstFrameIndex = Math.min(firstFrameIndex, lastFrameIndex);
    sprite.lastFrameIndex = Math.max(firstFrameIndex, lastFrameIndex);
    sprite.currFrameIndex = sprite.firstFrameIndex;

    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpriteFrame(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
    return sprites.get(spriteName).currFrameIndex;
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteFrame(runtime, args)
//
{
  var sprite;
  var spriteName = args[0];
  var frameIndex = args[1];

  if(sprites.has(spriteName))
  {
    sprite = sprites.get(spriteName);
    sprite.currFrameIndex = Math.max(sprite.firstFrameIndex, Math.min(frameIndex, sprite.lastFrameIndex));;

    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcGetSpriteCycles(runtime, args)
//
{
  var spriteName = args[0];

  if(sprites.has(spriteName))
  {
    return sprites.get(spriteName).maxCycles;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

function funcSetSpriteCycles(runtime, args)
//
{
  var spriteName = args[0];
  var cycles = args[1];

  if(sprites.has(spriteName))
  {
    if(cycles < 0)
      cycles = 0;

    sprites.get(spriteName).maxCycles = cycles;
    return 0;
  }
  else
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");
}

