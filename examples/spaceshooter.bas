var prevTime
var deltaTime
var maxDeltaTime = 0.03
var bgOffsetX = 0
var bgImageWidth, bgImageHeight
var canvasWidth = 600
var canvasHeight = 400
var isDone = false

var bgScrollSpeedX = 3
var playerVelocityX = 200
var playerVelocityY = 200

var upKeyDown = false
var downKeyDown = false
var leftKeyDown = false
var rightKeyDown = false
var spaceKeyDown = false

setup()

mainLoop()

wait

function setup()
  print "Loading images..."

  if not loadImage("bg", "../examples/images/space2.png") then
    print "Failed to load image 'space2.png'."
    end
  end if
  
  if not loadSpriteSheet("player-ship-sheet", "../examples/images/player-ship-sheet.png", 1, 1) then
    print "Failed to load image 'player-ship-sheet.png'."
    end
  end if

  if not loadSpriteSheet("bullet-sheet", "../examples/images/bullet-sheet.png", 1, 1) then
    print "Failed to load image 'bullet-sheet.png'."
    end
  end if

  print "Images loaded."

  bgImageWidth = getImageWidth("bg")
  bgImageHeight = getImageHeight("bg")

  addSprite("player-ship", "player-ship-sheet", 50, 50)
  addSprite("bullet", "bullet-sheet", 100, 100)

  hideConsole()
  showCanvas()
  
  setCanvasWidth(canvasWidth)
  setCanvasHeight(canvasHeight)
  
  enableCanvasBuffer()

  setCanvasEvent("keydown", onKeyDown)
  setCanvasEvent("keyup", onKeyUp)

  prevTime = time()
end function

function cleanup()
  removeSprite("player-ship")
  unloadSpriteSheet("player-ship-sheet")
  unloadImage("bg")
end function

function mainLoop()
  if isDone then
    cleanup()
    end
  end if

  updatePhysics()
  
  checkCollisions()
  
  clearCanvas()
  
  drawBG()
  
  drawSprites()

  drawCanvasBuffer(mainLoop)
end function

function onKeyDown(key)
  if key = "q" then
    isDone = true
    return
  end if

  if key = "ArrowUp" then
    setSpriteVelocityY("player-ship", -playerVelocityY)
    return
  end if

  if key = "ArrowDown" then
    setSpriteVelocityY("player-ship", playerVelocityY)
    return
  end if

  if key = "ArrowLeft" then
    setSpriteVelocityX("player-ship", -playerVelocityX)
    return
  end if

  if key = "ArrowRight" then
    setSpriteVelocityX("player-ship", playerVelocityX)
    return
  end if
end function

function onKeyUp(key)
  if (key = "ArrowUp") or (key = "ArrowDown") then setSpriteVelocityY("player-ship", 0)
  if (key = "ArrowLeft") or (key = "ArrowRight") then setSpriteVelocityX("player-ship", 0)
end function

function updatePhysics()
  deltaTime = min(((time() - prevTime) / 1000), maxDeltaTime)
  prevTime = time()
  updateSprites(deltaTime)
end function
  
function checkCollisions()
end function

function drawBG()
  drawImageTiled("bg", 0, 0, canvasWidth, canvasHeight, -bgOffsetX, 0)
  if bgOffsetX >= canvasWidth then bgOffsetX = bgOffsetX % canvasWidth
  bgOffsetX = bgOffsetX + bgScrollSpeedX
end function
