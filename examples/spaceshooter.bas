'Space Shooter
'
'A simple demo of a scrolling space ship shooter game.
'Left arrow key => Move ship left
'Right arrow key => Move ship right
'Up arrow key => Move ship up
'Down arrow key => Move ship down
'Space bar => Shoot

var prevTime
var deltaTime
var maxDeltaTime = 0.03
var bgOffsetX = 0
var bgScrollSpeedX = 3
var bgImageWidth, bgImageHeight
var canvasWidth = 600
var canvasHeight = 400
var gameOver = false
var score = 0

var bgImage = "bg-image"
var playerShipSheet = "player-ship-sheet"
var enemyShipSheet = "enemy-ship-sheet"
var bulletSheet = "bullet-sheet"
var explosionSheet = "explosion-sheet"

var bgSound = "bg-sound"
var playerFireSound = "player-fire-sound"
var enemyFireSound = "enemy-fire-sound"
var explosionSound = "explosion-sound"

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
var enemySpawnDelay = 1
var enemyFireAccumulator = 0
var enemyFireDelay = 1
var enemyFireRate = 0.8

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

loadResources()
setup()

mainLoop()

wait


'Load the images and sounds
function loadResources()
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

  if not loadSpriteSheet(explosionSheet, "../examples/images/explosion-sheet.png", 4, 1) then
    print "Failed to load image 'explosion-sheet.png'."
    end
  end if

  print "Images loaded."

  if not loadSound(bgSound, "../examples/sounds/bg-sound.mp3") then
    print "Failed to load sound 'bg-sound.mp3'."
    end
  end if

  if not loadSound(playerFireSound, "../examples/sounds/player-fire.mp3") then
    print "Failed to load sound 'player-fire.mp3'."
    end
  end if

  if not loadSound(enemyFireSound, "../examples/sounds/enemy-fire.mp3") then
    print "Failed to load sound 'enemy-fire.mp3'."
    end
  end if

  if not loadSound(explosionSound, "../examples/sounds/explosion.mp3") then
    print "Failed to load sound 'explosion.mp3'."
    end
  end if

  print "Sounds loaded."
end function


'Unload the images and sounds
function unloadResources()
  unloadSound(explosionSound)
  unloadSound(enemyFireSound)
  unloadSound(playerFireSound)
  unloadSound(bgSound)

  unloadSpriteSheet(playerShipSheet)
  unloadSpriteSheet(enemyShipSheet)
  unloadSpriteSheet(bulletSheet)
  unloadSpriteSheet(explosionSheet)
  unloadImage(bgImage)
end function


function setup()
  bgImageWidth = getImageWidth(bgImage)
  bgImageHeight = getImageHeight(bgImage)

  loopSound(bgSound, true)
  playSound(bgSound)

  addSprite(playerShip, playerShipSheet, 50, 50)

  addSprite(playerExplosion, explosionSheet, 0, 0)
  setSpriteVisible(playerExplosion, false)
  setSpriteCycles(playerExplosion, 1)
  setSpriteFrameRate(playerExplosion, 3)

  setCanvasWidth(canvasWidth)
  setCanvasHeight(canvasHeight)

  hideConsole()
  showCanvas()

  enableCanvasBuffer()

  setCanvasEvent("keydown", onKeyDown)
  setCanvasEvent("keyup", onKeyUp)
  setCanvasEvent("drawbufferdone", mainLoop)

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
end function


'Main update & draw loop
function mainLoop()
  updatePhysics()
  
  checkInBounds()
  checkCollisions()
  checkExplosions()
  triggerEnemyFire()
  spawnEnemyShip()
  
  clearCanvas()
  drawBG()
  drawSprites()

  displayScore()
  displayControls()
  if gameOver then displayGameOver()

  drawCanvasBuffer()
end function


'Move the ship or shoot when the appropriate key is pressed down
function onKeyDown(key)
  if key = "q" then
    cleanup()
    unloadResources()
    end
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


'Stop moving the ship, or allow the ship to shoot again, when the appropriate key is released
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


