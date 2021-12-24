class SpriteSheet
{
  constructor(sheetImage, columnCount, rowCount)
  {
    var offsetX, offsetY;

    this.sheetImage = sheetImage;
    this.frameWidth = parseInt(sheetImage.width / columnCount);
    this.frameHeight = parseInt(sheetImage.height / rowCount);
    this.frameOffsets = [];

    for(var row = 0; row < rowCount; row++)
    {
      offsetY = row * this.frameHeight;

      for(var column = 0; column < columnCount; coulumn++)
      {
        offsetX = column * this.frameWidth;

        this.frameOffsets.push( {x: offsetX, y: offsetY} );
      }
    }
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

function spriteSheetRefRequest(sheetName, spriteName)
//
{
  var sheet;

  if(spriteSheets.has(sheetName))
  {
    sheet = spriteSheets.get(sheetName);
    progWorker.postMessage({msgId: MSGID_SPRITE_SHEET_REF_REQUEST_RESULT,
                            msgData: ["", spriteName, sheet.frameWidth, sheet.frameHeight, sheet.frameOffsets.length]});
  }
  else
    progWorker.postMessage({msgId: MSGID_SPRITE_SHEET_REF_REQUEST_RESULT,
                            msgData: ["Sprite sheet '" + sheetName + "' has not been loaded."]});
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

function drawSpriteSheetFrames(drawData)
//
{
  var sheet;

  for(const drawItem of drawData)
  {
    if(spriteSheets.has(drawItem[0]))
    {
      sheet = spriteSheets.get(drawItem[0]);
      //activeContext.drawImage(sheet.sheetImage, clipX, clipY, clipWidth, clipHeight, drawX, drawY, drawWidth, drawHeight);
      //[sheetName, frameIndex, drawX, drawY, scaleX, scaleY]
    }
    else
      sendSpriteSheetRequestResult(["Sprite sheet '" + sheetName + "' has not been loaded."]);
  }
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

