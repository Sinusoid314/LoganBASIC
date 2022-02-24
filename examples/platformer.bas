'Scrolling Platformer
'
'A small, simple demo of a scrolling platformer game.

var prevTime
var deltaTime
var canvasWidth = 600
var canvasHeight = 400
var bgOffsetX = 0
var gravityVal = 100
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


'Move Bubba when either the left or right arrows keys are pressed down
function onKeyDown(key)
  if leftKeyDown or rightKeyDown then return

  if key = "ArrowLeft" then
    leftKeyDown = true
    setSpriteFrameRange("bubba", 6, 8)
    setSpriteVelocityX("bubba", -100)
    return
  end if
  
  if key = "ArrowRight" then
    rightKeyDown = true
    setSpriteFrameRange("bubba", 1, 3)
    setSpriteVelocityX("bubba", 100)
    return
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
end function


'React if Bubba is touching either of the curbs
function bubbaHitCurb()
  if spritesOverlap("bubba", "curb1") or spritesOverlap("bubba", "curb2") then
    setSpriteY("bubba", getSpriteY("curb1") - getSpriteDrawHeight("bubba"))
    setSpriteVelocityY("bubba", 0)
  end if
end function
