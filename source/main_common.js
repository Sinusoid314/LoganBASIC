export const MAIN_MODE_EDIT = 1;
export const MAIN_MODE_DEPLOY = 2;

export const mainSourceName = "<main>";
export const lbVersion = "2.2.0.3";

export var  mainMode = MAIN_MODE_EDIT;

export function setMainMode(newMode)
//
{
  mainMode = newMode;
}
