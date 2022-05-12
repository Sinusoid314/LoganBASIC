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
    this.scroll = true;

    this.frameUpdateCount = 0;
    this.currCycle = 0;
  }
}

const spriteNativeFuncs = [
                  new ObjNativeFunc("loadspritesheet", 4, 4, funcLoadSpriteSheet),
                  new ObjNativeFunc("unloadspritesheet", 1, 1, funcUnloadSpriteSheet),
                  new ObjNativeFunc("drawsprites", 0, 0, funcDrawSprites),
                  new ObjNativeFunc("getspriteframewidth", 1, 1, funcGetSpriteFrameWidth),
                  new ObjNativeFunc("getspriteframeheight", 1, 1, funcGetSpriteFrameHeight),
                  new ObjNativeFunc("addsprite", 4, 4, funcAddSprite),
                  new ObjNativeFunc("removesprite", 1, 1, funcRemoveSprite),
                  new ObjNativeFunc("setspritesheet", 2, 2, funcSetSpriteSheet),
                  new ObjNativeFunc("updatesprites", 0, 1, funcUpdateSprites),
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
                  new ObjNativeFunc("setspritecycles", 2, 2, funcSetSpriteCycles),
                  new ObjNativeFunc("spritesoverlap", 2, 2, funcSpritesOverlap),
                  new ObjNativeFunc("pointinsprite", 3, 3, funcPointInSprite),
                  new ObjNativeFunc("spriteoverlapsrect", 5, 5, funcSpriteOverlapsRect),
                  new ObjNativeFunc("spriteoverlapscircle", 4, 4, funcSpriteOverlapsCircle),
                  new ObjNativeFunc("getscrollx", 0, 0, funcGetScrollX),
                  new ObjNativeFunc("setscrollx", 1, 1, funcSetScrollX),
                  new ObjNativeFunc("getscrolly", 0, 0, funcGetScrollY),
                  new ObjNativeFunc("setscrolly", 1, 1, funcSetScrollY),
                  new ObjNativeFunc("shiftscrollx", 1, 1, funcShiftScrollX),
                  new ObjNativeFunc("shiftscrolly", 1, 1, funcShiftScrollY),
                  new ObjNativeFunc("getspritescroll", 1, 1, funcGetSpriteScroll),
                  new ObjNativeFunc("setspritescroll", 2, 2, funcSetSpriteScroll),
                  new ObjNativeFunc("spritetoback", 1, 1, funcSpriteToBack),
                  new ObjNativeFunc("spritetofront", 1, 1, funcSpriteToFront)
                 ];

var sprites = new Map();
var zOrderedSprites = [];
var scrollX = 0;
var scrollY = 0;
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
  var drawX, drawY;

  for(const sprite of zOrderedSprites)
  {
    drawX = sprite.x - (sprite.scroll ? scrollX : 0);
    drawY = sprite.y - (sprite.scroll ? scrollY : 0);

    if(sprite.isVisible)
      drawData.push([sprite.sheetName, sprite.currFrameIndex, drawX, drawY, sprite.drawWidth, sprite.drawHeight]);
  }

  sendSpriteSheetRequest(runtime, MSGID_DRAW_SPRITE_SHEET_FRAMES_REQUEST, drawData);

  return 0;
}

function funcGetSpriteFrameWidth(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sendSpriteSheetRequest(runtime, MSGID_GET_SPRITE_SHEET_FRAME_WIDTH_REQUEST, sprites.get(spriteName).sheetName);

  return 0;
}

function funcGetSpriteFrameHeight(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sendSpriteSheetRequest(runtime, MSGID_GET_SPRITE_SHEET_FRAME_HEIGHT_REQUEST, sprites.get(spriteName).sheetName);

  return 0;
}

function funcAddSprite(runtime, args)
//
{
  var spriteName = args[0];
  var sheetName = args[1];
  var x = args[2];
  var y = args[3];
  var sprite;

  if(sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' already exists.");

  sprite = new Sprite(sheetName, x, y);
  sprites.set(spriteName, sprite);
  zOrderedSprites.push(sprite);

  sendSpriteSheetRequest(runtime, MSGID_SPRITE_SHEET_REF_REQUEST, [sheetName, spriteName]);

  return 0;
}

function funcRemoveSprite(runtime, args)
//
{
  var spriteName = args[0];
  var sprite;
  var spriteIndex;

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);
  spriteIndex = zOrderedSprites.indexOf(sprite);

  zOrderedSprites.splice(spriteIndex, 1)
  sprites.delete(spriteName);

  return 0;
}

