const MAIN_MODE_EDIT = 1;
const MAIN_MODE_DEPLOY = 2;

const mainSourceName = "<main>";

//UI -> Worker messages
const MSGID_START_PROG = 1;

//Worker -> UI messages
const MSGID_PROG_DONE = 1;
const MSGID_STATUS_CHANGE = 2;

var  mainMode = MAIN_MODE_EDIT;