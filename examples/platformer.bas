'Scrolling Platformer
'
'A small, simple demo of a scrolling platformer game.
'Left arrow key => Walk left
'Right arrow key => Walk right
'Space bar (tap) => Short jump
'Space bar (hold down) => High jump

structure SpriteContact
  time
  normalX
  normalY
end structure

var deltaTime
var canvasWidth, canvasHeight
var levelWidth
var scrollViewX = 0
var isDone = false

var walkForce = 950
var maxJumpForce = -420
var minJumpForce = -260
var gravityForce = 450
var frictionFactor = 0.9
var minVelocityX = -120
var minVelocityY = -420
var maxVelocityX = 120
var maxVelocityY = 250

var isGrounded = false
var facingDir = "right"
var leftKeyDown = false
var rightKeyDown = false
var spaceKeyDown = false
var contact = new SpriteContact
var prevHitCurb = false
var prevHitPlatform = false

setup()

mainLoop()

wait


'Load the images and create the sprites
function setup()
  print "Loading images..."

  if not loadImage("bg", "../examples/images/street.bmp") then
    print "Failed to load image 'street.bmp'."
    end
  end if
  
  if not loadSpriteSheet("bubba-sheet", "../examples/images/bubba.png", 5, 2) then
    print "Failed to load image 'bubba.png'."
    end
  end if
  
  if not loadSpriteSheet("curb-sheet", "../examples/images/curb.png", 1, 1) then
    print "Failed to load image 'curb.png'."
    end
  end if
  
  if not loadSpriteSheet("platform-sheet", "../examples/images/platform.png", 1, 1) then
    print "Failed to load image 'platform.png'."
    end
  end if
  
  if not loadSpriteSheet("car-sheet", "../examples/images/car.png", 1, 1) then
    print "Failed to load image 'car.png'."
    end
  end if
  
  print "Images loaded."
  
  canvasWidth = getImageWidth("bg")
  canvasHeight = getImageHeight("bg")
  levelWidth = canvasWidth * 2
  
  addSprite("curb1", "curb-sheet", 0, 375)
  addSprite("curb2", "curb-sheet", 700, 375)
  
  addSprite("platform", "platform-sheet", 600, 200)

  addSprite("bubba", "bubba-sheet", 200, 10)
  setSpriteFrameRange("bubba", 0, 0)
  setSpriteFrameRate("bubba", 0.15)
  
  addSprite("car", "car-sheet", 1000, 0)
  setSpriteY("car", getSpriteY("curb1") - getSpriteDrawHeight("car"))
  
  setCanvasWidth(canvasWidth)
  setCanvasHeight(canvasHeight)
  
  hideConsole()
  showCanvas()
  
  enableCanvasBuffer()
  
  setFillColor("black")
  
  setCanvasEvent("keydown", onKeyDown)
  setCanvasEvent("keyup", onKeyUp)
end function


'Unload all the sprites and images
function cleanup()
  removeSprite("car")
  removeSprite("bubba")
  removeSprite("platform")
  removeSprite("curb1")
  removeSprite("curb2")
  
  unloadSpriteSheet("car-sheet")
  unloadSpriteSheet("platform-sheet")
  unloadSpriteSheet("curb-sheet")
  unloadSpriteSheet("bubba-sheet")
  
  unloadImage("bg")
end function


'Main update & draw loop
function mainLoop()
  if isDone then
    cleanup()
    end
  end if
  
  updatePhysics()
  
  checkCollisions()
  
  moveScrollView()
  
  clearCanvas()
  
  drawImageTiled("bg", 0, 0, canvasWidth, canvasHeight, -scrollViewX, 0)
  
  drawSprites()
  
  drawText(str(deltaTime * 1000) + " ms", 10, 10)
  drawText(str(getSpriteVelocityX("bubba")) + ", " + str(getSpriteVelocityY("bubba")), 10, 20)

  displayControls()
  
  drawCanvasBuffer(mainLoop)
end function


'Make Bubba either walk or jump when the appropriate key is pressed down
function onKeyDown(key)
  if (key = " ") and (not spaceKeyDown) then spaceKeyDown = true

  if not (leftKeyDown or rightKeyDown) then
    if key = "ArrowLeft" then
      leftKeyDown = true
      facingDir = "left"
      
      if not isGrounded then
        setSpriteFrameRange("bubba", 9, 9)
      else
        setSpriteFrameRange("bubba", 5, 8)
      end if
      
      return
    end if
  
    if key = "ArrowRight" then
      rightKeyDown = true
      facingDir = "right"
      
      if not isGrounded then
        setSpriteFrameRange("bubba", 4, 4)
      else
        setSpriteFrameRange("bubba", 0, 3)
      end if
      
      return
    end if
  end if
end function


'Stop moving Bubba when the arrow key is released
function onKeyUp(key)
  if key = "q" then isDone = true
  
  if (key = " ") and spaceKeyDown then spaceKeyDown = false
  
  if (key = "ArrowLeft") and leftKeyDown then
    leftKeyDown = false
    if isGrounded then
      setSpriteFrameRange("bubba", 5, 5)
    end if
    return
  end if
  
  if (key = "ArrowRight") and rightKeyDown then
    rightKeyDown = false
    if isGrounded then
      setSpriteFrameRange("bubba", 0, 0)
    end if
    return
  end if
