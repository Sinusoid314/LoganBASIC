var sounds = new Map();

function cleanupSounds()
//Unload all sounds
{
  sounds.clear();
}

function sound_onLoad(event)
//
{
  this.removeEventListener("canplaythrough", sound_onLoad);
  this.removeEventListener("error", sound_onError);

  sounds.set(this.id, this);

  sendSoundRequestResult(true)
}

function sound_onError(event)
//
{
  this.removeEventListener("canplaythrough", sound_onLoad);
  this.removeEventListener("error", sound_onError);

  sendSoundRequestResult(false)
}

function sendSoundRequestResult(resultVal, errorMsg = "")
//
{
  progWorker.postMessage({msgId: MSGID_SOUND_REQUEST_RESULT, msgData: {resultVal: resultVal, errorMsg: errorMsg}});
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
    sound.pause();
    sound.currentTime = sound.duration;
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

