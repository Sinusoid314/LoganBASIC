'Breakout
'
'

structure Position
  x
  y
end structure

var gapHeight = 200
var brickColumns = 4
var brickRows = 4

var brickWidth = 100
var brickHeight = 25
array brickPositions[brickColumns * brickRows]
var brickPadding = 8
var brickColor = "black"

var canvasWidth = ((brickWidth + brickPadding) * brickColumns) + brickPadding
var canvasHeight = ((brickHeight + brickPadding) * brickRows) + gapHeight

var paddleWidth = 80
var paddleHeight = 10
var paddleX = (canvasWidth - paddleWidth) / 2
var paddleY = canvasHeight - paddleHeight - 10
var paddleVelX = 0
var paddleVelXMax = 70
var paddleColor = "blue"

var ballRadius = 10
var ballX = canvasWidth / 2
var ballY = canvasHeight - gapHeight + 20
var ballVelX = 0
var ballVelY = 70
var ballColor = "red"

var prevTime

hideConsole()
showCanvas()
setCanvasWidth(canvasWidth)
setCanvasHeight(canvasHeight)
enableCanvasBuffer()

setupBricks()

setCanvasEvent("keydown", onKeyDown)
setCanvasEvent("keyup", onKeyUp)

prevTime = time()
draw()

wait

function setupBricks()
  var column, row, index
  
  for column = 0 to brickColumns - 1
    for row = 0 to brickRows - 1
      index = column + (row * brickColumns)
      brickPositions[index] = new Position
      brickPositions[index].x = brickPadding + ((brickPadding + brickWidth) * column)
      brickPositions[index].y = brickPadding + ((brickPadding + brickHeight) * row)
    next row
  next column
end function

function mainLoop()
  update()
  checkCollisions()
  draw()
end function

function update()
  var deltaTime = (time() - prevTime) / 1000
  prevTime = time()
  
  ballX = ballX + (ballVelX * deltaTime)
  ballY = ballY + (ballVelY * deltaTime)
  
  paddleX = paddleX + (paddleVelX * deltaTime)
end function

function checkCollisions()
  if ballHitPaddle() then return
  if ballHitBrick() then return
  if ballHitSide() then return
  if ballHitTop() then return
  ballHitBottom()
end function

function draw()
  var brickIndex
  
  clearCanvas()

  setFillColor(brickColor)
  for brickIndex = 0 to len(brickPositions) - 1
      drawRect(brickPositions[brickIndex].x, brickPositions[brickIndex].y, brickWidth, brickHeight)
  next brickIndex
  
  setFillColor(ballColor)
  drawCircle(ballX, ballY, ballRadius)
  
  setFillColor(paddleColor)
  drawRect(paddleX, paddleY, paddleWidth, paddleHeight)
  
  drawCanvasBuffer(mainLoop)
end function

function onKeyDown(key)
  if key = "ArrowLeft" then
    paddleVelX = -paddleVelXMax
    return
  end if
  
  if key = "ArrowRight" then
    paddleVelX = paddleVelXMax
    return
  end if
end function

function onKeyUp(key)
  paddleVelX = 0
end function

function ballHitPaddle()
  if ballHitRect(paddleX, paddleY, paddleWidth, paddleHeight) then
    if ballVelY > 0 then
      ballVelX = paddleVelX
      ballVelY = -ballVelY
    end if
    return true
  else
    return false
  end if
end function

function ballHitBrick()
  var brickIndex

  for brickIndex = 0 to len(brickPositions) - 1
    if ballHitRect(brickPositions[brickIndex].x, brickPositions[brickIndex].y, brickWidth, brickHeight) then
      removeArrayItem(brickPositions, brickIndex)
      ballVelY = -ballVelY
      return true
    end if
  next brickIndex
  
  return false
end function

function ballHitSide()
  if ballX - ballRadius <= 0 then
    if ballVelX < 0 then ballVelX = -ballVelX
    return true
  end if
  
  if ballX + ballRadius >= canvasWidth then
    if ballVelX > 0 then ballVelX = -ballVelX
    return true
  end if
  
  return false
end function

function ballHitTop()
  if ballY - ballRadius <= 0 then
    if ballVelY < 0 then ballVelY = -ballVelY
    return true
  else
    return false
  end if
end function

function ballHitBottom()
  if ballY + ballRadius >= canvasHeight then
    gameOver("LOSER!!!")
  end if
end function

function ballHitRect(x, y, width, height)
  var closestX = clamp(ballX, x, x + width)
  var closestY = clamp(ballY, y, y + height)
  var distanceX = ballX - closestX
  var distanceY = ballY - closestY
  var distance = (distanceX ^ 2) + (distanceY ^ 2)
  
  return distance < (ballRadius ^ 2)
end function

function gameOver(message)
  drawText(message, (canvasWidth + 100) / 2, (canvasHeight + 25) / 2)
  end
end function
