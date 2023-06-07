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
var enemyExplosionCounter = 0
array enemyExplosions[0]
var enemySpawnAccumulator = 0
var enemySpawnDelay = 5000
var enemyFireAccumulator = 0
var enemyFireDelay = 1000
var enemyFireRate = 0.6

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
  setSpriteCycles(playerExplosion, 1)

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
  var index

  for index = len(enemyShips) - 1 to 0 step -1
    removeEnemyShip(index)
  next index

  for index = len(enemyExplosions) - 1 to 0 step -1
    removeEnemyExplosion(index)
  next index

  for index = len(enemyBullets) - 1 to 0 step -1
    removeEnemyBullet(index)
  next index

  for index = len(playerBullets) - 1 to 0 step -1
    removePlayerBullet(index)
  next index

  removeSprite(playerShip)
  removeSprite(playerExplosion)
  unloadSpriteSheet(playerShipSheet)
  unloadSpriteSheet(enemyShipSheet)
  unloadSpriteSheet(bulletSheet)
  unloadSpriteSheet(explosionSheet)
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
  triggerEnemyFire()
  spawnEnemyShip()
  
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

  if not getSpriteVisible(playerShip) then return

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
    firePlayerBullet()
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

function updatePhysics()
  deltaTime = min(((time() - prevTime) / 1000), maxDeltaTime)
  prevTime = time()
  updateSprites(deltaTime)
end function

function checkInBounds()
  checkEnemyShipsInBounds()
  checkEnemyBulletsInBounds()
  checkPlayerBulletsInBounds()
  checkPlayerShipInBounds()
end function

function checkEnemyShipsInBounds()
  var shipIndex

  for shipIndex = len(enemyShips) - 1 to 0 step -1
    if not spriteOverlapsRect(enemyShips[shipIndex], 0, 0, canvasWidth, canvasHeight) then
      removeEnemyShip(shipIndex)
    end if
  next shipIndex
end function

function checkEnemyBulletsInBounds()
  var bulletIndex

  for bulletIndex = len(enemyBullets) - 1 to 0 step -1
    if not spriteOverlapsRect(enemyBullets[bulletIndex], 0, 0, canvasWidth, canvasHeight) then
      removeEnemyBullet(bulletIndex)
    end if
  next bulletIndex
end function

function checkPlayerBulletsInBounds()
  var bulletIndex

  for bulletIndex = len(playerBullets) - 1 to 0 step -1
    if not spriteOverlapsRect(playerBullets[bulletIndex], 0, 0, canvasWidth, canvasHeight) then
      removePlayerBullet(bulletIndex)
    end if
  next bulletIndex
end function

function checkPlayerShipInBounds()
  var newX, newY

  if not getSpriteVisible(playerShip) then return

  newX = clamp(getSpriteX(playerShip), 0, canvasWidth - getSpriteDrawWidth(playerShip))
  newY = clamp(getSpriteY(playerShip), 0, canvasHeight - getSpriteDrawHeight(playerShip))
  setSpriteX(playerShip, newX)
  setSpriteY(playerShip, newY)
end function
  
function checkCollisions()
  checkEnemyShipCollisions()
  checkPlayerShipCollisions()
end function

function checkEnemyShipCollisions()
  var shipIndex, bulletIndex

  for shipIndex = len(enemyShips) - 1 to 0 step -1
    for bulletIndex = 0 to len(playerBullets) - 1
      if spritesOverlap(enemyShips[shipIndex], playerBullets[bulletIndex]) then
        removePlayerBullet(bulletIndex)
        explodeEnemyShip(shipIndex)
        exit for
      end if
    next bulletIndex
  next shipIndex
end function

function checkPlayerShipCollisions()
  var shipIndex, bulletIndex

  if not getSpriteVisible(playerShip) then return

  for bulletIndex = 0 to len(enemyBullets) - 1
    if spritesOverlap(playerShip, enemyBullets[bulletIndex]) then
      removeEnemyBullet(bulletIndex)
      explodePlayerShip()
      return
    end if
  next bulletIndex

  for shipIndex = 0 to len(enemyShips) - 1
    if spritesOverlap(playerShip, enemyShips[shipIndex]) then
      explodeEnemyShip(shipIndex)
      explodePlayerShip()
      return
    end if
  next shipIndex
end function

