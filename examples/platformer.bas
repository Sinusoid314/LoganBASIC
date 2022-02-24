'Scrolling Platformer
'
'A small, simple demo of a scrolling platformer game.

var prevTime
var deltaTime
var canvasWidth = 600
var canvasHeight = 400
var bgOffsetX = 0
var gravityVal = 100
var jumping = false
var facingDir = "right"
var leftKeyDown = false
var rightKeyDown = false

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
  
  print "Images loaded."
    
  addSprite("bubba", "bubba-sheet", 200, 10)
  setSpriteFrameRange("bubba", 0, 0)
  setSpriteFrameRate("bubba", 5)
  
  addSprite("curb1", "curb-sheet", 0, 375)
  addSprite("curb2", "curb-sheet", 700, 375)
    
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


'Main update & draw loop
function mainLoop()
  deltaTime = (time() - prevTime) / 1000
  prevTime = time()
  
  applyGravity()
  
  updateSprites(deltaTime)
  
  checkCollisions()
  
  clearCanvas()
  
  drawImageTiled("bg", 0, 0, canvasWidth, canvasHeight, -bgOffsetX, 0)
  
  drawSprites()
  
  drawText(str(deltaTime * 1000) + " ms", 10, 10)
  
  drawCanvasBuffer(mainLoop)
end function


'Make Bubba either walk or jump when the appropriate key is pressed down
function onKeyDown(key)
  if (key = " ") and (not jumping) then
    if facingDir = "right" then
      setSpriteFrameRange("bubba", 4, 4)
    else
      setSpriteFrameRange("bubba", 9, 9)
    end if
    
    setSpriteVelocityY("bubba", -200)
    jumping = true
  end if

  if not (leftKeyDown or rightKeyDown) then
    if key = "ArrowLeft" then
      leftKeyDown = true
      facingDir = "left"
      setSpriteFrameRange("bubba", 6, 8)
      setSpriteVelocityX("bubba", -100)
      return
    end if
  
    if key = "ArrowRight" then
      rightKeyDown = true
      facingDir = "right"
      setSpriteFrameRange("bubba", 1, 3)
      setSpriteVelocityX("bubba", 100)
      return
    end if
  end if
end function


'Stop moving Bubba when the arrow key is released
function onKeyUp(key)
  if (key = "ArrowLeft") and leftKeyDown then
    leftKeyDown = false
    setSpriteFrameRange("bubba", 5, 5)
    setSpriteVelocityX("bubba", 0)
    return
  end if
  
  if (key = "ArrowRight") and rightKeyDown then
    rightKeyDown = false
    setSpriteFrameRange("bubba", 0, 0)
    setSpriteVelocityX("bubba", 0)
    return
  end if
end function


'Apply the gravity acceleration value to Bubba's y-velocity
function applyGravity()
  var newVelocityY
  
  newVelocityY = getSpriteVelocityY("bubba") + (gravityVal * deltaTime)
  setSpriteVelocityY("bubba", newVelocityY)
end function


'React to any sprites that are touching
function checkCollisions()
  bubbaHitCurb()
  bubbaHitEdge()
end function


'React if Bubba is touching either of the curbs
function bubbaHitCurb()
  if not (spritesOverlap("bubba", "curb1") or spritesOverlap("bubba", "curb2")) then return
    
  setSpriteY("bubba", getSpriteY("curb1") - getSpriteDrawHeight("bubba"))
  setSpriteVelocityY("bubba", 0)
  
  if jumping then
    if facingDir = "right" then
      setSpriteFrameRange("bubba", 0, 0)
    else
      setSpriteFrameRange("bubba", 5, 5)
    end if
    
    jumping = false
  end if
end function


function bubbaHitEdge()
  if getSpriteX("bubba") <= 0 then setSpriteX("bubba", 0)
end function
