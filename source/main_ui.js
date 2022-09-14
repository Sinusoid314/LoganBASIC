var isRunning = false;
var runBtn = document.getElementById("runBtn");
var stopBtn = document.getElementById("stopBtn");
var statusBar = document.getElementById("statusBar");
var toggles = document.getElementsByClassName("toggle-open");
var progWorker = new Worker('main.js');

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
  progEditor.readOnly = !progEditor.readOnly;
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
  statusBar.innerHTML = exitStatus;

  switchMode();
}

function runBtn_onClick(event)
//Reset the UI and signal the worker thread to start the program
{
  var editorStr;

  if(isRunning)
    return;

  editorStr = progEditor.value;
  clearConsoleOutput();
  resetCanvas();
  clearDebugDisplays();
  
  progWorker.postMessage({msgId: MSGID_START_PROG, msgData: editorStr});

  switchMode();
}

function stopBtn_onClick(event)
//Terminate and restart the worker thread
{
  progWorker.terminate();
  progWorker = new Worker('main.js');
  progWorker.onmessage = progUI_onMessage;

  stopProg("Program stopped.");
}

function toggle_onClick(event)
{
  this.parentElement.querySelector(".pane-open").classList.toggle("pane-closed");
  this.classList.toggle("toggle-closed");
}

