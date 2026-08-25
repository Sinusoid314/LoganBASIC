//UI -> Worker messages
export const MSGID_DEBUG_ENABLE = "DEBUG_ENABLE";
export const MSGID_DEBUG_DISABLE = "DEBUG_DISABLE";
export const MSGID_DEBUG_RESUME = "DEBUG_RESUME";
export const MSGID_DEBUG_STEP_INTO = "DEBUG_STEP_INTO";
export const MSGID_DEBUG_STEP_OVER = "DEBUG_STEP_OVER";
export const MSGID_DEBUG_STEP_OUT = "DEBUG_STEP_OUT";
export const MSGID_DEBUG_SKIP = "DEBUG_SKIP";
export const MSGID_DEBUG_CALL_FRAME_INFO_REQUEST = "DEBUG_CALL_FRAME_INFO_REQUEST";
export const MSGID_DEBUG_ADD_BREAKPOINT = "DEBUG_ADD_BREAKPOINT";
export const MSGID_DEBUG_REMOVE_BREAKPOINT = "DEBUG_REMOVE_BREAKPOINT";

//Worker -> UI messages
export const MSGID_DEBUG_UPDATE_UI = "DEBUG_UPDATE_UI";

export const DEBUG_UI_STATUS_DISABLED = 1;
export const DEBUG_UI_STATUS_STEPPING = 2;
export const DEBUG_UI_STATUS_RESUMED = 3;
export const DEBUG_UI_STATUS_BREAKPOINT = 4;

export class DebugBreakpoint
{
  constructor(sourceLineNum, sourceName)
  {
    this.sourceLineNum = sourceLineNum;
    this.sourceName = sourceName;
  }

  matches(sourceLineNum, sourceName)
  {
    return (this.sourceLineNum == sourceLineNum) && (this.sourceName == sourceName);
  }
}