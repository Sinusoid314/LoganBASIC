import * as Objects from "../core/objects.js";
import * as VM from "../core/vm.js";
import * as MainWorker from "../main_worker.js";
import * as SoundCommon from "./sound_common.js";


const soundNativeFuncs = [
                  new Objects.ObjNativeFunc("loadSound", 2, 2, funcLoadSound),
                  new Objects.ObjNativeFunc("unloadSound", 1, 1, funcUnloadSound),
                  new Objects.ObjNativeFunc("playSound", 1, 1, funcPlaySound),
                  new Objects.ObjNativeFunc("pauseSound", 1, 1, funcPauseSound),
                  new Objects.ObjNativeFunc("stopSound", 1, 1, funcStopSound),
                  new Objects.ObjNativeFunc("getSoundLen", 1, 1, funcGetSoundLen),
                  new Objects.ObjNativeFunc("getSoundPos", 1, 1, funcGetSoundPos),
                  new Objects.ObjNativeFunc("setSoundPos", 2, 2, funcSetSoundPos),
                  new Objects.ObjNativeFunc("loopSound", 2, 2, funcLoopSound)
                 ];

var soundResultCallback = null;

MainWorker.mainVM.addNativeFuncArray(soundNativeFuncs);

setSoundWorkerEvents();


function setSoundWorkerEvents()
//
{
  MainWorker.workerOnProgEndHandlers.push(soundWorker_onProgEnd);

  MainWorker.workerMessageMap.set(SoundCommon.MSGID_SOUND_REQUEST_RESULT, onMsgSoundRequestResult);
}

function soundWorker_onProgEnd()
//
{
  soundResultCallback = null;
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
    soundResultCallback = new VM.CallbackContext(vm);
  else
    soundResultCallback.vm = vm;

  postMessage({msgId: msgId, msgData: msgData});

  MainWorker.setExpectedResultMessageID(SoundCommon.MSGID_SOUND_REQUEST_RESULT);
  vm.runLoopExitFlag = true;
}

function funcLoadSound(vm, args)
//Send a message to the UI thread to load a sound
{
  sendSoundRequest(vm, SoundCommon.MSGID_LOAD_SOUND_REQUEST, {soundName: args[0], soundSource: args[1]});
  return undefined;
}

function funcUnloadSound(vm, args)
//Send a message to the UI thread to unload a sound
{
  sendSoundRequest(vm, SoundCommon.MSGID_UNLOAD_SOUND_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcPlaySound(vm, args)
//
{
  sendSoundRequest(vm, SoundCommon.MSGID_PLAY_SOUND_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcPauseSound(vm, args)
//
{
  sendSoundRequest(vm, SoundCommon.MSGID_PAUSE_SOUND_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcStopSound(vm, args)
//
{
  sendSoundRequest(vm, SoundCommon.MSGID_STOP_SOUND_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcGetSoundLen(vm, args)
//
{
  sendSoundRequest(vm, SoundCommon.MSGID_GET_SOUND_LEN_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcGetSoundPos(vm, args)
//
{
  sendSoundRequest(vm, SoundCommon.MSGID_GET_SOUND_POS_REQUEST, {soundName: args[0]});
  return undefined;
}

function funcSetSoundPos(vm, args)
//
{
  sendSoundRequest(vm, SoundCommon.MSGID_SET_SOUND_POS_REQUEST, {soundName: args[0], soundPos: args[1]});
  return undefined;
}

function funcLoopSound(vm, args)
//
{
  sendSoundRequest(vm, SoundCommon.MSGID_LOOP_SOUND_REQUEST, {soundName: args[0], isLooped: args[1]});
  return undefined;
}

