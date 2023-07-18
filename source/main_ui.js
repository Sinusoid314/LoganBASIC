var isRunning = false;
var statusBar = document.getElementById("statusBar");
var toggles = document.getElementsByClassName("toggle-open");
var progWorker = new Worker('main_worker.js');
var uiMsgFuncs = new Map();

progWorker.onmessage = progUI_onMessage;
window.addEventListener("load", window_onLoad);

initUIMsgFuncs();

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

function cleanupUI(exitStatus)
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

function window_onLoad(event)
//Parse URL parameters (if present) and take appropriate action
{
  var urlParams = new URLSearchParams(window.location.search);
  var fileURL;

  if(!urlParams.has("open"))
    return;

  fileURL = urlParams.get("open");

  loadSourceFile(fileURL);
}

function startProg(source)
//Reset the UI and signal the worker thread to start the program
{
  if(isRunning)
    return;

  clearConsoleOutput();
  resetCanvas();
  debugClearDisplays();
  
  progWorker.postMessage({msgId: MSGID_START_PROG, msgData: {source: source}});

  switchMode();
}

function stopProg()
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

  cleanupUI("Program stopped.");
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
}

function onMsgProgDoneSuccess(msgData)
//The worker thread has signaled that the program has completed successfully
{
  cleanupUI("Program run successfully.");
}

function onMsgProgDoneError(msgData)
//The worker thread has signaled that the program has stopped with an error
{
  if(msgData.error.sourceName == mainSourceName)
    selectEditorLine(msgData.error.sourceLineNum);

  cleanupUI(msgData.error.message);
}

function onMsgStatusChange(msgData)
//Display a status change
{
  statusBar.innerHTML = msgData.statusText;
}

