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
    this.prevX = x;
    this.prevY = y;
    this.hitBoxOffsetX = 0;
    this.hitBoxOffsetY = 0;
    this.hitBoxWidth = 0;
    this.hitBoxHeight = 0;
    this.isVisible = true;
    this.isPlaying = true;
    this.secondsPerFrame = 0.2;
    this.firstFrameIndex = 0;
    this.lastFrameIndex = 0;
    this.currFrameIndex = 0;
    this.maxCycles = 0;
    this.scroll = true;

    this.frameSecondCount = 0;
    this.currCycle = 0;
  }
}

class SpriteContact
{
  constructor()
  {
    this.time = 0;
    this.normalX = 0;
    this.normalY = 0;
  }
}

const spriteNativeFuncs = [
                  new ObjNativeFunc("loadSpriteSheet", 4, 4, funcLoadSpriteSheet),
                  new ObjNativeFunc("unloadSpriteSheet", 1, 1, funcUnloadSpriteSheet),
                  new ObjNativeFunc("drawSprites", 0, 0, funcDrawSprites),
                  new ObjNativeFunc("getSpriteFrameWidth", 1, 1, funcGetSpriteFrameWidth),
                  new ObjNativeFunc("getSpriteFrameHeight", 1, 1, funcGetSpriteFrameHeight),
                  new ObjNativeFunc("addSprite", 4, 4, funcAddSprite),
                  new ObjNativeFunc("removeSprite", 1, 1, funcRemoveSprite),
                  new ObjNativeFunc("setSpriteSheet", 2, 2, funcSetSpriteSheet),
                  new ObjNativeFunc("updateSprites", 0, 1, funcUpdateSprites),
                  new ObjNativeFunc("getSpriteFrameCount", 1, 1, funcGetSpriteFrameCount),
                  new ObjNativeFunc("getSpriteX", 1, 1, funcGetSpriteX),
                  new ObjNativeFunc("setSpriteX", 2, 2, funcSetSpriteX),
                  new ObjNativeFunc("getSpriteY", 1, 1, funcGetSpriteY),
                  new ObjNativeFunc("setSpriteY", 2, 2, funcSetSpriteY),
                  new ObjNativeFunc("getSpriteDrawWidth", 1, 1, funcGetSpriteDrawWidth),
                  new ObjNativeFunc("setSpriteDrawWidth", 2, 2, funcSetSpriteDrawWidth),
                  new ObjNativeFunc("getSpriteDrawHeight", 1, 1, funcGetSpriteDrawHeight),
                  new ObjNativeFunc("setSpriteDrawHeight", 2, 2, funcSetSpriteDrawHeight),
                  new ObjNativeFunc("getSpriteVelocityX", 1, 1, funcGetSpriteVelocityX),
                  new ObjNativeFunc("setSpriteVelocityX", 2, 2, funcSetSpriteVelocityX),
                  new ObjNativeFunc("getSpriteVelocityY", 1, 1, funcGetSpriteVelocityY),
                  new ObjNativeFunc("setSpriteVelocityY", 2, 2, funcSetSpriteVelocityY),
                  new ObjNativeFunc("getSpriteVisible", 1, 1, funcGetSpriteVisible),
                  new ObjNativeFunc("setSpriteVisible", 2, 2, funcSetSpriteVisible),
                  new ObjNativeFunc("getSpritePlaying", 1, 1, funcGetSpritePlaying),
                  new ObjNativeFunc("setSpritePlaying", 2, 2, funcSetSpritePlaying),
                  new ObjNativeFunc("getSpriteFrameRate", 1, 1, funcGetSpriteFrameRate),
                  new ObjNativeFunc("setSpriteFrameRate", 2, 2, funcSetSpriteFrameRate),
                  new ObjNativeFunc("setSpriteFrameRange", 3, 3, funcSetSpriteFrameRange),
                  new ObjNativeFunc("getSpriteFrame", 1, 1, funcGetSpriteFrame),
                  new ObjNativeFunc("setSpriteFrame", 2, 2, funcSetSpriteFrame),
                  new ObjNativeFunc("getSpriteCycles", 1, 1, funcGetSpriteCycles),
                  new ObjNativeFunc("setSpriteCycles", 2, 2, funcSetSpriteCycles),
                  new ObjNativeFunc("spritesOverlap", 2, 2, funcSpritesOverlap),
                  new ObjNativeFunc("pointInSprite", 3, 3, funcPointInSprite),
                  new ObjNativeFunc("spriteOverlapsRect", 5, 5, funcSpriteOverlapsRect),
                  new ObjNativeFunc("spriteOverlapsCircle", 4, 4, funcSpriteOverlapsCircle),
                  new ObjNativeFunc("getScrollX", 0, 0, funcGetScrollX),
                  new ObjNativeFunc("setScrollX", 1, 1, funcSetScrollX),
                  new ObjNativeFunc("getScrollY", 0, 0, funcGetScrollY),
                  new ObjNativeFunc("setScrollY", 1, 1, funcSetScrollY),
                  new ObjNativeFunc("shiftScrollX", 1, 1, funcShiftScrollX),
                  new ObjNativeFunc("shiftScrollY", 1, 1, funcShiftScrollY),
                  new ObjNativeFunc("getSpriteScroll", 1, 1, funcGetSpriteScroll),
                  new ObjNativeFunc("setSpriteScroll", 2, 2, funcSetSpriteScroll),
                  new ObjNativeFunc("spriteToBack", 1, 1, funcSpriteToBack),
                  new ObjNativeFunc("spriteToFront", 1, 1, funcSpriteToFront),
                  new ObjNativeFunc("getSpriteHitBoxOffsetX", 1, 1, funcGetSpriteHitBoxOffsetX),
                  new ObjNativeFunc("setSpriteHitBoxOffsetX", 2, 2, funcSetSpriteHitBoxOffsetX),
                  new ObjNativeFunc("getSpriteHitBoxOffsetY", 1, 1, funcGetSpriteHitBoxOffsetY),
                  new ObjNativeFunc("setSpriteHitBoxOffsetY", 2, 2, funcSetSpriteHitBoxOffsetY),
                  new ObjNativeFunc("getSpriteHitBoxWidth", 1, 1, funcGetSpriteHitBoxWidth),
                  new ObjNativeFunc("setSpriteHitBoxWidth", 2, 2, funcSetSpriteHitBoxWidth),
                  new ObjNativeFunc("getSpriteHitBoxHeight", 1, 1, funcGetSpriteHitBoxHeight),
                  new ObjNativeFunc("setSpriteHitBoxHeight", 2, 2, funcSetSpriteHitBoxHeight),
                  new ObjNativeFunc("spritesCollided", 3, 4, funcSpritesCollided),
                  new ObjNativeFunc("resolveSpriteCollision", 3, 3, funcResolveSpriteCollision),
                  new ObjNativeFunc("resolveSpriteCollisionX", 3, 3, funcResolveSpriteCollisionX),
                  new ObjNativeFunc("resolveSpriteCollisionY", 3, 3, funcResolveSpriteCollisionY)
                 ];

