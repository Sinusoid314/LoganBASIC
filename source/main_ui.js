var isRunning = false;
var runBtn = document.getElementById("runBtn");
var stopBtn = document.getElementById("stopBtn");
var statusBar = document.getElementById("statusBar");
var toggles = document.getElementsByClassName("toggle-open");
var progWorker = new Worker('main_worker.js');
var uiMsgFuncs = new Map();

initUIMsgFuncs();
progWorker.onmessage = progUI_onMessage;

runBtn.addEventListener("click", runBtn_onClick);
stopBtn.addEventListener("click", stopBtn_onClick);

for(var i = 0; i < toggles.length; i++)
  toggles[i].addEventListener("click", toggle_onClick);

function switchMode()
//Switch between run and edit modes
{
  runBtn.disabled = !runBtn.disabled;
  stopBtn.disabled = !stopBtn.disabled;
  editorCode.readOnly = !editorCode.readOnly;
  isRunning = !isRunning;
}

function stopProg(exitStatus)
//Set the UI to reflect that the program has stopped running
{
  if(!isRunning)
    return;

  closeConsoleInput();
  cleanupCanvas();
  cleanupSounds();
  cleanupSpriteSheets();
  debugChangeUIStatus(DEBUG_UI_STATUS_DISABLED);
  
  statusBar.innerHTML = exitStatus;

  switchMode();
}

function runBtn_onClick(event)
//Reset the UI and signal the worker thread to start the program
{
  var editorStr;

  if(isRunning)
    return;

  editorStr = editorCode.value;
  clearConsoleOutput();
  resetCanvas();
  debugClearDisplays();
  
  progWorker.postMessage({msgId: MSGID_START_PROG, msgData: {source: editorStr}});

  switchMode();
}

function stopBtn_onClick(event)
//Terminate and restart the worker thread
{
  progWorker.terminate();
  progWorker = new Worker('main_worker.js');
  progWorker.onmessage = progUI_onMessage;

  //Reload saved breakpoints into the worker thread
  for(const breakpoint of debugBreakpointBackups)
    progWorker.postMessage({msgId: MSGID_DEBUG_ADD_BREAKPOINT, msgData: breakpoint});

  if(isDebugging)
    progWorker.postMessage({msgId: MSGID_DEBUG_ENABLE, msgData: null});

  stopProg("Program stopped.");
}

function toggle_onClick(event)
{
  this.parentElement.querySelector(".pane-open").classList.toggle("pane-closed");
  this.classList.toggle("toggle-closed");
}

