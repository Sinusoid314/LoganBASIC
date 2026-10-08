import * as Objects from "./core/objects.js";
import * as ThreadMsgWorker from "./thread_msg/thread_msg_worker.js";
import * as ProgLoadWorker from "./prog_load/prog_load_worker.js";
import * as MainCommon from "./main_common.js";


const mainNativeFuncs = [
                new Objects.ObjNativeFunc("version", 0, 0, funcVersion),
               ];

var DebugWorker, ConsoleWorker, CanvasWorker, SoundWorker, SpriteWorker;


ProgLoadWorker.mainVM.addNativeFuncArray(mainNativeFuncs);
              
readURLParams();

await loadWorkerComponents();


function readURLParams()
//
{
  var urlParams = new URLSearchParams(location.search);

  if(urlParams.has("mode"))
    MainCommon.setMainMode(urlParams.get("mode"));
}

async function loadWorkerComponents()
//
{
  if(MainCommon.mainMode == MainCommon.MAIN_MODE_EDIT)
    DebugWorker = await import('./debug/debug_worker.js');

  ConsoleWorker = await import('./console/console_worker.js');
  CanvasWorker = await import('./canvas/canvas_worker.js');
  SoundWorker = await import('./sound/sound_worker.js');
  SpriteWorker = await import('./sprite/sprite_worker.js');
}

function funcVersion(vm, args)
//Return the current Logan BASIC version
{
  return MainCommon.lbVersion;
}