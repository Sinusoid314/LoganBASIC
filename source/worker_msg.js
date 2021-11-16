//UI -> Worker messages
const MSGID_START_PROG = 1;
const MSGID_INPUT_RESULT = 2;
const MSGID_LOAD_IMAGE_RESULT = 3;
const MSGID_CANVAS_EVENT = 4;
const MSGID_DRAW_CANVAS_BUFFER_DONE = 5;
const MSGID_LOAD_SOUND_RESULT = 6;
const MSGID_GET_SOUND_POS_RESULT = 7;

//Worker -> UI messages
const MSGID_PROG_DONE_SUCCESS = 1;
const MSGID_PROG_DONE_ERROR = 2;
const MSGID_STATUS_CHANGE = 3;
const MSGID_SHOW_EDITOR = 4;
const MSGID_HIDE_EDITOR = 5;
const MSGID_SHOW_CONSOLE = 6;
const MSGID_HIDE_CONSOLE = 7;
const MSGID_PRINT = 8;
const MSGID_INPUT_REQUEST = 9;
const MSGID_CLEAR_CONSOLE = 10;

const MSGID_SHOW_CANVAS = 11;
const MSGID_HIDE_CANVAS = 12;
const MSGID_SET_CANVAS_WIDTH = 13;
const MSGID_SET_CANVAS_HEIGHT = 14;
const MSGID_CLEAR_CANVAS = 15;
const MSGID_LOAD_IMAGE_REQUEST = 16;
const MSGID_UNLOAD_IMAGE = 17;
const MSGID_DRAW_IMAGE = 18;
const MSGID_DRAW_IMAGE_CLIP = 19;
const MSGID_ENABLE_CANVAS_BUFFER = 20;
const MSGID_DISABLE_CANVAS_BUFFER = 21;
const MSGID_DRAW_CANVAS_BUFFER = 22;
const MSGID_ADD_CANVAS_EVENT = 23;
const MSGID_REMOVE_CANVAS_EVENT = 24;
const MSGID_DRAW_TEXT = 25;
const MSGID_DRAW_RECT = 26;
const MSGID_DRAW_CIRCLE = 27;
const MSGID_DRAW_LINE = 28;

const MSGID_LOAD_SOUND_REQUEST = 50;
const MSGID_UNLOAD_SOUND = 51;
const MSGID_PLAY_SOUND = 52;
const MSGID_PAUSE_SOUND = 53;
const MSGID_STOP_SOUND = 54;
const MSGID_GET_SOUND_POS = 55;
const MSGID_SET_SOUND_POS = 56;
const MSGID_LOOP_SOUND = 57;