var sprites = new Map();
var zOrderedSprites = [];
var scrollX = 0;
var scrollY = 0;
var spriteSheetResultCallback = null;
var prevUpdateDeltaTime = 0;

mainVM.addNativeFuncArray(spriteNativeFuncs);

setSpriteWorkerEvents();


function spritesCollided(testSprite, referenceSprite, deltaTime, contact)
//
{
  var rayOriginX, rayOriginY, rayDirX, rayDirY;
  var rectX, rectY, rectWidth, rectHeight;
  var relativeVelocityX = testSprite.velocityX - referenceSprite.velocityX;
  var relativeVelocityY = testSprite.velocityY - referenceSprite.velocityY;

  if((relativeVelocityX == 0) && (relativeVelocityY == 0))
    return false;

  rayOriginX = (testSprite.prevX + testSprite.hitBoxOffsetX) + (testSprite.hitBoxWidth / 2);
  rayOriginY = (testSprite.prevY + testSprite.hitBoxOffsetY) + (testSprite.hitBoxHeight / 2);
  rayDirX = relativeVelocityX * deltaTime;
  rayDirY = relativeVelocityY * deltaTime;

  rectX = (referenceSprite.prevX + referenceSprite.hitBoxOffsetX) - (testSprite.hitBoxWidth / 2);
  rectY = (referenceSprite.prevY + referenceSprite.hitBoxOffsetY) - (testSprite.hitBoxHeight / 2);
  rectWidth = referenceSprite.hitBoxWidth + testSprite.hitBoxWidth;
  rectHeight = referenceSprite.hitBoxHeight + testSprite.hitBoxHeight;
  
  return rayIntersectsRect(rayOriginX, rayOriginY, rayDirX, rayDirY, rectX, rectY, rectWidth, rectHeight, contact);
}

