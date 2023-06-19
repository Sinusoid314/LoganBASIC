'Bouncing Sprites
'
'Draws multiple sprites that move around the canvas.

array spriteNames[3]
var prevTime
var deltaTime
var maxDeltaTime = 0.25
var canvasWidth = 600
var canvasHeight = 450

setup()
mainLoop()

wait


'Load the images and sounds, and create the sprites with random velocities and sizes
function setup()
  var index
  var name
  var initX, initY
  var scaleWidth, scaleHeight

  print "Loading images..."

  if not loadImage("bg", "../examples/images/space.bmp") then
    print "Failed to load image 'bg.bmp'."
    end
  end if
  
  if not loadSpriteSheet("ship-sheet", "../examples/images/ship-sheet.png", 2, 1) then
    print "Failed to load image 'ship-sheet.png'."
    end
  end if
  
  print "Images loaded."
  
  print "Loading sound file..."
  
  if not loadSound("25c", "../examples/sounds/25c.wav") then
    print "Failed to load sound '25c.wav'."
    end
  end if
  
  print "Sound loaded."
  
  for index = 0 to len(spriteNames) - 1    
    spriteNames[index] = "ship" + str(index)
    name = spriteNames[index]
    
    initX = int(rnd()*100) + 1
    initY = int(rnd()*100) + 1
    
    addSprite(name, "ship-sheet", initX, initY)
    
    scaleWidth = getSpriteDrawWidth(name) * (rnd()*2 + 1)
    scaleHeight = getSpriteDrawHeight(name) * (rnd()*2 + 1)
    
    setSpriteDrawWidth(name, scaleWidth)
    setSpriteDrawHeight(name, scaleHeight)
    
    setSpriteVelocityX(name, int(rnd()*100) + 1)
    setSpriteVelocityY(name, int(rnd()*100) + 1)
    
    setSpriteFrameRate(name, int(rnd()*50) + 1)
  next index

  setCanvasWidth(canvasWidth)
  setCanvasHeight(canvasHeight)

  hideConsole()
  showCanvas()
  
  enableCanvasBuffer()
  
  setFillColor("white")
  
  prevTime = time()
end function


'Main update & draw loop
function mainLoop()
  deltaTime = min(((time() - prevTime) / 1000), maxDeltaTime)
  prevTime = time()
  
  updateSprites(deltaTime)
  
  checkCollisions()
  
  clearCanvas()
  drawImage("bg", 0, 0, canvasWidth, canvasHeight)
  drawSprites()
  drawText(str(deltaTime * 1000) + " ms", 10, 10)
  
  drawCanvasBuffer(mainLoop)
end function


'Make the sprites bounce back if they hit the edge of the canvas
function checkCollisions()
  var index
  var name
  var x, y
  var velX, velY

  for index = 0 to len(spriteNames) - 1
    name = spriteNames[index]
    x = getSpriteX(name)
    y = getSpriteY(name)
    velX = getSpriteVelocityX(name)
    velY = getSpriteVelocityY(name)
  
    if x <= 0 then
      if velX < 0 then
        setSpriteVelocityX(name, -velX)
        playSound("25c")
      end if
    else
      if (x + getSpriteDrawWidth(name)) >= canvasWidth then
        if velX > 0 then
          setSpriteVelocityX(name, -velX)
          playSound("25c")
        end if
      end if
    end if
    
    if y <= 0 then
      if velY < 0 then
        setSpriteVelocityY(name, -velY)
        playSound("25c")
      end if
    else
      if (y + getSpriteDrawHeight(name)) >= canvasHeight then
        if velY > 0 then
          setSpriteVelocityY(name, -velY)
          playSound("25c")
        end if
      end if
    end if
  next index
end function
