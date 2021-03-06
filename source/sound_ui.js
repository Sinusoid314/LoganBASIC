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

  sendSoundRequestResult(["", true])
}

function sound_onError(event)
//
{
  this.removeEventListener("canplaythrough", sound_onLoad);
  this.removeEventListener("error", sound_onError);

  sendSoundRequestResult(["", false])
}

function sendSoundRequestResult(msgData)
//
{
  progWorker.postMessage({msgId: MSGID_SOUND_REQUEST_RESULT, msgData: msgData});
}

function loadSound(soundName, soundSource)
//Load an audio element
{
  var newSound;

  if(!sounds.has(soundName))
  {
    newSound = new Audio();

    newSound.addEventListener("canplaythrough", sound_onLoad);
    newSound.addEventListener("error", sound_onError);

    newSound.id = soundName;
    newSound.src = soundSource;
  }
  else
    sendSoundRequestResult(["Sound '" + soundName + "' has already been loaded."]);
}

function unloadSound(soundName)
//Unload an audio element
{
  var sound;

  if(sounds.has(soundName))
  {
    sound = sounds.get(soundName)
    sound.pause();
    sound.currentTime = sound.duration;
    sounds.delete(soundName);

    sendSoundRequestResult(["", 0]);
  }
  else
    sendSoundRequestResult(["Sound '" + soundName + "' has not been loaded."]);
}

function playSound(soundName)
//
{
  if(sounds.has(soundName))
  {
    sounds.get(soundName).play();
    sendSoundRequestResult(["", 0]);
  }
  else
    sendSoundRequestResult(["Sound '" + soundName + "' has not been loaded."]);
}

function pauseSound(soundName)
//
{
  if(sounds.has(soundName))
  {
    sounds.get(soundName).pause();
    sendSoundRequestResult(["", 0]);
  }
  else
    sendSoundRequestResult(["Sound '" + soundName + "' has not been loaded."]);
}

function stopSound(soundName)
//
{
  if(sounds.has(soundName))
  {
    sounds.get(soundName).pause();
    sounds.get(soundName).currentTime = 0;
    sendSoundRequestResult(["", 0]);
  }
  else
    sendSoundRequestResult(["Sound '" + soundName + "' has not been loaded."]);
}

function getSoundLen(soundName)
//
{
  if(sounds.has(soundName))
    sendSoundRequestResult(["", sounds.get(soundName).duration]);
  else
    sendSoundRequestResult(["Sound '" + soundName + "' has not been loaded."]);
}

function getSoundPos(soundName)
//
{
  if(sounds.has(soundName))
    sendSoundRequestResult(["", sounds.get(soundName).currentTime]);
  else
    sendSoundRequestResult(["Sound '" + soundName + "' has not been loaded."]);
}

function setSoundPos(soundName, soundPos)
//
{
  if(sounds.has(soundName))
  {
    sounds.get(soundName).currentTime = soundPos;
    sendSoundRequestResult(["", 0]);
  }
  else
    sendSoundRequestResult(["Sound '" + soundName + "' has not been loaded."]);
}

function loopSound(soundName, isLooped)
//
{
  if(sounds.has(soundName))
  {
    sounds.get(soundName).loop = isLooped;
    sendSoundRequestResult(["", 0]);
  }
  else
    sendSoundRequestResult(["Sound '" + soundName + "' has not been loaded."]);
}

