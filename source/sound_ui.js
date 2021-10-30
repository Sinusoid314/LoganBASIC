var sounds = [];

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
  sounds.splice(soundIndex, 1);
}

