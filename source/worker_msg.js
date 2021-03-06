//UI -> Worker messages
const MSGID_START_PROG = 1;
const MSGID_INPUT_RESULT = 2;
const MSGID_IMAGE_REQUEST_RESULT = 3;
const MSGID_CANVAS_EVENT = 4;
const MSGID_DRAW_CANVAS_BUFFER_DONE = 5;
const MSGID_SOUND_REQUEST_RESULT = 6;
const MSGID_SPRITE_SHEET_REF_REQUEST_RESULT = 7;
const MSGID_SPRITE_SHEET_REQUEST_RESULT = 8;


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
const MSGID_UNLOAD_IMAGE_REQUEST = 17;
const MSGID_DRAW_IMAGE_REQUEST = 18;
const MSGID_DRAW_IMAGE_CLIP_REQUEST = 19;
const MSGID_DRAW_IMAGE_TILED_REQUEST = 20;
const MSGID_GET_IMAGE_WIDTH_REQUEST = 21;
const MSGID_GET_IMAGE_HEIGHT_REQUEST = 22;
const MSGID_ENABLE_CANVAS_BUFFER = 23;
const MSGID_DISABLE_CANVAS_BUFFER = 24;
const MSGID_DRAW_CANVAS_BUFFER = 25;
const MSGID_ADD_CANVAS_EVENT = 26;
const MSGID_REMOVE_CANVAS_EVENT = 27;
const MSGID_DRAW_TEXT = 28;
const MSGID_DRAW_RECT = 29;
const MSGID_DRAW_CIRCLE = 30;
const MSGID_DRAW_LINE = 31;
const MSGID_SET_TEXT_FONT = 32;
const MSGID_SET_FILL_COLOR = 33;
const MSGID_SET_LINE_COLOR = 34;
const MSGID_SET_LINE_SIZE = 35;

const MSGID_LOAD_SOUND_REQUEST = 50;
const MSGID_UNLOAD_SOUND_REQUEST = 51;
const MSGID_PLAY_SOUND_REQUEST = 52;
const MSGID_PAUSE_SOUND_REQUEST = 53;
const MSGID_STOP_SOUND_REQUEST = 54;
const MSGID_GET_SOUND_LEN_REQUEST = 55;
const MSGID_GET_SOUND_POS_REQUEST = 56;
const MSGID_SET_SOUND_POS_REQUEST = 57;
const MSGID_LOOP_SOUND_REQUEST = 58;

const MSGID_SPRITE_SHEET_REF_REQUEST = 70;
const MSGID_LOAD_SPRITE_SHEET_REQUEST = 71;
const MSGID_UNLOAD_SPRITE_SHEET_REQUEST = 72;
const MSGID_DRAW_SPRITE_SHEET_FRAMES_REQUEST = 73;
const MSGID_GET_SPRITE_SHEET_FRAME_WIDTH_REQUEST = 74;
const MSGID_GET_SPRITE_SHEET_FRAME_HEIGHT_REQUEST = 75;