function initUIMsgFuncs()
//
{
  uiMsgFuncs.set(MSGID_PROG_DONE_SUCCESS, onMsgProgDoneSuccess);
  uiMsgFuncs.set(MSGID_PROG_DONE_ERROR, onMsgProgDoneError);
  uiMsgFuncs.set(MSGID_STATUS_CHANGE, onMsgStatusChange);
  uiMsgFuncs.set(MSGID_SHOW_EDITOR, onMsgShowEditor);
  uiMsgFuncs.set(MSGID_HIDE_EDITOR, onMsgHideEditor);
  uiMsgFuncs.set(MSGID_SHOW_CONSOLE, onMsgShowConsole);
  uiMsgFuncs.set(MSGID_HIDE_CONSOLE, onMsgHideConsole);
  uiMsgFuncs.set(MSGID_PRINT, onMsgPrint);
  uiMsgFuncs.set(MSGID_INPUT_REQUEST, onMsgInputRequest);
  uiMsgFuncs.set(MSGID_CLEAR_CONSOLE, onMsgClearConsole);
  uiMsgFuncs.set(MSGID_SHOW_CANVAS, onMsgShowCanvas);
  uiMsgFuncs.set(MSGID_HIDE_CANVAS, onMsgHideCanvas);
  uiMsgFuncs.set(MSGID_SET_CANVAS_WIDTH, onMsgSetCanvasWidth);
  uiMsgFuncs.set(MSGID_SET_CANVAS_HEIGHT, onMsgSetCanvasHeight);
  uiMsgFuncs.set(MSGID_CLEAR_CANVAS, onMsgClearCanvas);
  uiMsgFuncs.set(MSGID_LOAD_IMAGE_REQUEST, onMsgLoadImageRequest);
  uiMsgFuncs.set(MSGID_UNLOAD_IMAGE_REQUEST, onMsgUnloadImageRequest);
  uiMsgFuncs.set(MSGID_DRAW_IMAGE_REQUEST, onMsgDrawImageRequest);
  uiMsgFuncs.set(MSGID_DRAW_IMAGE_CLIP_REQUEST, onMsgDrawImageClipRequest);
  uiMsgFuncs.set(MSGID_DRAW_IMAGE_TILED_REQUEST, onMsgDrawImageTiledRequest);
  uiMsgFuncs.set(MSGID_GET_IMAGE_WIDTH_REQUEST, onMsgGetImageWidthRequest);
  uiMsgFuncs.set(MSGID_GET_IMAGE_HEIGHT_REQUEST, onMsgGetImageHeightRequest);
  uiMsgFuncs.set(MSGID_ENABLE_CANVAS_BUFFER, onMsgEnableCanvasBuffer);
  uiMsgFuncs.set(MSGID_DISABLE_CANVAS_BUFFER, onMsgDisableCanvasBuffer);
  uiMsgFuncs.set(MSGID_DRAW_CANVAS_BUFFER, onMsgDrawCanvasBuffer);
  uiMsgFuncs.set(MSGID_ADD_CANVAS_EVENT, onMsgAddCanvasEvent);
  uiMsgFuncs.set(MSGID_REMOVE_CANVAS_EVENT, onMsgRemoveCanvasEvent);
  uiMsgFuncs.set(MSGID_DRAW_TEXT, onMsgDrawText);
  uiMsgFuncs.set(MSGID_DRAW_RECT, onMsgDrawRect);
  uiMsgFuncs.set(MSGID_DRAW_CIRCLE, onMsgDrawCircle);
  uiMsgFuncs.set(MSGID_DRAW_LINE, onMsgDrawLine);
  uiMsgFuncs.set(MSGID_SET_TEXT_FONT, onMsgSetTextFont);
  uiMsgFuncs.set(MSGID_SET_FILL_COLOR, onMsgSetFillColor);
  uiMsgFuncs.set(MSGID_SET_LINE_COLOR, onMsgSetLineColor);
  uiMsgFuncs.set(MSGID_SET_LINE_SIZE, onMsgSetLineSize);
  uiMsgFuncs.set(MSGID_LOAD_SOUND_REQUEST, onMsgLoadSoundRequest);
  uiMsgFuncs.set(MSGID_UNLOAD_SOUND_REQUEST, onMsgUnloadSoundRequest);
  uiMsgFuncs.set(MSGID_PLAY_SOUND_REQUEST, onMsgPlaySoundRequest);
  uiMsgFuncs.set(MSGID_PAUSE_SOUND_REQUEST, onMsgPauseSoundRequest);
  uiMsgFuncs.set(MSGID_STOP_SOUND_REQUEST, onMsgStopSoundRequest);
  uiMsgFuncs.set(MSGID_GET_SOUND_LEN_REQUEST, onMsgGetSoundLenRequest);
  uiMsgFuncs.set(MSGID_GET_SOUND_POS_REQUEST, onMsgGetSoundPosRequest);
  uiMsgFuncs.set(MSGID_SET_SOUND_POS_REQUEST, onMsgSetSoundPosRequest);
  uiMsgFuncs.set(MSGID_LOOP_SOUND_REQUEST, onMsgLoopSoundRequest);
  uiMsgFuncs.set(MSGID_SPRITE_SHEET_REF_REQUEST, onMsgSpriteSheetRefRequest);
  uiMsgFuncs.set(MSGID_LOAD_SPRITE_SHEET_REQUEST, onMsgLoadSpriteSheetRequest);
  uiMsgFuncs.set(MSGID_UNLOAD_SPRITE_SHEET_REQUEST, onMsgUnloadSpriteSheetRequest);
  uiMsgFuncs.set(MSGID_DRAW_SPRITE_SHEET_FRAMES_REQUEST, onMsgDrawSpriteSheetFramesRequest);
  uiMsgFuncs.set(MSGID_GET_SPRITE_SHEET_FRAME_WIDTH_REQUEST, onMsgGetSpriteSheetFrameWidthRequest);
  uiMsgFuncs.set(MSGID_GET_SPRITE_SHEET_FRAME_HEIGHT_REQUEST, onMsgGetSpriteSheetFrameHeightRequest);      
  uiMsgFuncs.set(MSGID_DEBUG_UPDATE_UI, onMsgDebugUpdateUI);
}

