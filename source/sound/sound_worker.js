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

mainVM.addNativeFuncArray(soundNativeFuncs);

setSoundWorkerEvents();


function setSoundWorkerEvents()
//
{
  workerOnProgEndHandlers.push(soundWorker_onProgEnd);

  workerMessageMap.set(MSGID_SOUND_REQUEST_RESULT, onMsgSoundRequestResult);
}

function resetSounds()
//
{
  soundResultCallback = null;
}

function soundWorker_onProgEnd()
//
{
  resetSounds();
}

function onMsgSoundRequestResult(msgData)
//
{
  if(!soundResultCallback)
    return;

  if(msgData.errorMsg != "")
    soundResultCallback.vm.runError(msgData.errorMsg);
  else
  {
    soundResultCallback.vm.stack.push(msgData.resultVal);
    soundResultCallback.resumeVM();
  }
}

function sendSoundRequest(vm, msgId, msgData)
//
{
  if(!soundResultCallback)
    soundResultCallback = new CallbackContext(vm);
  else
    soundResultCallback.vm = vm;

  postMessage({msgId: msgId, msgData: msgData});

  expectedResultMessageID = MSGID_SOUND_REQUEST_RESULT;
  vm.runLoopExitFlag = true;
}

function funcLoadSound(vm, args)
//Send a message to the UI thread to load a sound
{
  sendSoundRequest(vm, MSGID_LOAD_SOUND_REQUEST, {soundName: args[0], soundSource: args[1]});
  return undefined;
}

function funcUnloadSound(vm, args)
//Send a message to the UI thread to unload a sound
{
  sendSoundRequest(vm, MSGID_UNLOAD_SOUND_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcPlaySound(vm, args)
//
{
  sendSoundRequest(vm, MSGID_PLAY_SOUND_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcPauseSound(vm, args)
//
{
  sendSoundRequest(vm, MSGID_PAUSE_SOUND_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcStopSound(vm, args)
//
{
  sendSoundRequest(vm, MSGID_STOP_SOUND_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcGetSoundLen(vm, args)
//
{
  sendSoundRequest(vm, MSGID_GET_SOUND_LEN_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcGetSoundPos(vm, args)
//
{
  sendSoundRequest(vm, MSGID_GET_SOUND_POS_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcSetSoundPos(vm, args)
//
{
  sendSoundRequest(vm, MSGID_SET_SOUND_POS_REQUEST, {soundName: args[0], soundPos: args[1]});
  return undefined;
}

function funcLoopSound(vm, args)
//
{
  sendSoundRequest(vm, MSGID_LOOP_SOUND_REQUEST, {soundName: args[0], isLooped: args[1]});
  return undefined;
}