function funcSetSpriteSheet(runtime, args)
//
{
  var spriteName = args[0];
  var sheetName = args[1];
  var sprite;

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);

  sprite.sheetName = sheetName;
  sprite.firstFrameIndex = 0;
  sprite.currFrameIndex = 0;

  sendSpriteSheetRequest(runtime, MSGID_SPRITE_SHEET_REF_REQUEST, [sheetName, spriteName]);

  return 0;
}

function funcUpdateSprites(runtime, args)
//
{
  var deltaTime = 0;

  if(args.length == 1)
    deltaTime = args[0];

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

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).frameCount;
}

function funcGetSpriteX(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).x;
}

function funcSetSpriteX(runtime, args)
//
{
  var spriteName = args[0];
  var x = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).x = x;

  return 0;
}

function funcGetSpriteY(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).y;
}

function funcSetSpriteY(runtime, args)
//
{
  var spriteName = args[0];
  var y = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).y = y;

  return 0;
}

function funcGetSpriteDrawWidth(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).drawWidth;
}

function funcSetSpriteDrawWidth(runtime, args)
//
{
  var spriteName = args[0];
  var drawWidth = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).drawWidth = drawWidth;

  return 0;
}

function funcGetSpriteDrawHeight(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).drawHeight;
}

function funcSetSpriteDrawHeight(runtime, args)
//
{
  var spriteName = args[0];
  var drawHeight = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).drawHeight = drawHeight;

  return 0;
}

function funcGetSpriteVelocityX(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).velocityX;
}

function funcSetSpriteVelocityX(runtime, args)
//
{
  var spriteName = args[0];
  var velocityX = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).velocityX = velocityX;

  return 0;
}

function funcGetSpriteVelocityY(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).velocityY;
}

function funcSetSpriteVelocityY(runtime, args)
//
{
  var spriteName = args[0];
  var velocityY = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).velocityY = velocityY;

  return 0;
}

function funcGetSpriteVisible(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).isVisible;
}

function funcSetSpriteVisible(runtime, args)
//
{
  var spriteName = args[0];
  var isVisible = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).isVisible = isVisible;

  return 0;
}

function funcGetSpritePlaying(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).isPlaying;
}

function funcSetSpritePlaying(runtime, args)
//
{
  var spriteName = args[0];
  var isPlaying = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).isPlaying = isPlaying;

  return 0;
}

function funcGetSpriteFrameRate(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).updatesPerFrame;
}

function funcSetSpriteFrameRate(runtime, args)
//
{
  var spriteName = args[0];
  var frameRate = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).updatesPerFrame = frameRate;

  return 0;
}

function funcSetSpriteFrameRange(runtime, args)
//
{
  var spriteName = args[0];
  var firstFrameIndex = args[1];
  var lastFrameIndex = args[2];
  var sprite;

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);

  firstFrameIndex = Math.max(0, Math.min(firstFrameIndex, sprite.frameCount - 1));
  lastFrameIndex = Math.max(0, Math.min(lastFrameIndex, sprite.frameCount - 1));

  sprite.firstFrameIndex = Math.min(firstFrameIndex, lastFrameIndex);
  sprite.lastFrameIndex = Math.max(firstFrameIndex, lastFrameIndex);
  sprite.currFrameIndex = sprite.firstFrameIndex;

  return 0;
}

function funcGetSpriteFrame(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).currFrameIndex;
}

function funcSetSpriteFrame(runtime, args)
//
{
  var spriteName = args[0];
  var frameIndex = args[1];
  var sprite;

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);
  sprite.currFrameIndex = Math.max(sprite.firstFrameIndex, Math.min(frameIndex, sprite.lastFrameIndex));;

  return 0;
}

function funcGetSpriteCycles(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).maxCycles;
}

