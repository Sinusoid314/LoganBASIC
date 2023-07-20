//UI -> Worker messages
const MSGID_DEBUG_ENABLE = 9;
const MSGID_DEBUG_DISABLE = 10;
const MSGID_DEBUG_RESUME = 11;
const MSGID_DEBUG_STEP_INTO = 12;
const MSGID_DEBUG_STEP_OVER = 13;
const MSGID_DEBUG_STEP_OUT = 14;
const MSGID_DEBUG_SKIP = 15;
const MSGID_DEBUG_CALL_FRAME_INFO_REQUEST = 16;
const MSGID_DEBUG_ADD_BREAKPOINT = 17;
const MSGID_DEBUG_REMOVE_BREAKPOINT = 18;

//Worker -> UI messages
const MSGID_DEBUG_UPDATE_UI = 80;


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