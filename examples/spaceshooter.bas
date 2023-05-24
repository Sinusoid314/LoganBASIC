var prevTime
var deltaTime
var maxDeltaTime = 0.03
var bgOffsetX = 0
var bgScrollSpeedX = 3
var bgImageWidth, bgImageHeight
var canvasWidth = 600
var canvasHeight = 400
var isDone = false

var bgImage = "bg-image"
var playerShipSheet = "player-ship-sheet"
var enemyShipSheet = "enemy-ship-sheet"
var bulletSheet = "bullet-sheet"
var explosionSheet = "explosion-sheet"

var bulletSpeed = 400
var bulletCounter = 0

var playerShip = "player-ship"
var playerVelocityX = 200
var playerVelocityY = 200
array playerBullets[0]
var playerExplosion = "player-explosion"

var enemyShipCounter = 0
array enemyShips[0]
var enemyVelocityX = -300
array enemyBullets[0]
array enemyExplosions[0]
var enemySpawnTimer = "enemy-spawn"
var enemySpawnDelay = 5000
var enemyFireTimer = "enemy-fire"
var enemyFireDelay = 1000

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

setup()

mainLoop()

wait

function setup()
  print "Loading images..."

  if not loadImage(bgImage, "../examples/images/space2.png") then
    print "Failed to load image 'space2.png'."
    end
  end if
  
  if not loadSpriteSheet(playerShipSheet, "../examples/images/player-ship-sheet.png", 1, 1) then
    print "Failed to load image 'player-ship-sheet.png'."
    end
  end if

  if not loadSpriteSheet(enemyShipSheet, "../examples/images/enemy-ship-sheet.png", 1, 1) then
    print "Failed to load image 'enemy-ship-sheet.png'."
    end
  end if

  if not loadSpriteSheet(bulletSheet, "../examples/images/bullet-sheet.png", 1, 1) then
    print "Failed to load image 'bullet-sheet.png'."
    end
  end if

  if not loadSpriteSheet(explosionSheet, "../examples/images/explosion-sheet.png", 1, 1) then
    print "Failed to load image 'explosion-sheet.png'."
    end
  end if

  print "Images loaded."

  bgImageWidth = getImageWidth(bgImage)
  bgImageHeight = getImageHeight(bgImage)

  addSprite(playerShip, playerShipSheet, 50, 50)

  addSprite(playerExplosion, explosionSheet, 0, 0)
  setSpriteVisible(playerExplosion, false)

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
  var bulletIndex

  for bulletIndex = 0 to len(bulletNames) - 1
    removeSprite(bulletNames[bulletIndex])
  next bulletIndex
  redim bulletNames[0]

  removeSprite(playerShip)
  unloadSpriteSheet(playerShipSheet)
  unloadImage(bgImage)
end function

function mainLoop()
  if isDone then
    cleanup()
    end
  end if

  updatePhysics()
  
  checkInBounds()

  checkCollisions()

  checkExplosions()
  
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
    setSpriteVelocityY(playerShip, -playerVelocityY)
    return
  end if

  if (key = downKey) and (not downKeyDown) then
    downKeyDown = true
    setSpriteVelocityY(playerShip, playerVelocityY)
    return
  end if

  if (key = leftKey) and (not leftKeyDown) then
    leftKeyDown = true
    setSpriteVelocityX(playerShip, -playerVelocityX)
    return
  end if

  if (key = rightKey) and (not rightKeyDown) then
    rightKeyDown = true
    setSpriteVelocityX(playerShip, playerVelocityX)
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
    setSpriteVelocityY(playerShip, 0)
    return
  end if
  
  if key = downKey then
    downKeyDown = false
    setSpriteVelocityY(playerShip, 0)
    return
  end if

  if key = leftKey then
    leftKeyDown = false
    setSpriteVelocityX(playerShip, 0)
    return
  end if
  
  if key = rightKey then
    rightKeyDown = false
    setSpriteVelocityX(playerShip, 0)
    return
  end if

  if key = shootKey then
    shootKeyDown = false
    return
  end if
end function

function onEnemyFireTimer()
end function

function onSpawnEnemyTimer()
end function

function updatePhysics()
  deltaTime = min(((time() - prevTime) / 1000), maxDeltaTime)
  prevTime = time()
  updateSprites(deltaTime)
end function

function checkInBounds()
end function
  
function checkCollisions()
  var bulletIndex

  for bulletIndex = len(bulletNames) - 1 to 0 step -1
    if not spriteOverlapsRect(bulletNames[bulletIndex], 0, 0, canvasWidth, canvasHeight) then
      removeBullet(bulletIndex)
    end if
  next bulletIndex
end function

function checkExplosions()
end function

function drawBG()
  drawImageTiled(bgImage, 0, 0, canvasWidth, canvasHeight, -bgOffsetX, 0)
  if bgOffsetX >= canvasWidth then bgOffsetX = bgOffsetX % canvasWidth
  bgOffsetX = bgOffsetX + bgScrollSpeedX
end function

function explodePlayer()
end function

function explodeEnemy()
end function

function fireEnemyBullet()
end function

function removeEnemyBullet()
end function

function firePlayerBullet()
end function

function removePlayerBullet()
end function

function endGame()
end function

'function addBullet()
'  var newBulletName = "bullet" + str(len(bulletNames) + 1)
'  var newBulletX = getSpriteX(playerShip) + getSpriteDrawWidth(playerShip)
'  var newBulletY = getSpriteY(playerShip)
'
'  addSprite(newBulletName, bulletSheet, newBulletX, newBulletY)
'  setSpriteVelocityX(newBulletName, 400)
'  addArrayItem(bulletNames, newBulletName)
'
'  print "Added " + newBulletName
'end function

'function removeBullet(bulletIndex)
'  print "Removed " + bulletNames[bulletIndex]
'  
'  removeSprite(bulletNames[bulletIndex])
'  removeArrayItem(bulletNames, bulletIndex)
'end function