function rayIntersectsRect(rayOriginX, rayOriginY, rayDirX, rayDirY, rectX, rectY, rectWidth, rectHeight, contact)
{
  const timeEpsilon = 0.001;
  var invRayDirX, invRayDirY;
  var leftTime, rightTime, topTime, bottomTime;
  var nearTimeX, farTimeX, nearTimeY, farTimeY;
  var entryTime, exitTime;

  invRayDirX = 1 / rayDirX;
  invRayDirY = 1 / rayDirY;

  leftTime = (rectX - rayOriginX) * invRayDirX;
  if(Math.abs(leftTime) < timeEpsilon) leftTime = 0;

  rightTime = (rectX + rectWidth - rayOriginX) * invRayDirX;
  if(Math.abs(rightTime) < timeEpsilon) rightTime = 0;

  topTime = (rectY - rayOriginY) * invRayDirY;
  if(Math.abs(topTime) < timeEpsilon) topTime = 0;

  bottomTime = (rectY + rectHeight - rayOriginY) * invRayDirY;
  if(Math.abs(bottomTime) < timeEpsilon) bottomTime = 0;

  if(Number.isNaN(leftTime) || Number.isNaN(rightTime) || Number.isNaN(topTime) || Number.isNaN(bottomTime))
    return false;

  nearTimeX = Math.min(leftTime, rightTime);
  farTimeX = Math.max(leftTime, rightTime);
  nearTimeY = Math.min(topTime, bottomTime);
  farTimeY = Math.max(topTime, bottomTime);
 
  if((nearTimeX > farTimeY) || (nearTimeY > farTimeX))
    return false;

  entryTime = Math.max(nearTimeX, nearTimeY);
  exitTime = Math.min(farTimeX, farTimeY);

  if(exitTime < 0)
    return false;

  if(!((entryTime >= 0) && (entryTime < 1)))
    return false;

  if(!(contact instanceof SpriteContact))
    return true;

  contact.time = entryTime;

  if(entryTime == topTime)
    contact.normalY = -1;
  else if(entryTime == bottomTime)
    contact.normalY = 1;
  else
    contact.normalY = 0;

  if(entryTime == leftTime)
    contact.normalX = -1;
  else if(entryTime == rightTime)
    contact.normalX = 1;
  else
    contact.normalX = 0;

  return true;
}

function setSpriteWorkerEvents()
//
{
  workerOnProgEndHandlers.push(spriteWorker_onProgEnd);

  workerMessageMap.set(MSGID_SPRITE_SHEET_REF_REQUEST_RESULT, onMsgSpriteSheetRefRequestResult);
  workerMessageMap.set(MSGID_SPRITE_SHEET_REQUEST_RESULT, onMsgSpriteSheetRequestResult);
}

function spriteWorker_onProgEnd()
//
{
  sprites.clear();
  zOrderedSprites = [];
  scrollX = 0;
  scrollY = 0;
  spriteSheetResultCallback = null;
}

function onMsgSpriteSheetRefRequestResult(msgData)
//
{
  var sprite;

  if(!spriteSheetResultCallback)
    return;

  if(msgData.errorMsg != "")
    spriteSheetResultCallback.vm.runError(msgData.errorMsg);
  else
  {
    sprite = sprites.get(msgData.spriteName);
    sprite.drawWidth = msgData.frameWidth;
    sprite.drawHeight = msgData.frameHeight;
    sprite.hitBoxWidth = msgData.frameWidth;
    sprite.hitBoxHeight = msgData.frameHeight;
    sprite.frameCount = msgData.frameCount;
    sprite.lastFrameIndex = sprite.frameCount - 1;

    spriteSheetResultCallback.vm.stack.push(null);
    spriteSheetResultCallback.resumeVM();
  }
}