'Apply each sprite's velocity to its position
function updatePhysics()
  deltaTime = min(((time() - prevTime) / 1000), maxDeltaTime)
  prevTime = time()
  updateSprites(deltaTime)
end function


'Check for any ships or bullets that have moved off screen
function checkInBounds()
  checkEnemyShipsInBounds()
  checkEnemyBulletsInBounds()
  checkPlayerBulletsInBounds()
  checkPlayerShipInBounds()
end function


'If any enemy ships have moved off screen, remove them
function checkEnemyShipsInBounds()
  var shipIndex

  for shipIndex = len(enemyShips) - 1 to 0 step -1
    if not spriteOverlapsRect(enemyShips[shipIndex], 0, 0, canvasWidth, canvasHeight) then
      removeEnemyShip(shipIndex)
    end if
  next shipIndex
end function


'If any enemy bullets have moved off screen, remove them
function checkEnemyBulletsInBounds()
  var bulletIndex

  for bulletIndex = len(enemyBullets) - 1 to 0 step -1
    if not spriteOverlapsRect(enemyBullets[bulletIndex], 0, 0, canvasWidth, canvasHeight) then
      removeEnemyBullet(bulletIndex)
    end if
  next bulletIndex
end function


'If any player bullets have moved off screen, remove them
function checkPlayerBulletsInBounds()
  var bulletIndex

  for bulletIndex = len(playerBullets) - 1 to 0 step -1
    if not spriteOverlapsRect(playerBullets[bulletIndex], 0, 0, canvasWidth, canvasHeight) then
      removePlayerBullet(bulletIndex)
    end if
  next bulletIndex
end function


'Make sure the player ship stays within the screen bounds
function checkPlayerShipInBounds()
  var newX, newY

  if not getSpriteVisible(playerShip) then return

  newX = clamp(getSpriteX(playerShip), 0, canvasWidth - getSpriteDrawWidth(playerShip))
  newY = clamp(getSpriteY(playerShip), 0, canvasHeight - getSpriteDrawHeight(playerShip))
  setSpriteX(playerShip, newX)
  setSpriteY(playerShip, newY)
end function


'React to any sprites that are touching
function checkCollisions()
  checkEnemyShipCollisions()
  checkPlayerShipCollisions()
end function


'If any enemy ships have collided with a player bullet, remove the player bullet
'and explode the enemy ship
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


'If the player ship has collided with either an enemy ship or enemy bullet, remove
'the enemy ship/bullet and explode the player ship
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


'If any enemy explosions are done playing, remove them. If the player explosion
'is done playing, hide the player ship and set the gameOver flag
function checkExplosions()
  var explosionIndex

  for explosionIndex = len(enemyExplosions) - 1 to 0 step -1
    if not getSpritePlaying(enemyExplosions[explosionIndex]) then
      removeEnemyExplosion(explosionIndex)
    end if
  next explosionIndex

  if not getSpriteVisible(playerExplosion) then return
  if not getSpritePlaying(playerExplosion) then
    setSpriteVisible(playerExplosion, false)
    gameOver = true
  end if
end function


'Create a new enemy ship after a set interval
function spawnEnemyShip()
  var enemyShip

  enemySpawnAccumulator = enemySpawnAccumulator + deltaTime
  if enemySpawnAccumulator < enemySpawnDelay then return
  enemySpawnAccumulator = 0

  enemyShip = "enemy" + str(enemyShipCounter)
  enemyShipCounter = enemyShipCounter + 1

  addArrayItem(enemyShips, enemyShip)
  addSprite(enemyShip, enemyShipSheet, canvasWidth - 1, 0)
  setSpriteY(enemyShip, int(rnd() * (canvasHeight - getSpriteDrawHeight(enemyShip))))
  setSpriteVelocityX(enemyShip, enemyVelocityX)
end function


'Randomly trigger enemy fire after a set interval
function triggerEnemyFire()
  var shipIndex

  enemyFireAccumulator = enemyFireAccumulator + deltaTime
  if enemyFireAccumulator < enemyFireDelay then return
  enemyFireAccumulator = 0

  for shipIndex = 0 to len(enemyShips) - 1
    if rnd() <= enemyFireRate then fireEnemyBullet(enemyShips[shipIndex])
  next shipIndex
