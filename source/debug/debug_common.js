//UI -> Worker messages
const MSGID_DEBUG_ENABLE = "DEBUG_ENABLE";
const MSGID_DEBUG_DISABLE = "DEBUG_DISABLE";
const MSGID_DEBUG_RESUME = "DEBUG_RESUME";
const MSGID_DEBUG_STEP_INTO = "DEBUG_STEP_INTO";
const MSGID_DEBUG_STEP_OVER = "DEBUG_STEP_OVER";
const MSGID_DEBUG_STEP_OUT = "DEBUG_STEP_OUT";
const MSGID_DEBUG_SKIP = "DEBUG_SKIP";
const MSGID_DEBUG_CALL_FRAME_INFO_REQUEST = "DEBUG_CALL_FRAME_INFO_REQUEST";
const MSGID_DEBUG_ADD_BREAKPOINT = "DEBUG_ADD_BREAKPOINT";
const MSGID_DEBUG_REMOVE_BREAKPOINT = "DEBUG_REMOVE_BREAKPOINT";

//Worker -> UI messages
const MSGID_DEBUG_UPDATE_UI = "DEBUG_UPDATE_UI";


const DEBUG_UI_STATUS_DISABLED = 1;
const DEBUG_UI_STATUS_STEPPING = 2;
const DEBUG_UI_STATUS_RESUMED = 3;
const DEBUG_UI_STATUS_BREAKPOINT = 4;

class DebugBreakpoint
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