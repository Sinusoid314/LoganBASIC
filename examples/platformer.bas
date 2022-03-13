'Scrolling Platformer
'
'A small, simple demo of a scrolling platformer game.

structure SpriteContact
  time
  normalX
  normalY
end structure

var prevTime
var deltaTime
var maxDeltaTime = 0.03
var canvasWidth, canvasHeight
var levelWidth
var scrollViewX = 0
var gravityForce = 300
var jumpForce = -350
var isGrounded = false
var facingDir = "right"
var leftKeyDown = false
var rightKeyDown = false
var contact = new SpriteContact

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
  setSpriteFrameRate("bubba", 5)
  
  addSprite("car", "car-sheet", 1000, 0)
  setSpriteY("car", getSpriteY("curb1") - getSpriteDrawHeight("car"))
    
  hideConsole()
  showCanvas()
  
  setCanvasWidth(canvasWidth)
  setCanvasHeight(canvasHeight)
  
  enableCanvasBuffer()
  
  setFillColor("black")
  
  setCanvasEvent("keydown", onKeyDown)
  setCanvasEvent("keyup", onKeyUp)
  
  prevTime = time()
end function


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
  deltaTime = min(((time() - prevTime) / 1000), maxDeltaTime)
  prevTime = time()
  
  applyGravity()
  
  updateSprites(deltaTime)
  
  checkCollisions()
  
  moveScrollView()
  
  clearCanvas()
  
  drawImageTiled("bg", 0, 0, canvasWidth, canvasHeight, -scrollViewX, 0)
  
  drawSprites()
  
  drawText(str(deltaTime * 1000) + " ms", 10, 10)
  
  drawCanvasBuffer(mainLoop)
end function


'Make Bubba either walk or jump when the appropriate key is pressed down
function onKeyDown(key)
  if (key = " ") and isGrounded then
    setSpriteVelocityY("bubba", jumpForce)
    ungroundBubba()
  end if

  if not (leftKeyDown or rightKeyDown) then
    if key = "ArrowLeft" then
      leftKeyDown = true
      facingDir = "left"
      
      if not isGrounded then
        setSpriteFrameRange("bubba", 9, 9)
      else
        setSpriteFrameRange("bubba", 6, 8)
      end if
      
      setSpriteVelocityX("bubba", -100)
      return
    end if
  
    if key = "ArrowRight" then
      rightKeyDown = true
      facingDir = "right"
      
      if not isGrounded then
        setSpriteFrameRange("bubba", 4, 4)
      else
        setSpriteFrameRange("bubba", 1, 3)
      end if
      
      setSpriteVelocityX("bubba", 100)
      return
    end if
  end if
end function


'Stop moving Bubba when the arrow key is released
function onKeyUp(key)
  if key = "q" then
    cleanup()
    end
  end if
  
  if (key = "ArrowLeft") and leftKeyDown then
    leftKeyDown = false
    
    if isGrounded then
      setSpriteFrameRange("bubba", 5, 5)
      setSpriteVelocityX("bubba", 0)
    end if
    
    return
  end if
  
  if (key = "ArrowRight") and rightKeyDown then
    rightKeyDown = false
    
    if isGrounded then
      setSpriteFrameRange("bubba", 0, 0)
      setSpriteVelocityX("bubba", 0)
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


'Apply the gravity acceleration value to Bubba's y-velocity
function applyGravity()
  var newVelocityY
  
  newVelocityY = getSpriteVelocityY("bubba") + (gravityForce * deltaTime)
  setSpriteVelocityY("bubba", newVelocityY)
end function


'React to any sprites that are touching
function checkCollisions()
  bubbaHitCurb()
  bubbaHitPlatform()
  bubbaHitEdge()
end function


'If Bubba is touching either of the curbs, keep him on top of them
function bubbaHitCurb()
  if not (spritesOverlap("bubba", "curb1") or spritesOverlap("bubba", "curb2")) then return

  setSpriteY("bubba", getSpriteY("curb1") - getSpriteDrawHeight("bubba"))
  setSpriteVelocityY("bubba", 0)
  
  if not isGrounded then groundBubba()
end function


