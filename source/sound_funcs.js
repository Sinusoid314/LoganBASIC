const soundNativeFuncs = [
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
    soundResultCallback.vm.endWithError(result[0], false);
  else
  {
    soundResultCallback.vm.stack[soundResultCallback.vm.stack.length - 1] = result[1];
    soundResultCallback.runFunc();
  }
}

function sendSoundRequest(vm, msgId, msgData)
//
{
  if(soundResultCallback == null)
    soundResultCallback = new CallbackContext(vm);
  else
    soundResultCallback.vm = vm;

  postMessage({msgId: msgId, msgData: msgData});

  vm.changeStatus(VM_STATUS_IDLE);
}

function funcLoadSound(vm, args)
//Send a message to the UI thread to load a sound
{
  var soundName = args[0];
  var soundSource = args[1];

  sendSoundRequest(vm, MSGID_LOAD_SOUND_REQUEST, [soundName, soundSource]);

  return false;
}

function funcUnloadSound(vm, args)
//Send a message to the UI thread to unload a sound
{
  var soundName = args[0];

  sendSoundRequest(vm, MSGID_UNLOAD_SOUND_REQUEST, soundName);

  return 0;
}

function funcPlaySound(vm, args)
//
{
  var soundName = args[0];

  sendSoundRequest(vm, MSGID_PLAY_SOUND_REQUEST, soundName);

  return 0;
}

function funcPauseSound(vm, args)
//
{
  var soundName = args[0];

  sendSoundRequest(vm, MSGID_PAUSE_SOUND_REQUEST, soundName);

  return 0;
}

function funcStopSound(vm, args)
//
{
  var soundName = args[0];

  sendSoundRequest(vm, MSGID_STOP_SOUND_REQUEST, soundName);

  return 0;
}

function funcGetSoundLen(vm, args)
//
{
  var soundName = args[0];

  sendSoundRequest(vm, MSGID_GET_SOUND_LEN_REQUEST, soundName);

  return 0;
}

function funcGetSoundPos(vm, args)
//
{
  var soundName = args[0];

  sendSoundRequest(vm, MSGID_GET_SOUND_POS_REQUEST, soundName);

  return 0;
}

function funcSetSoundPos(vm, args)
//
{
  var soundName = args[0];
  var soundPos = args[1];

  sendSoundRequest(vm, MSGID_SET_SOUND_POS_REQUEST, [soundName, soundPos]);

  return 0;
}

function funcLoopSound(vm, args)
//
{
  var soundName = args[0];
  var isLooped = args[1];

  sendSoundRequest(vm, MSGID_LOOP_SOUND_REQUEST, [soundName, isLooped]);

  return 0;
}

