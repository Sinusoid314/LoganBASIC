'Bouncing Sprites
'
'

structure Sprite
  x
  y
  width
  height
  scale
  velX
  velY
  updatesPerFrame
  frameImages
  currFrameIndex
  frameUpdateCount
end structure

array sprites[3]
var prevTime
var deltaTime
var canvasWidth = 500
var canvasHeight = 400

setup()
mainLoop()

wait

function setup()
  var spriteIndex
  var currSprite

  print "Loading images..."
  
  if not loadImage("ship1", "../examples/ship1.png") then
    print "Failed to load image 'ship1.png'."
    end
  end if
  
  if not loadImage("ship2", "../examples/ship2.png") then
    print "Failed to load image 'ship2.png'."
    end
  end if
  
  print "Images loaded."
  
  for spriteIndex = 0 to len(sprites) - 1
    sprites[spriteIndex] = new Sprite
    currSprite = sprites[spriteIndex]
    
    currSprite.x = int(rnd()*100) + 1
    currSprite.y = int(rnd()*100) + 1
    currSprite.width = getImageWidth("ship1")
    currSprite.height = getImageHeight("ship1") 
    currSprite.scale = rnd()*2 + 1
    currSprite.velX = int(rnd()*100) + 1
    currSprite.velY = int(rnd()*100) + 1
    currSprite.updatesPerFrame = int(rnd()*50) + 1
    currSprite.frameImages = new array[2]
    currSprite.frameImages[0] = "ship1"
    currSprite.frameImages[1] = "ship2"
  next spriteIndex

  hideConsole()
  
  setCanvasWidth(canvasWidth)
  setCanvasHeight(canvasHeight)
  
  enableCanvasBuffer()
  
  prevTime = time()
end function

function mainLoop()
  updateSprites()
  checkCollisions()
  drawSprites()
  drawCanvasBuffer(mainLoop)
end function

function updateSprites()
  var spriteIndex
  var currSprite
  
  deltaTime = (time() - prevTime) / 1000
  prevTime = time()
  
  for spriteIndex = 0 to len(sprites) - 1
    currSprite = sprites[spriteIndex]
    
    currSprite.x = currSprite.x + (currSprite.velX * deltaTime)
    currSprite.y = currSprite.y + (currSprite.velY * deltaTime)

    currSprite.frameUpdateCount = currSprite.frameUpdateCount + 1
    if currSprite.frameUpdateCount = currSprite.updatesPerFrame then
      currSprite.currFrameIndex = (currSprite.currFrameIndex + 1) % len(currSprite.frameImages)
      currSprite.frameUpdateCount = 0
    end if
  next spriteIndex
end function

function checkCollisions()
  var spriteIndex
  var currSprite
  
  for spriteIndex = 0 to len(sprites) - 1
    currSprite = sprites[spriteIndex]
    
    if currSprite.x <= 0 then
      if currSprite.velX < 0 then currSprite.velX = -currSprite.velX
    else
      if (currSprite.x + (currSprite.width * currSprite.scale)) >= canvasWidth then
        if currSprite.velX > 0 then currSprite.velX = -currSprite.velX
      end if
    end if
    
    if currSprite.y <= 0 then
      if currSprite.velY < 0 then currSprite.velY = -currSprite.velY
    else
      if (currSprite.y + (currSprite.height * currSprite.scale)) >= canvasHeight then
        if currSprite.velY > 0 then currSprite.velY = -currSprite.velY
      end if
    end if
  next spriteIndex
end function

function drawSprites()
  var spriteIndex
  var currSprite
  var drawWidth, drawHeight
  
  clearCanvas()
  
  for spriteIndex = 0 to len(sprites) - 1
    currSprite = sprites[spriteIndex]
    
    drawWidth = currSprite.width * currSprite.scale
    drawHeight = currSprite.height * currSprite.scale
    
    drawImage(currSprite.frameImages[currSprite.currFrameIndex], currSprite.x, currSprite.y, drawWidth, drawHeight)
  next spriteIndex
end function
