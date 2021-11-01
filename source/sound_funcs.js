var soundNativeFuncs = [
                  new ObjNativeFunc("loadsound", 2, 2, funcLoadSound),
                  new ObjNativeFunc("unloadsound", 1, 1, funcUnloadSound),
                  new ObjNativeFunc("playsound", 1, 1, funcPlaySound),
                  new ObjNativeFunc("pausesound", 1, 1, funcPauseSound),
                  new ObjNativeFunc("stopsound", 1, 1, funcStopSound),
                  new ObjNativeFunc("getsoundlen", 1, 1, funcGetSoundLen),
                  new ObjNativeFunc("getsoundpos", 1, 1, funcGetSoundPos),
                  new ObjNativeFunc("setsoundpos", 2, 2, funcSetSoundPos),
                  new ObjNativeFunc("loopsound", 2, 2, funcLoopSound)
                 ];

var soundNames = [];
var soundLengths = [];
var soundResultCallback = null;

function onLoadSoundResult(resultData)
//
{
  if(!resultData[0])
    soundNames.pop();
  else
    soundLengths.push(resultData[1]);

  soundResultCallback.runtime.stack[soundResultCallback.runtime.stack.length - 1] = resultData[0];
  soundResultCallback.runFunc();
}

function onGetSoundPosResult(resultData)
//
{
  soundResultCallback.runtime.stack[soundResultCallback.runtime.stack.length - 1] = resultData;
  soundResultCallback.runFunc();
}

function getSoundIndex(soundName)
//Return the index of the given sound item
{
  soundName = soundName.toLowerCase();

  for(var soundIndex = 0; soundIndex < soundNames.length; soundIndex++)
  {
    if(soundNames[soundIndex].toLowerCase() == soundName)
      return soundIndex;
  }

  return -1;
}

function funcLoadSound(runtime, args)
//Send a message to the UI thread to load a sound
{
  var soundName = args[0];
  var soundSource = args[1];

  if(getSoundIndex(soundName) != -1)
    runtime.raiseError("Sound '" + soundName + "' is already loaded.");

  soundNames.push(soundName);

  if(soundResultCallback == null)
    soundResultCallback = new CallbackContext(runtime);
  else
    soundResultCallback.runtime = runtime;

  postMessage({msgId: MSGID_LOAD_SOUND_REQUEST, msgData: soundSource});

  runtime.status = RUNTIME_STATUS_PAUSED;

  return false;
}

function funcUnloadSound(runtime, args)
//Send a message to the UI thread to unload a sound
{
  var soundName = args[0];
  var soundIndex = getSoundIndex(soundName);

  if(soundIndex == -1)
    runtime.raiseError("Sound '" + soundName + "' does not exist.");

  soundNames.splice(soundIndex, 1);

  postMessage({msgId: MSGID_UNLOAD_SOUND, msgData: soundIndex});

  return 0;
}

function funcPlaySound(runtime, args)
//
{
  var soundName = args[0];
  var soundIndex = getSoundIndex(soundName);

  if(soundIndex == -1)
    runtime.raiseError("Sound '" + soundName + "' does not exist.");

  postMessage({msgId: MSGID_PLAY_SOUND, msgData: soundIndex});

  return 0;
}

function funcPauseSound(runtime, args)
//
{
  var soundName = args[0];
  var soundIndex = getSoundIndex(soundName);

  if(soundIndex == -1)
    runtime.raiseError("Sound '" + soundName + "' does not exist.");

  postMessage({msgId: MSGID_PAUSE_SOUND, msgData: soundIndex});

  return 0;
}

function funcStopSound(runtime, args)
//
{
  var soundName = args[0];
  var soundIndex = getSoundIndex(soundName);

  if(soundIndex == -1)
    runtime.raiseError("Sound '" + soundName + "' does not exist.");

  postMessage({msgId: MSGID_STOP_SOUND, msgData: soundIndex});

  return 0;
}

function funcGetSoundLen(runtime, args)
//
{
  var soundName = args[0];
  var soundIndex = getSoundIndex(soundName);

  if(soundIndex == -1)
    runtime.raiseError("Sound '" + soundName + "' does not exist.");

  return soundLengths[soundIndex];
}

function funcGetSoundPos(runtime, args)
//
{
  var soundName = args[0];
  var soundIndex = getSoundIndex(soundName);

  if(soundIndex == -1)
    runtime.raiseError("Sound '" + soundName + "' does not exist.");

  if(soundResultCallback == null)
    soundResultCallback = new CallbackContext(runtime);
  else
    soundResultCallback.runtime = runtime;

  postMessage({msgId: MSGID_GET_SOUND_POS, msgData: soundIndex});

  runtime.status = RUNTIME_STATUS_PAUSED;

  return 0;
}

function funcSetSoundPos(runtime, args)
//
{
  var soundName = args[0];
  var soundPos = args[1];
  var soundIndex = getSoundIndex(soundName);

  if(soundIndex == -1)
    runtime.raiseError("Sound '" + soundName + "' does not exist.");

  postMessage({msgId: MSGID_SET_SOUND_POS, msgData: [soundIndex, soundPos]});

  return 0;
}

function funcLoopSound(runtime, args)
//
{
  var soundName = args[0];
  var isLooped = args[1];
  var soundIndex = getSoundIndex(soundName);

  if(soundIndex == -1)
    runtime.raiseError("Sound '" + soundName + "' does not exist.");

  postMessage({msgId: MSGID_LOOP_SOUND, msgData: [soundIndex, isLooped]});

  return 0;
}

