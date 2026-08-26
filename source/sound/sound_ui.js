import * as MainUI from "../main_ui.js";
import * as SoundCommon from "./sound_ui.js";


var sounds = new Map();

setSoundUIEvents();


function setSoundUIEvents()
//
{
  MainUI.uiOnProgEndHandlers.push(soundUI_onProgEnd);

  MainUI.uiMessageMap.set(SoundCommon.MSGID_LOAD_SOUND_REQUEST, onMsgLoadSoundRequest);
  MainUI.uiMessageMap.set(SoundCommon.MSGID_UNLOAD_SOUND_REQUEST, onMsgUnloadSoundRequest);
  MainUI.uiMessageMap.set(SoundCommon.MSGID_PLAY_SOUND_REQUEST, onMsgPlaySoundRequest);
  MainUI.uiMessageMap.set(SoundCommon.MSGID_PAUSE_SOUND_REQUEST, onMsgPauseSoundRequest);
  MainUI.uiMessageMap.set(SoundCommon.MSGID_STOP_SOUND_REQUEST, onMsgStopSoundRequest);
  MainUI.uiMessageMap.set(SoundCommon.MSGID_GET_SOUND_LEN_REQUEST, onMsgGetSoundLenRequest);
  MainUI.uiMessageMap.set(SoundCommon.MSGID_GET_SOUND_POS_REQUEST, onMsgGetSoundPosRequest);
  MainUI.uiMessageMap.set(SoundCommon.MSGID_SET_SOUND_POS_REQUEST, onMsgSetSoundPosRequest);
  MainUI.uiMessageMap.set(SoundCommon.MSGID_LOOP_SOUND_REQUEST, onMsgLoopSoundRequest);
}

function cleanupSounds()
//Unload all sounds
{
  for (const [id, sound] of sounds)
    sound.src = "";

  sounds.clear();
}

function sendSoundRequestResult(resultVal, errorMsg = "")
//
{
  MainUI.progWorker.postMessage({msgId: SoundCommon.MSGID_SOUND_REQUEST_RESULT, msgData: {resultVal: resultVal, errorMsg: errorMsg}});
}

function sound_onLoad(event)
//
{
  if(!MainUI.isRunning)
    return;

  event.target.removeEventListener("canplaythrough", sound_onLoad);
  event.target.removeEventListener("error", sound_onError);

  sounds.set(event.target.id, event.target);

  sendSoundRequestResult(true)
}

function sound_onError(event)
//
{
  if(!MainUI.isRunning)
    return;

  event.target.removeEventListener("canplaythrough", sound_onLoad);
  event.target.removeEventListener("error", sound_onError);

  sendSoundRequestResult(false)
}

function soundUI_onProgEnd(exitStatus, error)
//
{
  cleanupSounds();
}

function onMsgLoadSoundRequest(msgData)
//Load an audio element
{
  var newSound;

  if(!sounds.has(msgData.soundName))
  {
    newSound = new Audio();

    newSound.addEventListener("canplaythrough", sound_onLoad);
    newSound.addEventListener("error", sound_onError);

    newSound.id = msgData.soundName;
    newSound.src = msgData.soundSource;
  }
  else
    sendSoundRequestResult(null, "Sound '" + msgData.soundName + "' has already been loaded.");
}

function onMsgUnloadSoundRequest(msgData)
//Unload an audio element
{
  var sound;

  if(sounds.has(msgData.soundName))
  {
    sound = sounds.get(msgData.soundName)
    sound.src = "";
    sounds.delete(msgData.soundName);

    sendSoundRequestResult(0);
  }
  else
    sendSoundRequestResult(null, "Sound '" + msgData.soundName + "' has not been loaded.");
}

function onMsgPlaySoundRequest(msgData)
//
{
  if(sounds.has(msgData.soundName))
  {
    sounds.get(msgData.soundName).play();
    sendSoundRequestResult(0);
  }
  else
    sendSoundRequestResult(null, "Sound '" + msgData.soundName + "' has not been loaded.");
}

function onMsgPauseSoundRequest(msgData)
//
{
  if(sounds.has(msgData.soundName))
  {
    sounds.get(msgData.soundName).pause();
    sendSoundRequestResult(0);
  }
  else
    sendSoundRequestResult(null, "Sound '" + msgData.soundName + "' has not been loaded.");
}

function onMsgStopSoundRequest(msgData)
//
{
  if(sounds.has(msgData.soundName))
  {
    sounds.get(msgData.soundName).pause();
    sounds.get(msgData.soundName).currentTime = 0;
    sendSoundRequestResult(0);
  }
  else
    sendSoundRequestResult(null, "Sound '" + msgData.soundName + "' has not been loaded.");
}

function onMsgGetSoundLenRequest(msgData)
//
{
  if(sounds.has(msgData.soundName))
    sendSoundRequestResult(sounds.get(msgData.soundName).duration);
  else
    sendSoundRequestResult(null, "Sound '" + msgData.soundName + "' has not been loaded.");
}

function onMsgGetSoundPosRequest(msgData)
//
{
  if(sounds.has(msgData.soundName))
    sendSoundRequestResult(sounds.get(msgData.soundName).currentTime);
  else
    sendSoundRequestResult(null, "Sound '" + msgData.soundName + "' has not been loaded.");
}

function onMsgSetSoundPosRequest(msgData)
//
{
  if(sounds.has(msgData.soundName))
  {
    sounds.get(msgData.soundName).currentTime = msgData.soundPos;
    sendSoundRequestResult(0);
  }
  else
    sendSoundRequestResult(null, "Sound '" + msgData.soundName + "' has not been loaded.");
}

function onMsgLoopSoundRequest(msgData)
//
{
  if(sounds.has(msgData.soundName))
  {
    sounds.get(msgData.soundName).loop = msgData.isLooped;
    sendSoundRequestResult(0);
  }
  else
    sendSoundRequestResult(null, "Sound '" + msgData.soundName + "' has not been loaded.");
}

