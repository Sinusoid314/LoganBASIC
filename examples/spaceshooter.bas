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

var upKey = "ArrowUp"
var downKey = "ArrowDown"
var leftKey = "ArrowLeft"
var rightKey = "ArrowRight"
var shootKey = " "
var upKeyDown = false
var downKeyDown = false
var leftKeyDown = false
var rightKeyDown = false
var shootKeyDown = false

array bulletNames[0]

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

  if (key = upKey) and (not upKeyDown) then
    upKeyDown = true
    setSpriteVelocityY("player-ship", -playerVelocityY)
    return
  end if

  if (key = downKey) and (not downKeyDown) then
    downKeyDown = true
    setSpriteVelocityY("player-ship", playerVelocityY)
    return
  end if

  if (key = leftKey) and (not leftKeyDown) then
    leftKeyDown = true
    setSpriteVelocityX("player-ship", -playerVelocityX)
    return
  end if

  if (key = rightKey) and (not rightKeyDown) then
    rightKeyDown = true
    setSpriteVelocityX("player-ship", playerVelocityX)
    return
  end if

  if (key = shootKey) and (not shootKeyDown) then
    shootKeyDown = true
    addBullet()
    return
  end if
end function

function onKeyUp(key)
  if key = upKey then
    upKeyDown = false
    setSpriteVelocityY("player-ship", 0)
    return
  end if
  
  if key = downKey then
    downKeyDown = false
    setSpriteVelocityY("player-ship", 0)
    return
  end if

  if key = leftKey then
    leftKeyDown = false
    setSpriteVelocityX("player-ship", 0)
    return
  end if
  
  if key = rightKey then
    rightKeyDown = false
    setSpriteVelocityX("player-ship", 0)
    return
  end if

  if key = shootKey then
    shootKeyDown = false
    return
  end if
end function

function updatePhysics()
  deltaTime = min(((time() - prevTime) / 1000), maxDeltaTime)
  prevTime = time()
  updateSprites(deltaTime)
end function
  
function checkCollisions()
  var bulletIndex

  for bulletIndex = 0 to len(bulletNames) - 1
    if not spriteOverlapsRect(bulletNames[bulletIndex], 0, 0, canvasWidth, canvasHeight) then
      setSpriteX(bulletNames[bulletIndex], -getSpriteDrawWidth(bulletNames[bulletIndex]))
    end if
  next bulletIndex
end function

function drawBG()
  drawImageTiled("bg", 0, 0, canvasWidth, canvasHeight, -bgOffsetX, 0)
  if bgOffsetX >= canvasWidth then bgOffsetX = bgOffsetX % canvasWidth
  bgOffsetX = bgOffsetX + bgScrollSpeedX
end function

function addBullet()
  var newBulletName = "bullet" + str(len(bulletNames))
  var newBulletX = getSpriteX("player-ship") + getSpriteDrawWidth("player-ship")
  var newBulletY = getSpriteY("player-ship")

  addSprite(newBulletName, "bullet-sheet", newBulletX, newBulletY)
  setSpriteVelocityX(newBulletName, 400)
  addArrayItem(bulletNames, newBulletName)
end function