end function


'Draw the background image
function drawBG()
  drawImageTiled(bgImage, 0, 0, canvasWidth, canvasHeight, -bgOffsetX, 0)
  if bgOffsetX >= canvasWidth then bgOffsetX = bgOffsetX % canvasWidth
  bgOffsetX = bgOffsetX + bgScrollSpeedX
end function


'Remove the given enemy ship and create an explosion in its place
function explodeEnemyShip(shipIndex)
  var explosionX = getSpriteX(enemyShips[shipIndex])
  var explosionY = getSpriteY(enemyShips[shipIndex])
  var explosion = "explosion" + str(enemyExplosionCounter)

  enemyExplosionCounter = enemyExplosionCounter + 1
  addArrayItem(enemyExplosions, explosion)
  addSprite(explosion, explosionSheet, explosionX, explosionY)
  setSpriteCycles(explosion, 1)
  setSpritePlaying(explosion, true)

  removeEnemyShip(shipIndex)

  score = score + 1

  playSound(explosionSound)
end function


'Hide the player ship and show an explosion in its place
function explodePlayerShip()
  setSpriteX(playerExplosion, getSpriteX(playerShip))
  setSpriteY(playerExplosion, getSpriteY(playerShip))
  setSpriteVisible(playerExplosion, true)
  setSpritePlaying(playerExplosion, true)

  setSpriteVelocityX(playerShip, 0)
  setSpriteVelocityY(playerShip, 0)'
  setSpriteVisible(playerShip, false)

  playSound(explosionSound)
end function


'Create a new enemy bullet
function fireEnemyBullet(enemyShip)
  var bulletX = getSpriteX(enemyShip)
  var bulletY = getSpriteY(enemyShip)
  var bullet = "bullet" + str(bulletCounter)

  bulletCounter = bulletCounter + 1
  addArrayItem(enemyBullets, bullet)
  addSprite(bullet, bulletSheet, bulletX, bulletY)
  setSpriteVelocityX(bullet, -bulletSpeed)
  setSpriteX(bullet, bulletX - getSpriteDrawWidth(bullet))

  playSound(enemyFireSound)
end function


'Create a new player bullet
function firePlayerBullet()
  var bulletX = getSpriteX(playerShip) + getSpriteDrawWidth(playerShip)
  var bulletY = getSpriteY(playerShip)
  var bullet = "bullet" + str(bulletCounter)

  bulletCounter = bulletCounter + 1
  addArrayItem(playerBullets, bullet)
  addSprite(bullet, bulletSheet, bulletX, bulletY)
  setSpriteVelocityX(bullet, bulletSpeed)

  playSound(playerFireSound)
end function


'Delete the given enemy ship
function removeEnemyShip(shipIndex)
  removeSprite(enemyShips[shipIndex])
  removeArrayItem(enemyShips, shipIndex)
end function


'Delete the given enemy explosion
function removeEnemyExplosion(explosionIndex)
  removeSprite(enemyExplosions[explosionIndex])
  removeArrayItem(enemyExplosions, explosionIndex)
end function


'Delete the given enemy bullet
function removeEnemyBullet(bulletIndex)
  removeSprite(enemyBullets[bulletIndex])
  removeArrayItem(enemyBullets, bulletIndex)
end function


'Delete the given player bullet
function removePlayerBullet(bulletIndex)
  removeSprite(playerBullets[bulletIndex])
  removeArrayItem(playerBullets, bulletIndex)
end function


'Print the player's score on the screen
function displayScore()
  setTextFont("12px system-ui")
  setFillColor("white")
  drawText("Score: " + str(score), 10, 15)
end function

'Display the control intstructions on the screen
function displayControls()
  setTextFont("12px system-ui")
  setFillColor("white")
  drawText("Controls:    Arrow keys = Move ship,    Spacebar = Shoot,    Q = Quit", 110, 15)
end function


'Print the "Game Over" message on the screen
function displayGameOver()
  setTextFont("30px system-ui")
  setFillColor("red")
  drawText("Game Over", int((canvasWidth - 150) / 2) , int(canvasHeight / 2))
end function