function progUI_onMessage(message)
//Process messages sent from the worker thread
{
  if(!isRunning)
    return;

  uiMsgFuncs.get(message.data.msgId)(message.data.msgData);

/*
  switch(message.data.msgId)
  {
    case MSGID_PROG_DONE_SUCCESS:
      onMsgProgDoneSuccess(message.data.msgData);
      break;

    case MSGID_PROG_DONE_ERROR:
      onMsgProgDoneError(message.data.msgData);
      break;

    case MSGID_STATUS_CHANGE:
      onMsgStatusChange(message.data.msgData);
      break;

    case MSGID_SHOW_EDITOR:
      onMsgShowEditor(message.data.msgData);
      break;

    case MSGID_HIDE_EDITOR:
      onMsgHideEditor(message.data.msgData);
      break;

    case MSGID_SHOW_CONSOLE:
      onMsgShowConsole(message.data.msgData);
      break;

    case MSGID_HIDE_CONSOLE:
      onMsgHideConsole(message.data.msgData);
      break;

    case MSGID_PRINT:
      onMsgPrint(message.data.msgData);
      break;

    case MSGID_INPUT_REQUEST:
      onMsgInputRequest(message.data.msgData);
      break;

    case MSGID_CLEAR_CONSOLE:
      onMsgClearConsole(message.data.msgData);
      break;

    case MSGID_SHOW_CANVAS:
      onMsgShowCanvas(message.data.msgData);
      break;

    case MSGID_HIDE_CANVAS:
      onMsgHideCanvas(message.data.msgData);
      break;

    case MSGID_SET_CANVAS_WIDTH:
      onMsgSetCanvasWidth(message.data.msgData);
      break;

    case MSGID_SET_CANVAS_HEIGHT:
      onMsgSetCanvasHeight(message.data.msgData);
      break;

    case MSGID_CLEAR_CANVAS:
      onMsgClearCanvas(message.data.msgData);
      break;

    case MSGID_LOAD_IMAGE_REQUEST:
      onMsgLoadImageRequest(message.data.msgData);
      break;

    case MSGID_UNLOAD_IMAGE_REQUEST:
      onMsgUnloadImageRequest(message.data.msgData);
      break;

    case MSGID_DRAW_IMAGE_REQUEST:
      onMsgDrawImageRequest(message.data.msgData);
      break;

    case MSGID_DRAW_IMAGE_CLIP_REQUEST:
      onMsgDrawImageClipRequest(message.data.msgData);
      break;

    case MSGID_DRAW_IMAGE_TILED_REQUEST:
      onMsgDrawImageTiledRequest(message.data.msgData);
      break;

    case MSGID_GET_IMAGE_WIDTH_REQUEST:
      onMsgGetImageWidthRequest(message.data.msgData);
      break;

    case MSGID_GET_IMAGE_HEIGHT_REQUEST:
      onMsgGetImageHeightRequest(message.data.msgData);
      break;

    case MSGID_ENABLE_CANVAS_BUFFER:
      onMsgEnableCanvasBuffer(message.data.msgData);
      break;

    case MSGID_DISABLE_CANVAS_BUFFER:
      onMsgDisableCanvasBuffer(message.data.msgData);
      break;

    case MSGID_DRAW_CANVAS_BUFFER:
      onMsgDrawCanvasBuffer(message.data.msgData);
      break;

    case MSGID_ADD_CANVAS_EVENT:
      onMsgAddCanvasEvent(message.data.msgData);
      break;

    case MSGID_REMOVE_CANVAS_EVENT:
      onMsgRemoveCanvasEvent(message.data.msgData);
      break;

    case MSGID_DRAW_TEXT:
      onMsgDrawText(message.data.msgData);
      break;

    case MSGID_DRAW_RECT:
      onMsgDrawRect(message.data.msgData);
      break;

    case MSGID_DRAW_CIRCLE:
      onMsgDrawCircle(message.data.msgData);
      break;

    case MSGID_DRAW_LINE:
      onMsgDrawLine(message.data.msgData);
      break;

    case MSGID_SET_TEXT_FONT:
      onMsgSetTextFont(message.data.msgData);
      break;

    case MSGID_SET_FILL_COLOR:
      onMsgSetFillColor(message.data.msgData);
      break;

    case MSGID_SET_LINE_COLOR:
      onMsgSetLineColor(message.data.msgData);
      break;

    case MSGID_SET_LINE_SIZE:
      onMsgSetLineSize(message.data.msgData);
      break;

    case MSGID_LOAD_SOUND_REQUEST:
      onMsgLoadSoundRequest(message.data.msgData);
      break;

    case MSGID_UNLOAD_SOUND_REQUEST:
      onMsgUnloadSoundRequest(message.data.msgData);
      break;

    case MSGID_PLAY_SOUND_REQUEST:
      onMsgPlaySoundRequest(message.data.msgData);
      break;

    case MSGID_PAUSE_SOUND_REQUEST:
      onMsgPauseSoundRequest(message.data.msgData);
      break;

    case MSGID_STOP_SOUND_REQUEST:
      onMsgStopSoundRequest(message.data.msgData);
      break;

    case MSGID_GET_SOUND_LEN_REQUEST:
      onMsgGetSoundLenRequest(message.data.msgData);
      break;

    case MSGID_GET_SOUND_POS_REQUEST:
      onMsgGetSoundPosRequest(message.data.msgData);
      break;

    case MSGID_SET_SOUND_POS_REQUEST:
      onMsgSetSoundPosRequest(message.data.msgData);
      break;

    case MSGID_LOOP_SOUND_REQUEST:
      onMsgLoopSoundRequest(message.data.msgData);
      break;

    case MSGID_SPRITE_SHEET_REF_REQUEST:
      onMsgSpriteSheetRefRequest(message.data.msgData);
      break;

    case MSGID_LOAD_SPRITE_SHEET_REQUEST:
      onMsgLoadSpriteSheetRequest(message.data.msgData);
      break;

    case MSGID_UNLOAD_SPRITE_SHEET_REQUEST:
      onMsgUnloadSpriteSheetRequest(message.data.msgData);
      break;

    case MSGID_DRAW_SPRITE_SHEET_FRAMES_REQUEST:
      onMsgDrawSpriteSheetFramesRequest(message.data.msgData);
      break;

    case MSGID_GET_SPRITE_SHEET_FRAME_WIDTH_REQUEST:
      onMsgGetSpriteSheetFrameWidthRequest(message.data.msgData);
      break;

    case MSGID_GET_SPRITE_SHEET_FRAME_HEIGHT_REQUEST:
      onMsgGetSpriteSheetFrameHeightRequest(message.data.msgData);
      break;
      
    case MSGID_DEBUG_UPDATE_UI:
      onMsgDebugUpdateUI(message.data.msgData);
      break;
  }
*/
}

function onMsgProgDoneSuccess(msgData)
//The worker thread has signaled that the program has completed successfully
{
  stopProg("Program run successfully.");
}

function onMsgProgDoneError(msgData)
//The worker thread has signaled that the program has stopped with an error
{
  if(msgData.error.sourceName == mainSourceName)
    selectEditorLine(msgData.error.sourceLineNum);

  stopProg(msgData.error.message);
}

function onMsgStatusChange(msgData)
//Display a status change
{
  statusBar.innerHTML = msgData.statusText;
}

