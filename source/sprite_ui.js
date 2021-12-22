class SpriteSheet
{
  constructor(sheetImage)
  {
    this.frameWidth = sheetImage.width;
    this.frameHeight = sheetImage.height;
  }
}

var spriteSheets = new Map();

function cleanupSpriteSheets()
//Unload all sprite sheet images
{
  spriteSheets.clear();
}

function spriteSheet_onLoad(event)
//
{
  this.removeEventListener("load", spriteSheet_onLoad);
  this.removeEventListener("error", spriteSheet_onError);

  spriteSheets.set(this.id, new SpriteSheet(this));

  sendSpriteSheetRequestResult(["", true])
}

function spriteSheet_onError(event)
//
{
  this.removeEventListener("load", spriteSheet_onLoad);
  this.removeEventListener("error", spriteSheet_onError);

  sendSpriteSheetRequestResult(["", false])
}

function sendSpriteSheetRequestResult(msgData)
//
{
  progWorker.postMessage({msgId: MSGID_SPRITE_SHEET_REQUEST_RESULT, msgData: msgData});
}

function loadSpriteSheet(sheetName, sheetSource)
//Load a sprite sheet image
{
  var newSheetImage;

  if(!spriteSheets.has(sheetName))
  {
    newSheetImage = new Image();

    newSheetImage.addEventListener("load", spriteSheet_onLoad);
    newSheetImage.addEventListener("error", spriteSheet_onError);

    newSheetImage.id = sheetName;
    newSheetImage.src = sheetSource;
  }
  else
    sendSpriteSheetRequestResult(["Sprite sheet '" + sheetName + "' has already been loaded."]);
}

function unloadSpriteSheet(sheetName)
//Unload a sprite sheet image
{
  if(spriteSheets.has(sheetName))
  {
    spriteSheets.delete(sheetName);
    sendSpriteSheetRequestResult(["", 0]);
  }
  else
    sendSpriteSheetRequestResult(["Sprite sheet '" + sheetName + "' has not been loaded."]);
}

function drawSpriteSheetFrames()
//
{

}

function getSpriteSheetFrameWidth(sheetName)
//
{
  if(spriteSheets.has(sheetName))
    sendSpriteSheetRequestResult(["", spriteSheets.get(sheetName).frameWidth]);
  else
    sendSpriteSheetRequestResult(["Sprite sheet '" + sheetName + "' has not been loaded."]);
}

function getSpriteSheetFrameHeight(sheetName)
//
{
  if(spriteSheets.has(sheetName))
    sendSpriteSheetRequestResult(["", spriteSheets.get(sheetName).frameHeight]);
  else
    sendSpriteSheetRequestResult(["Sprite sheet '" + sheetName + "' has not been loaded."]);
}