function onMsgSpriteSheetRequestResult(msgData)
//
{
  if(!spriteSheetResultCallback)
    return;

  if(msgData.errorMsg != "")
    spriteSheetResultCallback.vm.runError(msgData.errorMsg);
  else
  {
    spriteSheetResultCallback.vm.stack.push(msgData.resultVal);
    spriteSheetResultCallback.resumeVM();
  }
}

function sendSpriteSheetRequest(vm, msgId, msgData)
//
{
  if(!spriteSheetResultCallback)
    spriteSheetResultCallback = new CallbackContext(vm);
  else
    spriteSheetResultCallback.vm = vm;

  postMessage({msgId: msgId, msgData: msgData});

  if(msgId == MSGID_SPRITE_SHEET_REF_REQUEST)
    expectedResultMessageID = MSGID_SPRITE_SHEET_REF_REQUEST_RESULT;
  else
    expectedResultMessageID = MSGID_SPRITE_SHEET_REQUEST_RESULT;
  
  vm.runLoopExitFlag = true;
}

function funcLoadSpriteSheet(vm, args)
//
{
  var msgData = {
      sheetName: args[0],
      sheetSource: args[1],
      columnCount: args[2],
      rowCount: args[3]
  };

  sendSpriteSheetRequest(vm, MSGID_LOAD_SPRITE_SHEET_REQUEST, msgData);

  return undefined;
}

function funcUnloadSpriteSheet(vm, args)
//
{
  sendSpriteSheetRequest(vm, MSGID_UNLOAD_SPRITE_SHEET_REQUEST, {sheetName: args[0]});
  return undefined;
}

function funcDrawSprites(vm, args)
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

  sendSpriteSheetRequest(vm, MSGID_DRAW_SPRITE_SHEET_FRAMES_REQUEST, {drawData: drawData});

  return undefined;
}

function funcGetSpriteFrameWidth(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sendSpriteSheetRequest(vm, MSGID_GET_SPRITE_SHEET_FRAME_WIDTH_REQUEST, {sheetName: sprites.get(spriteName).sheetName});

  return undefined;
}

function funcGetSpriteFrameHeight(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sendSpriteSheetRequest(vm, MSGID_GET_SPRITE_SHEET_FRAME_HEIGHT_REQUEST, {sheetName: sprites.get(spriteName).sheetName});

  return undefined;
}

function funcAddSprite(vm, args)
//
{
  var spriteName = args[0];
  var sheetName = args[1];
  var x = args[2];
  var y = args[3];
  var sprite;

  if(sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' already exists.");

  sprite = new Sprite(sheetName, x, y);
  sprites.set(spriteName, sprite);
  zOrderedSprites.push(sprite);

  sendSpriteSheetRequest(vm, MSGID_SPRITE_SHEET_REF_REQUEST, {sheetName: sheetName, spriteName: spriteName});

  return undefined;
}

function funcRemoveSprite(vm, args)
//
{
  var spriteName = args[0];
  var sprite;
  var spriteIndex;

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);
  spriteIndex = zOrderedSprites.indexOf(sprite);

  zOrderedSprites.splice(spriteIndex, 1)
  sprites.delete(spriteName);

  return null;
}

function funcSetSpriteSheet(vm, args)
//
{
  var spriteName = args[0];
  var sheetName = args[1];
  var sprite;

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);

  sprite.sheetName = sheetName;
  sprite.firstFrameIndex = 0;
  sprite.currFrameIndex = 0;

  sendSpriteSheetRequest(vm, MSGID_SPRITE_SHEET_REF_REQUEST, {sheetName: sheetName, spriteName: spriteName});

  return undefined;
}

function funcUpdateSprites(vm, args)
//
{
  var deltaTime = args[0];

  prevUpdateDeltaTime = deltaTime;

  for(const [spriteName, sprite] of sprites)
  {
    sprite.prevX = sprite.x;
    sprite.prevY = sprite.y;
    sprite.x += (sprite.velocityX * deltaTime);
    sprite.y += (sprite.velocityY * deltaTime);

    if(sprite.isPlaying)
    {
      sprite.frameSecondCount += deltaTime;

      if(sprite.frameSecondCount >= sprite.secondsPerFrame)
      {
        sprite.frameSecondCount -= sprite.secondsPerFrame;
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

  return null;
}

function funcGetSpriteFrameCount(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).frameCount;
}

function funcGetSpriteX(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).x;
}

function funcSetSpriteX(vm, args)
//
{
  var spriteName = args[0];
  var x = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).x = x;

  return null;
}