end function


'Move the scroll view along with Bubba, while keeping it within the level's bounds
function moveScrollView()
  scrollViewX = getSpriteX("bubba") - int(canvasWidth / 2)
  scrollViewX = clamp(scrollViewX, 0, levelWidth - canvasWidth)
  setScrollX(scrollViewX)
end function


'Apply all forces to Bubba's motion
function updatePhysics()
  var newVelocityX, newVelocityY
  
  deltaTime = updateDeltaTime()

  'Apply gravity
  newVelocityY = getSpriteVelocityY("bubba") + (gravityForce * deltaTime)
  setSpriteVelocityY("bubba", newVelocityY)
  
  'Apply friction if Bubba is grounded
  if isGrounded then
    newVelocityX = getSpriteVelocityX("bubba") * frictionFactor
    if abs(newVelocityX) < 1 then newVelocityX = 0
    setSpriteVelocityX("bubba", newVelocityX)
  end if

  'Apply jump force if jump key is down and Bubba is grounded
  if spaceKeyDown and isGrounded then
    newVelocityY = getSpriteVelocityY("bubba") + maxJumpForce
    setSpriteVelocityY("bubba", newVelocityY)
  else
    if (not spaceKeyDown) and (getSpriteVelocityY("bubba") < minJumpForce) then
      setSpriteVelocityY("bubba", minJumpForce)
    end if
  end if
  
  'Apply walk force if left or right walk buttons are down
  if leftKeyDown then
    newVelocityX = getSpriteVelocityX("bubba") + (-walkForce * deltaTime)
    setSpriteVelocityX("bubba", newVelocityX)
  end if
  if rightKeyDown then
    newVelocityX = getSpriteVelocityX("bubba") + (walkForce * deltaTime)
    setSpriteVelocityX("bubba", newVelocityX)
  end if
  
  'Clamp velocity
  setSpriteVelocityX("bubba", clamp(getSpriteVelocityX("bubba"), minVelocityX, maxVelocityX))
  setSpriteVelocityY("bubba", clamp(getSpriteVelocityY("bubba"), minVelocityY, maxVelocityY))
  
  'Apply velocity to position
  updateSprites(deltaTime)
end function


'React to any sprites that are touching
function checkCollisions()
  checkHitCurb()
  checkHitPlatform()
  checkHitEdge()
end function


'If Bubba is touching either of the curbs, keep him on top of them
function checkHitCurb()
  if spritesOverlap("bubba", "curb1") or spritesOverlap("bubba", "curb2") then
    setSpriteY("bubba", getSpriteY("curb1") - getSpriteDrawHeight("bubba"))
    setSpriteVelocityY("bubba", 0)
    
    if not prevHitCurb then
      groundBubba()
      prevHitCurb = true
    end if
  else
    if prevHitCurb then
      ungroundBubba()
      prevHitCurb = false
    end if
  end if
end function


'If Bubba lands on top of the platform, keep him on it
function checkHitPlatform()
  if spritesCollided("bubba", "platform", contact) then
    if getSpriteVelocityY("bubba") < 0 then return
    if contact.normalY <> -1 then return
    
    resolveSpriteCollisionY("bubba", "platform", contact.time)
    setSpriteVelocityY("bubba", 0)
  
    if not prevHitPlatform then
      groundBubba()
      prevHitPlatform = true
    end if
  else
    if prevHitPlatform then
      ungroundBubba()
      prevHitPlatform = false
    end if
  end if
end function


'Set the appropriate sprite frames, velocity, and flag for Bubba landing on a curb or platform
function groundBubba()
  if facingDir = "left" then
    if leftKeyDown then
      setSpriteFrameRange("bubba", 5, 8)
    else
      setSpriteFrameRange("bubba", 5, 5)
    end if
  else
    if rightKeyDown then
      setSpriteFrameRange("bubba", 0, 3)
    else
      setSpriteFrameRange("bubba", 0, 0)
    end if
  end if

  isGrounded = true
end function


'Set the appropriate sprite frames, velocity, and flag for Bubba falling or jumping
function ungroundBubba()
  if facingDir = "left" then
    setSpriteFrameRange("bubba", 9, 9)
  else
    setSpriteFrameRange("bubba", 4, 4)
  end if

  isGrounded = false
end function


'Make sure Bubba stays within the level's bounds
function checkHitEdge()
  var newX = clamp(getSpriteX("bubba"), 0, levelWidth - getSpriteDrawWidth("bubba"))
  setSpriteX("bubba", newX)
end function


'Display the control intstructions on the screen
function displayControls()
  setTextFont("12px system-ui")
  setFillColor("black")
  drawText("Controls:    Left/right arrow keys = Move left/right,    Spacebar (tap) = Short jump,    Spacebar (hold) = High jump,    Q = Quit", 10, canvasHeight - 5)
end function