'If Bubba lands on top of the platform, keep him on it
function bubbaHitPlatform()
  if not spritesOverlap("bubba", "platform") then return
  if getSpriteVelocityY("bubba") < 0 then return
  
  getSpriteContact("bubba", "platform", deltaTime, contact)
  if contact.normalY <> 1 then return
  
  setSpriteY("bubba", getSpriteY("platform") - getSpriteDrawHeight("bubba"))
  setSpriteVelocityY("bubba", 0)
  
  if not isGrounded then groundBubba()
end function


function groundBubba()
  if facingDir = "left" then
    if leftKeyDown then
      setSpriteFrameRange("bubba", 6, 8)
    else
      setSpriteFrameRange("bubba", 5, 5)
      setSpriteVelocityX("bubba", 0)
    end if
  else
    if rightKeyDown then
      setSpriteFrameRange("bubba", 1, 3)
    else
      setSpriteFrameRange("bubba", 0, 0)
      setSpriteVelocityX("bubba", 0)
    end if
  end if

  isGrounded = true
end function


function ungroundBubba()
  if facingDir = "left" then
    setSpriteFrameRange("bubba", 9, 9)
  else
    setSpriteFrameRange("bubba", 4, 4)
  end if

  isGrounded = false
end function


'Make sure Bubba stays within the level's bounds
function bubbaHitEdge()
  var newX = clamp(getSpriteX("bubba"), 0, levelWidth - getSpriteDrawWidth("bubba"))
  setSpriteX("bubba", newX)
end function


'Get the time and side of contact between two overlapping sprites
function getSpriteContact(spriteName1, spriteName2, totalTime, contactRef)
  var contactTimeX = 0
  var contactTimeY = 0
  var contactNormalX = 0
  var contactNormalY = 0
  var relativeVelocityX = getSpriteVelocityX(spriteName2) - getSpriteVelocityX(spriteName1)
  var relativeVelocityY = getSpriteVelocityY(spriteName2) - getSpriteVelocityY(spriteName1)

  if relativeVelocityY <> 0 then
    contactTimeY = totalTime + (((getSpriteY(spriteName1) + getSpriteDrawHeight(spriteName1)) - getSpriteY(spriteName2)) / relativeVelocityY)
    if abs(contactTimeY) < 0.001 then contactTimeY = 0
    if (contactTimeY >= 0) and (contactTimeY < totalTime) then
      'Bottom-top alignment
      contactNormalY = 1
    else
      contactTimeY = totalTime + ((getSpriteY(spriteName1) - (getSpriteY(spriteName2) + getSpriteDrawHeight(spriteName2))) / relativeVelocityY)
      if abs(contactTimeY) < 0.001 then contactTimeY = 0
      if (contactTimeY >= 0) and (contactTimeY < totalTime) then
        'Top-bottom alignment
        contactNormalY = -1
      end if
    end if
  end if
  
  if relativeVelocityX <> 0 then
    contactTimeX = totalTime + (((getSpriteX(spriteName1) + getSpriteDrawWidth(spriteName1)) - getSpriteX(spriteName2)) / relativeVelocityX)
    if abs(contactTimeX) < 0.001 then contactTimeX = 0
    if (contactTimeX >= 0) and (contactTimeX < totalTime) then
      'Right-left alignment
      contactNormalX = 1
    else
      contactTimeX = totalTime + ((getSpriteX(spriteName1) - (getSpriteX(spriteName2) + getSpriteDrawWidth(spriteName2))) / relativeVelocityX)
      if abs(contactTimeX) < 0.001 then contactTimeX = 0
      if (contactTimeX >= 0) and (contactTimeX < totalTime) then
        'Left-right alignment
        contactNormalX = -1
      end if
    end if
  end if
  
  contactRef.time = 0
  contactRef.normalX = 0
  contactRef.normalY = 0
  
  if contactNormalY <> 0 then
    if contactNormalX <> 0 then
      contactRef.time = max(contactTimeX, contactTimeY)
      if contactTimeY >= contactTimeX then
        contactRef.normalY = contactNormalY
      else
        contactRef.normalX = contactNormalX
      end if
    else
      contactRef.time = contactTimeY
      contactRef.normalY = contactNormalY
    end if
  else
    if contactNormalX <> 0 then
      contactRef.time = contactTimeX
      contactRef.normalX = contactNormalX
    end if
  end if
end function