function funcGetSpriteY(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).y;
}

function funcSetSpriteY(vm, args)
//
{
  var spriteName = args[0];
  var y = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).y = y;

  return null;
}

function funcGetSpriteDrawWidth(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).drawWidth;
}

function funcSetSpriteDrawWidth(vm, args)
//
{
  var spriteName = args[0];
  var drawWidth = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).drawWidth = drawWidth;

  return null;
}

function funcGetSpriteDrawHeight(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).drawHeight;
}

function funcSetSpriteDrawHeight(vm, args)
//
{
  var spriteName = args[0];
  var drawHeight = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).drawHeight = drawHeight;

  return null;
}

function funcGetSpriteVelocityX(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).velocityX;
}

function funcSetSpriteVelocityX(vm, args)
//
{
  var spriteName = args[0];
  var velocityX = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).velocityX = velocityX;

  return null;
}

function funcGetSpriteVelocityY(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).velocityY;
}

function funcSetSpriteVelocityY(vm, args)
//
{
  var spriteName = args[0];
  var velocityY = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).velocityY = velocityY;

  return null;
}

function funcGetSpriteVisible(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).isVisible;
}

function funcSetSpriteVisible(vm, args)
//
{
  var spriteName = args[0];
  var isVisible = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).isVisible = isVisible;

  return null;
}

function funcGetSpritePlaying(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).isPlaying;
}

function funcSetSpritePlaying(vm, args)
//
{
  var spriteName = args[0];
  var isPlaying = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).isPlaying = isPlaying;

  return null;
}

function funcGetSpriteFrameRate(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).secondsPerFrame;
}

function funcSetSpriteFrameRate(vm, args)
//
{
  var spriteName = args[0];
  var frameRate = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).secondsPerFrame = frameRate;

  return null;
}

function funcSetSpriteFrameRange(vm, args)
//
{
  var spriteName = args[0];
  var firstFrameIndex = args[1];
  var lastFrameIndex = args[2];
  var sprite;

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);

  firstFrameIndex = Math.max(0, Math.min(firstFrameIndex, sprite.frameCount - 1));
  lastFrameIndex = Math.max(0, Math.min(lastFrameIndex, sprite.frameCount - 1));

  sprite.firstFrameIndex = Math.min(firstFrameIndex, lastFrameIndex);
  sprite.lastFrameIndex = Math.max(firstFrameIndex, lastFrameIndex);
  sprite.currFrameIndex = sprite.firstFrameIndex;

  return null;
}

function funcGetSpriteFrame(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).currFrameIndex;
}

function funcSetSpriteFrame(vm, args)
//
{
  var spriteName = args[0];
  var frameIndex = args[1];
  var sprite;

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);
  sprite.currFrameIndex = Math.max(sprite.firstFrameIndex, Math.min(frameIndex, sprite.lastFrameIndex));;

  return null;
}

function funcGetSpriteCycles(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).maxCycles;
}

function funcSetSpriteCycles(vm, args)
//
{
  var spriteName = args[0];
  var cycles = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  if(cycles < 0)
    cycles = 0;

  sprites.get(spriteName).maxCycles = cycles;

  return null;
}

function funcSpritesOverlap(vm, args)
//
{
  var spriteName1 = args[0];
  var spriteName2 = args[1];
  var sprite1, sprite2;

  if(!sprites.has(spriteName1))
    vm.runError("Sprite '" + spriteName1 + "' does not exist.");

  if(!sprites.has(spriteName2))
    vm.runError("Sprite '" + spriteName2 + "' does not exist.");

  sprite1 = sprites.get(spriteName1);
  sprite2 = sprites.get(spriteName2);

  if(((sprite1.x + sprite1.drawWidth) <= sprite2.x) || (sprite1.x >= (sprite2.x + sprite2.drawWidth)))
    return false;

  if(((sprite1.y + sprite1.drawHeight) <= sprite2.y) || (sprite1.y >= (sprite2.y + sprite2.drawHeight)))
    return false;

  return true;
}

