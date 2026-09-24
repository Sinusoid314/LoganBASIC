import * as ProgLoadUI from "../prog_load/prog_load_ui.js";
import * as MainCommon from "../main_common.js";


export var progWorker = null;
export const uiMessageMap = new Map();

export function initWorker()
//Initialize the worker thread
{
  progWorker = new Worker('../main_worker.js?mode=' + MainCommon.mainMode, {type: "module"});
  progWorker.onmessage = onThreadMessage;
}


initWorker();


function onThreadMessage(message)
//Process messages sent from the worker thread
{
  if(!ProgLoadUI.isRunning)
    return;

  uiMessageMap.get(message.data.msgId)(message.data.msgData);
}