function checkExplosions()
  var explosionIndex

  for explosionIndex = len(enemyExplosions) - 1 to 0 step -1
    if not getSpritePlaying(enemyExplosions[explosionIndex]) then
      removeEnemyExplosion(explosionIndex)
    end if
  next explosionIndex

  if not getSpriteVisible(playerExplosion) then return
  if not getSpritePlaying(playerExplosion) then endGame()
end function

function spawnEnemyShip()
  var enemyShip = "enemy" + str(enemyShipCounter)

  enemyShipCounter = enemyShipCounter + 1

  enemySpawnAccumulator = enemySpawnAccumulator + deltaTime
  if enemySpawnAccumulator < enemySpawnDelay then return
  enemySpawnAccumulator = 0

  addArrayItem(enemyShips, enemyShip)
  addSprite(enemyShip, enemyShipSheet, canvasWidth - 1, 0)
  setSpriteX(enemyShip, int(rnd() * (canvasHeight - getSpriteDrawHeight(enemyShip))))
  setSpriteVelocityX(enemyShip, enemyVelocityX)
end function

function triggerEnemyFire()
  var shipIndex

  enemyFireAccumulator = enemyFireAccumulator + deltaTime
  if enemyFireAccumulator < enemyFireDelay then return
  enemyFireAccumulator = 0

  for shipIndex = 0 to len(enemyShips) - 1
    if rnd() <= enemyFireRate then fireEnemyBullet(enemyShips[shipIndex])
  next enemyIndex
end function

function drawBG()
  drawImageTiled(bgImage, 0, 0, canvasWidth, canvasHeight, -bgOffsetX, 0)
  if bgOffsetX >= canvasWidth then bgOffsetX = bgOffsetX % canvasWidth
  bgOffsetX = bgOffsetX + bgScrollSpeedX
end function

function explodeEnemyShip(shipIndex)
  var explosionX = getSpriteX(enemyShips[shipIndex])
  var explosionY = getSpriteY(enemyShips[shipIndex])
  var explosion = "explosion" + str(enemyExplosionCounter)

  enemyExplosionCounter = enemyExplosionCounter + 1
  addArrayItem(enemyExplosions, explosion)
  addSprite(explosion, explosionX, explosionY)
  setSpriteCycles(explosion, 1)
  setSpritePlaying(explosion, true)

  removeEnemyShip(shipIndex)
end function

function explodePlayerShip()
  setSpriteX(playerExplosion, getSpriteX(playerShip))
  setSpriteY(playerExplosion, getSpriteY(playerShip))
  setSpriteVisible(playerExplosion, true)
  setSpritePlaying(playerExplosion, true)

  setSpriteVelocityX(playerShip, 0)
  setSpriteVelocityY(playerShip, 0)'
  setSpriteVisible(playerShip, false)
end function

function fireEnemyBullet(enemyShip)
  var bulletX = getSpriteX(enemyShip)
  var bulletY = getSpriteY(enemyShip)
  var bullet = "bullet" + str(bulletCounter)

  bulletCounter = bulletCounter + 1
  addArrayItem(enemyBullets, bullet)
  addSprite(bullet, bulletSheet, bulletX, bulletY)
  setSpriteVelocityX(bullet, -bulletSpeed)
  setSpriteX(bullet, bulletX - getSpriteDrawWidth(bullet))
end function

function firePlayerBullet()
  var bulletX = getSpriteX(playerShip) + getSpriteDrawWidth(playerShip)
  var bulletY = getSpriteY(playerShip)
  var bullet = "bullet" + str(bulletCounter)

  bulletCounter = bulletCounter + 1
  addArrayItem(playerBullets, bullet)
  addSprite(bullet, bulletSheet, bulletX, bulletY)
  setSpriteVelocityX(bullet, bulletSpeed)
end function

function removeEnemyShip(shipIndex)
  removeSprite(enemyShips[shipIndex])
  removeArrayItem(enemyShips, shipIndex)
end function

function removeEnemyExplosion(explosionIndex)
  removeSprite(enemyExplosions[explosionIndex])
  removeArrayItem(enemyExplosions, explosionIndex)
end function

function removeEnemyBullet(bulletIndex)
  removeSprite(enemyBullets[bulletIndex])
  removeArrayItem(enemyBullets, bulletIndex)
end function

function removePlayerBullet(bulletIndex)
  removeSprite(playerBullets[bulletIndex])
  removeArrayItem(playerBullets, bulletIndex)
end function

function endGame()
  setTextFont("30px system-ui")
  setLineColor("red")
  setFillColor("white")
  drawText("Game Over", int(canvasWidth / 2), int(canvasHeight / 2))
end function
