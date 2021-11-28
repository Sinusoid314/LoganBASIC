var sounds = [];

function cleanupSounds()
//Unload all sounds
{
  if(sounds.length > 0)
    sounds.splice(0);
}

function sound_onLoad(event)
//
{
  this.removeEventListener("canplaythrough", sound_onLoad);
  this.removeEventListener("error", sound_onError);

  sounds.push(this);

  progWorker.postMessage({msgId: MSGID_LOAD_SOUND_RESULT, msgData: [true, this.duration]});
}

function sound_onError(event)
//
{
  this.removeEventListener("canplaythrough", sound_onLoad);
  this.removeEventListener("error", sound_onError);

  progWorker.postMessage({msgId: MSGID_LOAD_SOUND_RESULT, msgData: [false]});
}

function loadSound(soundSource)
//Load an audio element
{
  var newSound = new Audio();

  newSound.addEventListener("canplaythrough", sound_onLoad);
  newSound.addEventListener("error", sound_onError);

  newSound.src = soundSource;
}

function unloadSound(soundIndex)
//Unload an audio element
{
  sounds[soundIndex].pause();
  sounds[soundIndex].currentTime = sounds[soundIndex].duration;
  sounds.splice(soundIndex, 1);
}

function playSound(soundIndex)
//
{
  sounds[soundIndex].play();
}

function pauseSound(soundIndex)
//
{
  sounds[soundIndex].pause();
}

function stopSound(soundIndex)
//
{
  sounds[soundIndex].pause();
  sounds[soundIndex].currentTime = 0;
}

function getSoundPos(soundIndex)
//
{
  progWorker.postMessage({msgId: MSGID_GET_SOUND_POS_RESULT, msgData: sounds[soundIndex].currentTime});
}

function setSoundPos(soundIndex, newPos)
//
{
  sounds[soundIndex].currentTime = newPos;
}

function loopSound(soundIndex, isLooped)
//
{
  sounds[soundIndex].loop = isLooped;
}

