export const MAIN_MODE_EDIT = 1;
export const MAIN_MODE_DEPLOY = 2;

export const mainSourceName = "<main>";
export const lbVersion = "2.2.0.3";

//UI -> Worker messages
export const MSGID_START_PROG = 1;

//Worker -> UI messages
export const MSGID_PROG_DONE = 1;
export const MSGID_STATUS_CHANGE = 2;

export var  mainMode = MAIN_MODE_EDIT;

export function setMainMode(newMode)
//
{
  mainMode = newMode;
}
