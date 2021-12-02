'Breakout
'
'

structure Vector2D
  x
  y
end structure

var gapHeight = 200

var brickColumns = 4
var brickRows = 4

var brickSize = new Vector2D
    brickSize.x = 100
    brickSize.y = 25

array brickPositions[brickColumns * brickRows]
var brickPadding = 8
var brickColor = "black"

var canvasSize = new Vector2D
    canvasSize.x = ((brickSize.x + brickPadding) * brickColumns) + brickPadding
    canvasSize.y = ((brickSize.y + brickPadding) * brickRows) + gapHeight

var paddleSize = new Vector2D
    paddleSize.x = 80
    paddleSize.y = 10

var paddlePosition = new Vector2D
    paddlePosition.x = (canvasSize.x - paddleSize.x) / 2
    paddlePosition.y = canvasSize.y - paddleSize.y - 10
    
var paddleVelocity = new Vector2D
    paddleVelocity.x = 0
    paddleVelocity.y = 0

var paddleColor = "blue"

var ballRadius = 10
var ballPosition = new Vector2D
    ballPosition.x = canvasWidth / 2
    ballPosition.y = canvasHeight - gapHeight + 20
    
var ballVelocity = new Vector2D
    ballVelocity.x = 0
    ballVelocity.y = 5
    
var ballColor = "red"

var prevTime

hideConsole()
enableCanvasBuffer()

setupBricks()

prevTime = time()
draw()

wait

function setupBricks()
  var column, row, index
  
  for column = 0 to brickColumns - 1
    for row = 0 to brickRows - 1
      index = column + (row * brickColumns)
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
  
  ballPosition.x = ballPosition.x + (ballVelocity.x * deltaTime)
  ballPosition.y = ballPosition.y + (ballVelocity.y * deltaTime)
  
  paddlePosition.x = paddlePosition.x + (paddleVelocity.x * deltaTime)
  paddlePosition.y = paddlePosition.y + (paddleVelocity.y * deltaTime)
end function

function checkCollisions()
  if ballHitPaddle() then
    return
  end if
  
  if ballHitBrick() then
    return
  end if
  
  if ballHitBottom then
    gameOver("LOSER!!!")
  end if
end function

function draw()
  var brickIndex
  
  setFillColor(brickColor)
  for brickIndex = 0 to len(brickPositions) - 1
      drawRect(brickPositions[brickIndex].x, brickPositions[brickIndex].y, brickSize.x, brickSize.y)
    next row
  next column
  
  setFillColor(ballColor)
  drawCircle(ballPosition.x, ballPosition.y, ballRadius)
  
  setFillColor(paddleColor)
  drawRect(paddlePosition.x, paddlePosition.y, paddleSize.x, paddleSize.y)
  
  drawCanvasBuffer(mainLoop)
end function

function ballHitPaddle()
end function

function ballHitBrick()
end function

function ballHitBottom()
end function

function gameOver(message)
  print message
  end
end function
