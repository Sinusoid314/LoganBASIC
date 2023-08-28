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

      for(var column = 0; column < columnCount; column++)
      {
        offsetX = column * this.frameWidth;
        this.frameOffsets.push( {x: offsetX, y: offsetY} );
      }
    }
  }
}

var spriteSheets = new Map();

onProgEndHandlers.push(sprite_onProgEnd);

uiMessageMap.set(MSGID_SPRITE_SHEET_REF_REQUEST, onMsgSpriteSheetRefRequest);
uiMessageMap.set(MSGID_LOAD_SPRITE_SHEET_REQUEST, onMsgLoadSpriteSheetRequest);
uiMessageMap.set(MSGID_UNLOAD_SPRITE_SHEET_REQUEST, onMsgUnloadSpriteSheetRequest);
uiMessageMap.set(MSGID_DRAW_SPRITE_SHEET_FRAMES_REQUEST, onMsgDrawSpriteSheetFramesRequest);
uiMessageMap.set(MSGID_GET_SPRITE_SHEET_FRAME_WIDTH_REQUEST, onMsgGetSpriteSheetFrameWidthRequest);
uiMessageMap.set(MSGID_GET_SPRITE_SHEET_FRAME_HEIGHT_REQUEST, onMsgGetSpriteSheetFrameHeightRequest);


function cleanupSpriteSheets()
//Unload all sprite sheet images
{
  spriteSheets.clear();
}

function sendSpriteSheetRequestResult(resultVal, errorMsg = "")
//
{
  progWorker.postMessage({msgId: MSGID_SPRITE_SHEET_REQUEST_RESULT, msgData: {resultVal: resultVal, errorMsg: errorMsg}});
}

function spriteSheet_onLoad(event)
//
{
  if(!isRunning)
    return;

  this.removeEventListener("load", spriteSheet_onLoad);
  this.removeEventListener("error", spriteSheet_onError);

  spriteSheets.set(this.id, new SpriteSheet(this, this.dataset.columnCount, this.dataset.rowCount));

  sendSpriteSheetRequestResult(true)
}

function spriteSheet_onError(event)
//
{
  if(!isRunning)
    return;

  this.removeEventListener("load", spriteSheet_onLoad);
  this.removeEventListener("error", spriteSheet_onError);

  sendSpriteSheetRequestResult(false)
}

function sprite_onProgEnd(exitStatus, error)
//
{
  cleanupSpriteSheets();
}

function onMsgSpriteSheetRefRequest(msgData)
//
{
  var sheet;

  if(spriteSheets.has(msgData.sheetName))
  {
    sheet = spriteSheets.get(msgData.sheetName);
    progWorker.postMessage({msgId: MSGID_SPRITE_SHEET_REF_REQUEST_RESULT,
                            msgData: {errorMsg: "",
                                      spriteName: msgData.spriteName,
                                      frameWidth: sheet.frameWidth,
                                      frameHeight: sheet.frameHeight,
                                      frameCount: sheet.frameOffsets.length}});
  }
  else
    progWorker.postMessage({msgId: MSGID_SPRITE_SHEET_REF_REQUEST_RESULT,
                            msgData: {errorMsg: "Sprite sheet '" + msgData.sheetName + "' has not been loaded."}});
}

function onMsgLoadSpriteSheetRequest(msgData)
//Load a sprite sheet image
{
  var newSheetImage;

  if(!spriteSheets.has(msgData.sheetName))
  {
    newSheetImage = new Image();

    newSheetImage.addEventListener("load", spriteSheet_onLoad);
    newSheetImage.addEventListener("error", spriteSheet_onError);

    newSheetImage.id = msgData.sheetName;
    newSheetImage.dataset.columnCount = msgData.columnCount;
    newSheetImage.dataset.rowCount = msgData.rowCount;
    newSheetImage.src = msgData.sheetSource;
  }
  else
    sendSpriteSheetRequestResult(null, "Sprite sheet '" + msgData.sheetName + "' has already been loaded.");
}

function onMsgUnloadSpriteSheetRequest(msgData)
//Unload a sprite sheet image
{
  if(spriteSheets.has(msgData.sheetName))
  {
    spriteSheets.delete(msgData.sheetName);
    sendSpriteSheetRequestResult(0);
  }
  else
    sendSpriteSheetRequestResult(null, "Sprite sheet '" + msgData.sheetName + "' has not been loaded.");
}

function onMsgDrawSpriteSheetFramesRequest(msgData)
//
{
  var sheetName, sheet, frameIndex;
  var drawX, drawY, drawWidth, drawHeight;
  var clipX, clipY, clipWidth, clipHeight;

  for(const drawItem of msgData.drawData)
  {
    sheetName = drawItem[0];
    frameIndex = drawItem[1];
    drawX = drawItem[2];
    drawY = drawItem[3];
    drawWidth = drawItem[4];
    drawHeight = drawItem[5];

    if(spriteSheets.has(sheetName))
    {
      sheet = spriteSheets.get(sheetName);

      if(frameIndex < 0)
        frameIndex = 0;

      if(frameIndex >= sheet.frameOffsets.length)
        frameIndex = sheet.frameOffsets.length - 1;

      clipX = sheet.frameOffsets[frameIndex].x;
      clipY = sheet.frameOffsets[frameIndex].y;
      clipWidth = sheet.frameWidth;
      clipHeight = sheet.frameHeight;

      activeContext.drawImage(sheet.sheetImage, clipX, clipY, clipWidth, clipHeight, drawX, drawY, drawWidth, drawHeight);
    }
    else
    {
      sendSpriteSheetRequestResult(null, "Sprite sheet '" + sheetName + "' has not been loaded.");
      return;
    }
  }

  sendSpriteSheetRequestResult(0);
}

function onMsgGetSpriteSheetFrameWidthRequest(msgData)
//
{
  if(spriteSheets.has(msgData.sheetName))
    sendSpriteSheetRequestResult(spriteSheets.get(msgData.sheetName).frameWidth);
  else
    sendSpriteSheetRequestResult(null, "Sprite sheet '" + msgData.sheetName + "' has not been loaded.");
}

function onMsgGetSpriteSheetFrameHeightRequest(msgData)
//
{
  if(spriteSheets.has(msgData.sheetName))
    sendSpriteSheetRequestResult(spriteSheets.get(msgData.sheetName).frameHeight);
  else
    sendSpriteSheetRequestResult(null, "Sprite sheet '" + msgData.sheetName + "' has not been loaded.");
}

