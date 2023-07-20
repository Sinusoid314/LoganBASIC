var sounds = new Map();

uiMessageMap.set(MSGID_LOAD_SOUND_REQUEST, onMsgLoadSoundRequest);
uiMessageMap.set(MSGID_UNLOAD_SOUND_REQUEST, onMsgUnloadSoundRequest);
uiMessageMap.set(MSGID_PLAY_SOUND_REQUEST, onMsgPlaySoundRequest);
uiMessageMap.set(MSGID_PAUSE_SOUND_REQUEST, onMsgPauseSoundRequest);
uiMessageMap.set(MSGID_STOP_SOUND_REQUEST, onMsgStopSoundRequest);
uiMessageMap.set(MSGID_GET_SOUND_LEN_REQUEST, onMsgGetSoundLenRequest);
uiMessageMap.set(MSGID_GET_SOUND_POS_REQUEST, onMsgGetSoundPosRequest);
uiMessageMap.set(MSGID_SET_SOUND_POS_REQUEST, onMsgSetSoundPosRequest);
uiMessageMap.set(MSGID_LOOP_SOUND_REQUEST, onMsgLoopSoundRequest);


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
  progWorker.postMessage({msgId: MSGID_SOUND_REQUEST_RESULT, msgData: {resultVal: resultVal, errorMsg: errorMsg}});
}

function sound_onLoad(event)
//
{
  if(!isRunning)
    return;

  event.target.removeEventListener("canplaythrough", sound_onLoad);
  event.target.removeEventListener("error", sound_onError);

  sounds.set(event.target.id, event.target);

  sendSoundRequestResult(true)
}

function sound_onError(event)
//
{
  if(!isRunning)
    return;

  event.target.removeEventListener("canplaythrough", sound_onLoad);
  event.target.removeEventListener("error", sound_onError);

  sendSoundRequestResult(false)
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

