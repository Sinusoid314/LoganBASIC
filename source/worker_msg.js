//UI -> Worker messages
const MSGID_START = 1;

//Worker -> UI messages
const MSGID_DONE = 1;
const MSGID_STATUS = 2;
const MSGID_PRINT = 3;
const MSGID_INPUT_REQUEST = 4;
const MSGID_INPUT_RESULT = 5;
const MSGID_CLEAR_CONSOLE = 6;
const MSGID_CANVAS_MSG = 7;

//Canvas worker -> Canvas UI messages
const CANVAS_MSG_CLEAR_CANVAS = 1;
const CANVAS_MSG_SET_CANVAS_WIDTH = 2;
const CANVAS_MSG_SET_CANVAS_HEIGHT = 3;
const CANVAS_MSG_LOAD_IMAGE = 4;
const CANVAS_MSG_UNLOAD_IMAGE = 5;
const CANVAS_MSG_DRAW_IMAGE = 6;
