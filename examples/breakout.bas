'Breakout
'
'A version of the classic game where the objective is to
'knock out all the bricks with a ball and paddle.
'Use the left and right arrow keys to move the paddle.

structure Position
  x
  y
end structure

var gameOver = false
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
var paddleY = canvasHeight - paddleHeight - 20
var paddleVelX = 0
var paddleVelXMax = 250
var paddleColor = "blue"

var ballRadius = 10
var ballX = canvasWidth / 2
var ballY = canvasHeight - gapHeight + 20
var ballVelX = 0
var ballVelY = 250
var ballColor = "red"

var prevTime
var maxDeltaTime = 0.03

setCanvasWidth(canvasWidth)
setCanvasHeight(canvasHeight)

hideConsole()
showCanvas()

enableCanvasBuffer()

setupBricks()

setCanvasEvent("keydown", onKeyDown)
setCanvasEvent("keyup", onKeyUp)

prevTime = time()
draw()

wait


'Create the bricks
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


'Main update & draw loop
function mainLoop()
  if gameOver then
    disableCanvasBuffer()
    drawText("GAME OVER", canvasWidth / 2, canvasHeight / 2)
    end
  end if
  
  update()
  checkCollisions()
  draw()
  displayControls()
end function


'Update the ball and paddle positions based of their velocities
function update()
  var deltaTime = min(((time() - prevTime) / 1000), maxDeltaTime)
  prevTime = time()
  
  ballX = ballX + (ballVelX * deltaTime)
  ballY = ballY + (ballVelY * deltaTime)
  
  paddleX = paddleX + (paddleVelX * deltaTime)
end function


'Check all the possible collisions
function checkCollisions()
  if ballHitPaddle() then return
  if ballHitBrick() then return
  if ballHitSide() then return
  if ballHitTop() then return
  ballHitBottom()
end function


'Draw the bricks, paddle, and ball to the canvas
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


'Move the paddle when either the left or right arrows keys are pressed down
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


'Stop moving the paddle when the arrow key is released
function onKeyUp(key)
  if (key = "ArrowLeft") or (key = "ArrowRight") then
    paddleVelX = 0
  end if
end function


'Return true if the ball is touching the paddle
function ballHitPaddle()
  if ballHitRect(paddleX, paddleY, paddleWidth, paddleHeight) then
    if ballVelY > 0 then
      if paddleVelX <> 0 then ballVelX = paddleVelX
      ballVelY = -ballVelY
    end if
    return true
  else
    return false
  end if
end function


'Return true if the ball is touching one of the bricks
function ballHitBrick()
  var brickIndex

  for brickIndex = 0 to len(brickPositions) - 1
    if ballHitRect(brickPositions[brickIndex].x, brickPositions[brickIndex].y, brickWidth, brickHeight) then
      removeArrayItem(brickPositions, brickIndex)
      
      if len(brickPositions) = 0 then gameOver = true
      
      ballVelY = -ballVelY
      
      return true
    end if
  next brickIndex
  
  return false
end function


'Return true if the ball is touching either the left or right edge of the canvas
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


'Return true if the ball is touching the top edge of the canvas
function ballHitTop()
  if ballY - ballRadius <= 0 then
    if ballVelY < 0 then ballVelY = -ballVelY
    return true
  else
    return false
  end if
end function


'Return true if the ball is touching the bottom edge of the canvas
function ballHitBottom()
  if ballY + ballRadius >= canvasHeight then gameOver = true
end function


'Return true if the ball is touching the given rectangle
function ballHitRect(x, y, width, height)
  var closestX = clamp(ballX, x, x + width)
  var closestY = clamp(ballY, y, y + height)
  var distanceX = ballX - closestX
  var distanceY = ballY - closestY
  var distance = (distanceX ^ 2) + (distanceY ^ 2)
  
  return distance < (ballRadius ^ 2)
end function

'Display the control intstructions on the screen
function displayControls()
  setTextFont("12px system-ui")
  setFillColor("black")
  drawText("Controls:    Left/right arrow keys = Move paddle left/right", 10, canvasHeight - 5)
end function