function funcPointInSprite(vm, args)
//
{
  var spriteName = args[0];
  var pointX = args[1];
  var pointY = args[2];
  var sprite;

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);

  if((pointX <= sprite.x) || (pointX >= (sprite.x + sprite.drawWidth)))
    return false;

  if((pointY <= sprite.y) || (pointY >= (sprite.y + sprite.drawHeight)))
    return false;

  return true;
}

function funcSpriteOverlapsRect(vm, args)
//
{
  var spriteName = args[0];
  var rectX = args[1];
  var rectY = args[2];
  var rectWidth = args[3];
  var rectHeight = args[4];
  var sprite;

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);

  if(((sprite.x + sprite.drawWidth) <= rectX) || (sprite.x >= (rectX + rectWidth)))
    return false;

  if(((sprite.y + sprite.drawHeight) <= rectY) || (sprite.y >= (rectY + rectHeight)))
    return false;

  return true;
}

function funcSpriteOverlapsCircle(vm, args)
//
{
  var spriteName = args[0];
  var circleX = args[1];
  var circleY = args[2];
  var circleRadius = args[3];
  var sprite;
  var closestX, closestY, distance;

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);

  closestX = Math.max(sprite.x, Math.min(circleX, sprite.x + sprite.drawWidth));
  closestY = Math.max(sprite.y, Math.min(circleY, sprite.y + sprite.drawHeight));
  distance = ((circleX - closestX) ^ 2) + ((circleY - closestY) ^ 2);

  return distance < (circleRadius ^ 2);
}

function funcGetScrollX(vm, args)
//
{
  return scrollX;
}

function funcSetScrollX(vm, args)
//
{
  scrollX = args[0];
  return null;
}

function funcGetScrollY(vm, args)
//
{
  return scrollY;
}

function funcSetScrollY(vm, args)
//
{
  scrollY = args[0];
  return null;
}

function funcShiftScrollX(vm, args)
//
{
  scrollX += args[0];
  return null;
}

function funcShiftScrollY(vm, args)
//
{
  scrollY += args[0];
  return null;
}

function funcGetSpriteScroll(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).scroll;
}

function funcSetSpriteScroll(vm, args)
//
{
  var spriteName = args[0];
  var scroll = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).scroll = scroll;

  return null;
}

function funcSpriteToBack(vm, args)
//Bring the given sprite to the bottom of the z-order
{
  var spriteName = args[0];
  var sprite;
  var spriteIndex;

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);
  spriteIndex = zOrderedSprites.indexOf(sprite);

  zOrderedSprites.unshift(zOrderedSprites.splice(spriteIndex, 1)[0]);

  return null;
}

function funcSpriteToFront(vm, args)
//Bring the given sprite to the top of the z-order
{
  var spriteName = args[0];
  var sprite;
  var spriteIndex;

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprite = sprites.get(spriteName);
  spriteIndex = zOrderedSprites.indexOf(sprite);

  zOrderedSprites.push(zOrderedSprites.splice(spriteIndex, 1)[0]);

  return null;
}

function funcGetSpriteHitBoxOffsetX(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).hitBoxOffsetX;
}

function funcSetSpriteHitBoxOffsetX(vm, args)
//
{
  var spriteName = args[0];
  var hitBoxOffsetX = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).hitBoxOffsetX = hitBoxOffsetX;

  return null;
}

function funcGetSpriteHitBoxOffsetY(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).hitBoxOffsetY;
}

function funcSetSpriteHitBoxOffsetY(vm, args)
//
{
  var spriteName = args[0];
  var hitBoxOffsetY = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).hitBoxOffsetY = hitBoxOffsetY;

  return null;
}

function funcGetSpriteHitBoxWidth(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).hitBoxWidth;
}

function funcSetSpriteHitBoxWidth(vm, args)
//
{
  var spriteName = args[0];
  var hitBoxWidth = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).hitBoxWidth = hitBoxWidth;

  return null;
}