function progUI_onMessage(message)
//Process messages sent from the worker thread
{
  switch(message.data.msgId)
  {
    case MSGID_PROG_DONE_SUCCESS:
      onProgDoneSuccess();
      break;

    case MSGID_PROG_DONE_ERROR:
      onProgDoneError(message.data.msgData);
      break;

    case MSGID_STATUS_CHANGE:
      onStatusChange(message.data.msgData);
      break;

    case MSGID_SHOW_EDITOR:
      showEditor();
      break;

    case MSGID_HIDE_EDITOR:
      hideEditor();
      break;

    case MSGID_SHOW_CONSOLE:
      showConsole();
      break;

    case MSGID_HIDE_CONSOLE:
      hideConsole();
      break;

    case MSGID_PRINT:
      printToConsoleOutput(message.data.msgData);
      break;

    case MSGID_INPUT_REQUEST:
      openConsoleInput();
      break;

    case MSGID_CLEAR_CONSOLE:
      clearConsoleOutput();
      break;

    case MSGID_SHOW_CANVAS:
      showCanvas();
      break;

    case MSGID_HIDE_CANVAS:
      hideCanvas();
      break;

    case MSGID_SET_CANVAS_WIDTH:
      setCanvasWidth(message.data.msgData);
      break;

    case MSGID_SET_CANVAS_HEIGHT:
      setCanvasHeight(message.data.msgData);
      break;

    case MSGID_CLEAR_CANVAS:
      clearCanvas();
      break;

    case MSGID_LOAD_IMAGE_REQUEST:
      loadImage(message.data.msgData[0], message.data.msgData[1]);
      break;

    case MSGID_UNLOAD_IMAGE_REQUEST:
      unloadImage(message.data.msgData);
      break;

    case MSGID_DRAW_IMAGE_REQUEST:
      drawImage(message.data.msgData[0], message.data.msgData[1], message.data.msgData[2], message.data.msgData[3], message.data.msgData[4]);
      break;

    case MSGID_DRAW_IMAGE_CLIP_REQUEST:
      drawImageClip(message.data.msgData[0], message.data.msgData[1], message.data.msgData[2], message.data.msgData[3], message.data.msgData[4],
                    message.data.msgData[5], message.data.msgData[6], message.data.msgData[7], message.data.msgData[8]);
      break;

    case MSGID_DRAW_IMAGE_TILED_REQUEST:
      drawImageTiled(message.data.msgData[0], message.data.msgData[1], message.data.msgData[2], message.data.msgData[3], message.data.msgData[4],
                    message.data.msgData[5], message.data.msgData[6]);
      break;

    case MSGID_GET_IMAGE_WIDTH_REQUEST:
      getImageWidth(message.data.msgData);
      break;

    case MSGID_GET_IMAGE_HEIGHT_REQUEST:
      getImageHeight(message.data.msgData);
      break;

    case MSGID_ENABLE_CANVAS_BUFFER:
      enableCanvasBuffer();
      break;

    case MSGID_DISABLE_CANVAS_BUFFER:
      disableCanvasBuffer();
      break;

    case MSGID_DRAW_CANVAS_BUFFER:
      drawCanvasBuffer();
      break;

    case MSGID_ADD_CANVAS_EVENT:
      addCanvasEvent(message.data.msgData);
      break;

    case MSGID_REMOVE_CANVAS_EVENT:
      removeCanvasEvent(message.data.msgData);
      break;

    case MSGID_DRAW_TEXT:
      drawText(message.data.msgData[0], message.data.msgData[1], message.data.msgData[2], message.data.msgData[3]);
      break;

    case MSGID_DRAW_RECT:
      drawRect(message.data.msgData[0], message.data.msgData[1], message.data.msgData[2], message.data.msgData[3], message.data.msgData[4]);
      break;

    case MSGID_DRAW_CIRCLE:
      drawCircle(message.data.msgData[0], message.data.msgData[1], message.data.msgData[2], message.data.msgData[3]);
      break;

    case MSGID_DRAW_LINE:
      drawLine(message.data.msgData[0], message.data.msgData[1], message.data.msgData[2], message.data.msgData[3]);
      break;

    case MSGID_SET_TEXT_FONT:
      setTextFont(message.data.msgData);
      break;

    case MSGID_SET_FILL_COLOR:
      setFillColor(message.data.msgData);
      break;

    case MSGID_SET_LINE_COLOR:
      setLineColor(message.data.msgData);
      break;

    case MSGID_SET_LINE_SIZE:
      setLineSize(message.data.msgData);
      break;

    case MSGID_LOAD_SOUND_REQUEST:
      loadSound(message.data.msgData[0], message.data.msgData[1]);
      break;

    case MSGID_UNLOAD_SOUND_REQUEST:
      unloadSound(message.data.msgData);
      break;

    case MSGID_PLAY_SOUND_REQUEST:
      playSound(message.data.msgData);
      break;

    case MSGID_PAUSE_SOUND_REQUEST:
      pauseSound(message.data.msgData);
      break;

    case MSGID_STOP_SOUND_REQUEST:
      stopSound(message.data.msgData);
      break;

    case MSGID_GET_SOUND_LEN_REQUEST:
      getSoundLen(message.data.msgData);
      break;

    case MSGID_GET_SOUND_POS_REQUEST:
      getSoundPos(message.data.msgData);
      break;

    case MSGID_SET_SOUND_POS_REQUEST:
      setSoundPos(message.data.msgData[0], message.data.msgData[1]);
      break;

    case MSGID_LOOP_SOUND_REQUEST:
      loopSound(message.data.msgData[0], message.data.msgData[1]);
      break;

    case MSGID_SPRITE_SHEET_REF_REQUEST:
      spriteSheetRefRequest(message.data.msgData[0], message.data.msgData[1]);
      break;

    case MSGID_LOAD_SPRITE_SHEET_REQUEST:
      loadSpriteSheet(message.data.msgData[0], message.data.msgData[1], message.data.msgData[2], message.data.msgData[3]);
      break;

    case MSGID_UNLOAD_SPRITE_SHEET_REQUEST:
      unloadSpriteSheet(message.data.msgData);
      break;

    case MSGID_DRAW_SPRITE_SHEET_FRAMES_REQUEST:
      drawSpriteSheetFrames(message.data.msgData);
      break;

    case MSGID_GET_SPRITE_SHEET_FRAME_WIDTH_REQUEST:
      getSpriteSheetFrameWidth(message.data.msgData);
      break;

    case MSGID_GET_SPRITE_SHEET_FRAME_HEIGHT_REQUEST:
      getSpriteSheetFrameHeight(message.data.msgData);
      break;

    case MSGID_DEBUG_UPDATE_DISPLAYS:
      onDebugUpdateDisplays(message.data.msgData);
      break;

    case MSGID_DEBUG_USER_FUNC_CALL:
      onDebugUserFuncCall(message.data.msgData);
      break;
      
    case MSGID_DEBUG_USER_FUNC_RETURN:
      onDebugUserFuncReturn();
      break;
      
    case MSGID_DEBUG_SOURCE_LINE_CHANGE:
      onDebugSourceLineChange(message.data.msgData);
      break;
  }
}

function onProgDoneSuccess()
//The worker thread has signaled that the program has completed successfully
{
  stopProg("Program run successfully.");
}

function onProgDoneError(error)
//The worker thread has signaled that the program has stopped with an error
{
  selectEditorLine(error.sourceLineNum);
  stopProg(error.message);
}

function onStatusChange(statusStr)
//Display a status change
{
  statusBar.innerHTML = statusStr;
}

