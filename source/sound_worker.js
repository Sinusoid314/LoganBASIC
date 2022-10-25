const soundNativeFuncs = [
                  new ObjNativeFunc("loadSound", 2, 2, funcLoadSound),
                  new ObjNativeFunc("unloadSound", 1, 1, funcUnloadSound),
                  new ObjNativeFunc("playSound", 1, 1, funcPlaySound),
                  new ObjNativeFunc("pauseSound", 1, 1, funcPauseSound),
                  new ObjNativeFunc("stopSound", 1, 1, funcStopSound),
                  new ObjNativeFunc("getSoundLen", 1, 1, funcGetSoundLen),
                  new ObjNativeFunc("getSoundPos", 1, 1, funcGetSoundPos),
                  new ObjNativeFunc("setSoundPos", 2, 2, funcSetSoundPos),
                  new ObjNativeFunc("loopSound", 2, 2, funcLoopSound)
                 ];

var soundResultCallback = null;

function resetSounds()
//
{
  soundResultCallback = null;
}

function onMsgSoundRequestResult(msgData)
//
{
  if(msgData.errorMsg != "")
    soundResultCallback.vm.runError(msgData.errorMsg);
  else
  {
    soundResultCallback.vm.stack[soundResultCallback.vm.stack.length - 1] = msgData.resultVal;
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
  sendSoundRequest(vm, MSGID_LOAD_SOUND_REQUEST, {soundName: args[0], soundSource: args[1]});
  return false;
}

function funcUnloadSound(vm, args)
//Send a message to the UI thread to unload a sound
{
  sendSoundRequest(vm, MSGID_UNLOAD_SOUND_REQUEST, {soundName: args[0]});
  return 0;
}

function funcPlaySound(vm, args)
//
{
  sendSoundRequest(vm, MSGID_PLAY_SOUND_REQUEST, {soundName: args[0]});
  return 0;
}

function funcPauseSound(vm, args)
//
{
  sendSoundRequest(vm, MSGID_PAUSE_SOUND_REQUEST, {soundName: args[0]});
  return 0;
}

function funcStopSound(vm, args)
//
{
  sendSoundRequest(vm, MSGID_STOP_SOUND_REQUEST, {soundName: args[0]});
  return 0;
}

function funcGetSoundLen(vm, args)
//
{
  sendSoundRequest(vm, MSGID_GET_SOUND_LEN_REQUEST, {soundName: args[0]});
  return 0;
}

function funcGetSoundPos(vm, args)
//
{
  sendSoundRequest(vm, MSGID_GET_SOUND_POS_REQUEST, {soundName: args[0]});
  return 0;
}

function funcSetSoundPos(vm, args)
//
{
  sendSoundRequest(vm, MSGID_SET_SOUND_POS_REQUEST, {soundName: args[0], soundPos: args[1]});
  return 0;
}

function funcLoopSound(vm, args)
//
{
  sendSoundRequest(vm, MSGID_LOOP_SOUND_REQUEST, {soundName: args[0], isLooped: args[1]});
  return 0;
}