function funcSetSpriteCycles(runtime, args)
//
{
  var spriteName = args[0];
  var cycles = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  if(cycles < 0)
    cycles = 0;

  sprites.get(spriteName).maxCycles = cycles;

  return 0;
}

function funcSpritesOverlap(runtime, args)
//
{
  var spriteName1 = args[0];
  var spriteName2 = args[1];
  var sprite1, sprite2;

  if(!sprites.has(spriteName1))
    runtime.endWithError("Sprite '" + spriteName1 + "' does not exist.");

  if(!sprites.has(spriteName2))
    runtime.endWithError("Sprite '" + spriteName2 + "' does not exist.");

  sprite1 = sprites.get(spriteName1);
  sprite2 = sprites.get(spriteName2);

  if(((sprite1.x + sprite1.drawWidth) <= sprite2.x) || (sprite1.x >= (sprite2.x + sprite2.drawWidth)))
    return false;

  if(((sprite1.y + sprite1.drawHeight) <= sprite2.y) || (sprite1.y >= (sprite2.y + sprite2.drawHeight)))
    return false;

  return true;
}

function funcPointInSprite(runtime, args)
//
{
  var spriteName = args[0];
  var pointX = args[1];
  var pointY = args[2];
  var sprite;

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);

  if((pointX <= sprite.x) || (pointX >= (sprite.x + sprite.drawWidth)))
    return false;

  if((pointY <= sprite.y) || (pointY >= (sprite.y + sprite.drawHeight)))
    return false;

  return true;
}

function funcSpriteOverlapsRect(runtime, args)
//
{
  var spriteName = args[0];
  var rectX = args[1];
  var rectY = args[2];
  var rectWidth = args[3];
  var rectHeight = args[4];
  var sprite;

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);

  if(((sprite.x + sprite.drawWidth) <= rectX) || (sprite.x >= (rectX + rectWidth)))
    return false;

  if(((sprite.y + sprite.drawHeight) <= rectY) || (sprite.y >= (rectY + rectHeight)))
    return false;

  return true;
}

function funcSpriteOverlapsCircle(runtime, args)
//
{
  var spriteName = args[0];
  var circleX = args[1];
  var circleY = args[2];
  var circleRadius = args[3];
  var sprite;
  var closestX, closestY, distance;

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);

  closestX = Math.max(sprite.x, Math.min(circleX, sprite.x + sprite.drawWidth));
  closestY = Math.max(sprite.y, Math.min(circleY, sprite.y + sprite.drawHeight));
  distance = ((circleX - closestX) ^ 2) + ((circleY - closestY) ^ 2);

  return distance < (circleRadius ^ 2);
}

function funcGetScrollX(runtime, args)
//
{
  return scrollX;
}

function funcSetScrollX(runtime, args)
//
{
  scrollX = args[0];
  return 0;
}

function funcGetScrollY(runtime, args)
//
{
  return scrollY;
}

function funcSetScrollY(runtime, args)
//
{
  scrollY = args[0];
  return 0;
}

function funcShiftScrollX(runtime, args)
//
{
  scrollX += args[0];
  return 0;
}

function funcShiftScrollY(runtime, args)
//
{
  scrollY += args[0];
  return 0;
}

function funcGetSpriteScroll(runtime, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).scroll;
}

function funcSetSpriteScroll(runtime, args)
//
{
  var spriteName = args[0];
  var scroll = args[1];

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).scroll = scroll;

  return 0;
}

function funcSpriteToBack(runtime, args)
//Bring the given sprite to the bottom of the z-order
{
  var spriteName = args[0];
  var sprite;
  var spriteIndex;

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);
  spriteIndex = zOrderedSprites.indexOf(sprite);

  zOrderedSprites.unshift(zOrderedSprites.splice(spriteIndex, 1)[0]);

  return 0;
}

function funcSpriteToFront(runtime, args)
//Bring the given sprite to the top of the z-order
{
  var spriteName = args[0];
  var sprite;
  var spriteIndex;

  if(!sprites.has(spriteName))
    runtime.endWithError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);
  spriteIndex = zOrderedSprites.indexOf(sprite);

  zOrderedSprites.push(zOrderedSprites.splice(spriteIndex, 1)[0]);

  return 0;
}

