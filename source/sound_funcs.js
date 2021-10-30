var soundNativeFuncs = [
                  new ObjNativeFunc("loadsound", 2, 2, funcLoadSound),
                  new ObjNativeFunc("unloadsound", 1, 1, funcUnloadSound)
                 ];

var soundNames = [];
var soundLengths = [];
var loadSoundCallback = null;

function onLoadSoundResult(resultData)
//
{
  if(!resultData[0])
    soundNames.pop();
  else
    soundLengths.push(resultData[1]);

  loadSoundCallback.runtime.stack[loadSoundCallback.runtime.stack.length - 1] = resultData[0];
  loadSoundCallback.runFunc();
}

function funcLoadSound(runtime, args)
//Send a message to the UI thread to load a sound
{
  var soundName = args[0];
  var soundSource = args[1];

  if(soundNames.indexOf(imageName) != -1)
    runtime.raiseError("Sound '" + soundName + "' is already loaded.");

  soundNames.push(soundName);

  if(loadSoundCallback == null)
    loadSoundCallback = new CallbackContext(runtime);
  else
    loadSoundCallback.runtime = runtime;

  postMessage({msgId: MSGID_LOAD_SOUND_REQUEST, msgData: soundSource});

  runtime.status = RUNTIME_STATUS_PAUSED;

  return false;
}

function funcUnloadSound(runtime, args)
//Send a message to the UI thread to unload a sound
{
  var soundName = args[0];
  var soundNameIndex = soundNames.indexOf(imageName);

  if(soundNameIndex == -1)
    runtime.raiseError("Sound '" + soundName + "' does not exist.");

  soundNames.splice(soundNameIndex, 1);
  postMessage({msgId: MSGID_UNLOAD_SOUND, msgData: soundNameIndex});

  return 0;
}

