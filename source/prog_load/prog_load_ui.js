import * as MainUI from "../main_ui.js";
import * as ThreadMsgUI from "../thread_msg/thread_msg_ui.js";
import * as ProgLoadCommon from "./prog_load_common.js";

export const PROG_EXIT_STATUS_SUCCESS = 1;
export const PROG_EXIT_STATUS_ERROR = 2;
export const PROG_EXIT_STATUS_TERMINATED = 3;

export var isRunning = false;
export const uiOnProgStartHandlers = [];
export const uiOnProgEndHandlers = [];

export function startProg(source)
//Signal the worker thread to start the program
{
  if(isRunning)
    return;

  uiOnProgStartHandlers.forEach(handler => handler());

  ThreadMsgUI.progWorker.postMessage({msgId: ProgLoadCommon.MSGID_START_PROG, msgData: {source: source}});

  isRunning = true;
}

export function endProg(exitMessage, exitStatus, error)
//Set the UI to reflect that the program has stopped running
{
  if(!isRunning)
    return;

  MainUI.statusBar.innerText = exitMessage;

  if(exitStatus == PROG_EXIT_STATUS_TERMINATED)
  {
    ThreadMsgUI.progWorker.terminate();
    ThreadMsgUI.initWorker();
  }

  uiOnProgEndHandlers.forEach(handler => handler(exitStatus, error));

  isRunning = false;
}


setEvents();


function setEvents()
//
{
  ThreadMsgUI.uiMessageMap.set(ProgLoadCommon.MSGID_PROG_DONE, onMsgProgDone);
  ThreadMsgUI.uiMessageMap.set(ProgLoadCommon.MSGID_STATUS_CHANGE, onMsgStatusChange);
}

function onMsgProgDone(msgData)
//The worker thread has signaled that the program has ended
{
  if(msgData.error)
    endProg(msgData.error.message, PROG_EXIT_STATUS_ERROR, msgData.error);
  else
    endProg("Program run successfully.", PROG_EXIT_STATUS_SUCCESS, null);
}

function onMsgStatusChange(msgData)
//Display a status change
{
  MainUI.statusBar.innerText = msgData.statusText;
}