function funcGetSpriteHitBoxHeight(vm, args)
//
{
  var spriteName = args[0];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  return sprites.get(spriteName).hitBoxHeight;
}

function funcSetSpriteHitBoxHeight(vm, args)
//
{
  var spriteName = args[0];
  var hitBoxHeight = args[1];

  if(!sprites.has(spriteName))
    vm.runError("Sprite '" + spriteName + "' does not exist.");

  sprites.get(spriteName).hitBoxHeight = hitBoxHeight;

  return null;
}

function funcSpritesCollided(vm, args)
//
{
  var testSpriteName = args[0];
  var referenceSpriteName = args[1];
  var contactStruct = null;
  var testSprite, referenceSprite;
  var contact = new SpriteContact();
  var haveCollided;

  if(!sprites.has(testSpriteName))
    vm.runError("Sprite '" + testSpriteName + "' does not exist.");

  if(!sprites.has(referenceSpriteName))
    vm.runError("Sprite '" + referenceSpriteName + "' does not exist.");

  testSprite = sprites.get(testSpriteName);
  referenceSprite = sprites.get(referenceSpriteName);

  if(args.length == 3)
  {
    contactStruct = args[2];
    if(!(contactStruct instanceof ObjStructure))
      vm.runError("Last argument of spritesCollided() must be a structure.");
  }

  haveCollided = spritesCollided(testSprite, referenceSprite, prevUpdateDeltaTime, contact);

  for(const [key, value] of Object.entries(contact))
  {
    if(contactStruct.fieldMap.has(key))
      contactStruct.fieldMap.set(key, value);
  }

  return haveCollided;
}

function funcResolveSpriteCollision(vm, args)
//
{
  var spriteName1 = args[0];
  var spriteName2 = args[1];
  var contactTime = args[2];
  var sprite1, sprite2;

  if(!sprites.has(spriteName1))
    vm.runError("Sprite '" + spriteName1 + "' does not exist.");

  if(!sprites.has(spriteName2))
    vm.runError("Sprite '" + spriteName2 + "' does not exist.");

  sprite1 = sprites.get(spriteName1);
  sprite2 = sprites.get(spriteName2);

  sprite1.x = sprite1.prevX + (contactTime * sprite1.velocityX * prevUpdateDeltaTime);
  sprite1.y = sprite1.prevY + (contactTime * sprite1.velocityY * prevUpdateDeltaTime);
  sprite2.x = sprite2.prevX + (contactTime * sprite2.velocityX * prevUpdateDeltaTime);
  sprite2.y = sprite2.prevY + (contactTime * sprite2.velocityY * prevUpdateDeltaTime);

  return null;
}

function funcResolveSpriteCollisionX(vm, args)
//
{
  var spriteName1 = args[0];
  var spriteName2 = args[1];
  var contactTime = args[2];
  var sprite1, sprite2;

  if(!sprites.has(spriteName1))
    vm.runError("Sprite '" + spriteName1 + "' does not exist.");

  if(!sprites.has(spriteName2))
    vm.runError("Sprite '" + spriteName2 + "' does not exist.");

  sprite1 = sprites.get(spriteName1);
  sprite2 = sprites.get(spriteName2);

  sprite1.x = sprite1.prevX + (contactTime * sprite1.velocityX * prevUpdateDeltaTime);
  sprite2.x = sprite2.prevX + (contactTime * sprite2.velocityX * prevUpdateDeltaTime);

  return null;
}

function funcResolveSpriteCollisionY(vm, args)
//
{
  var spriteName1 = args[0];
  var spriteName2 = args[1];
  var contactTime = args[2];
  var sprite1, sprite2;

  if(!sprites.has(spriteName1))
    vm.runError("Sprite '" + spriteName1 + "' does not exist.");

  if(!sprites.has(spriteName2))
    vm.runError("Sprite '" + spriteName2 + "' does not exist.");

  sprite1 = sprites.get(spriteName1);
  sprite2 = sprites.get(spriteName2);

  sprite1.y = sprite1.prevY + (contactTime * sprite1.velocityY * prevUpdateDeltaTime);
  sprite2.y = sprite2.prevY + (contactTime * sprite2.velocityY * prevUpdateDeltaTime);

  return null;
}