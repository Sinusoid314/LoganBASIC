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

var soundResultCallback = null;

function onSoundRequestResult(result)
//
{
  if(result[0] != "")
  {
    soundResultCallback.endRuntime(result[0]);
  }
  else
  {
    soundResultCallback.runtime.stack[soundResultCallback.runtime.stack.length - 1] = result[1];
    soundResultCallback.runFunc();
  }
}

function sendSoundRequest(runtime, msgId, msgData)
//
{
  if(soundResultCallback == null)
    soundResultCallback = new CallbackContext(runtime);
  else
    soundResultCallback.runtime = runtime;

  postMessage({msgId: msgId, msgData: msgData});

  runtime.status = RUNTIME_STATUS_PAUSED;
}

function funcLoadSound(runtime, args)
//Send a message to the UI thread to load a sound
{
  var soundName = args[0];
  var soundSource = args[1];

  sendSoundRequest(runtime, MSGID_LOAD_SOUND_REQUEST, [soundName, soundSource]);

  return false;
}

function funcUnloadSound(runtime, args)
//Send a message to the UI thread to unload a sound
{
  var soundName = args[0];

  sendSoundRequest(runtime, MSGID_UNLOAD_SOUND_REQUEST, soundName);

  return 0;
}

function funcPlaySound(runtime, args)
//
{
  var soundName = args[0];

  sendSoundRequest(runtime, MSGID_PLAY_SOUND_REQUEST, soundName);

  return 0;
}

function funcPauseSound(runtime, args)
//
{
  var soundName = args[0];

  sendSoundRequest(runtime, MSGID_PAUSE_SOUND_REQUEST, soundName);

  return 0;
}

function funcStopSound(runtime, args)
//
{
  var soundName = args[0];

  sendSoundRequest(runtime, MSGID_STOP_SOUND_REQUEST, soundName);

  return 0;
}

function funcGetSoundLen(runtime, args)
//
{
  var soundName = args[0];

  sendSoundRequest(runtime, MSGID_GET_SOUND_LEN_REQUEST, soundName);

  return 0;
}

function funcGetSoundPos(runtime, args)
//
{
  var soundName = args[0];

  sendSoundRequest(runtime, MSGID_GET_SOUND_POS_REQUEST, soundName);

  return 0;
}

function funcSetSoundPos(runtime, args)
//
{
  var soundName = args[0];
  var soundPos = args[1];

  sendSoundRequest(runtime, MSGID_SET_SOUND_POS_REQUEST, [soundName, soundPos]);

  return 0;
}

function funcLoopSound(runtime, args)
//
{
  var soundName = args[0];
  var isLooped = args[1];

  sendSoundRequest(runtime, MSGID_LOOP_SOUND_REQUEST, [soundName, isLooped]);

  return 0;
}

