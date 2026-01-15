'Conway's Game of Life
'
'A cellular automaton consisting of a grid of cells, each of which is either
'alive or dead, which change over time. An initial grid is randomly generated,
'and each subsequent generation of cells is generated based on the following rules:
'
'- Any live cell with two or three live neighbors survives.
'- Any dead cell with three live neighbors becomes a live cell.
'- All other live cells die in the next generation, and all other dead cells stay dead.

var cellCountX = 50
var cellCountY = 30
var cellSize = 8
var aliveColor = "black"
var deadColor = "white"
array currCells[cellCountX, cellCountY]
array nextCells[cellCountX, cellCountY]
var updateTime = 200
var prevTime = time()

setCanvasWidth(cellCountX * cellSize)
setCanvasHeight(cellCountY * cellSize)

hideConsole()
showCanvas()

enableCanvasBuffer()

setupCells()
drawCells()
drawCanvasBuffer(mainLoop)

wait


'Generate the initial cells
function setupCells()
  var cellX, cellY

  for cellY = 0 to cellCountY - 1
    for cellX = 0 to cellCountX - 1
      currCells[cellX, cellY] = rnd() > 0.5
    next cellX
  next cellY
end function


'Main update & draw loop
function mainLoop()
  var deltaTime = time() - prevTime

  if deltaTime >= updateTime then
    prevTime = time()
    updateCells()
    drawCells()
  end if

  drawCanvasBuffer(mainLoop)
end function


'Draw the cells on the canvas
function drawCells()
  var cellX, cellY

  clearCanvas()

  for cellY = 0 to cellCountY - 1
    for cellX = 0 to cellCountX - 1
      if currCells[cellX, cellY] then
        setFillColor(aliveColor)
      else
        setFillColor(deadColor)
      end if

      drawRect(cellX * cellSize, cellY * cellSize, cellSize, cellSize)
    next cellX
  next cellY
end function


'Update the state (alive or dead) of each cell
function updateCells()
  var cellX, cellY
  var aliveCount
  var tempArray

  for cellY = 0 to cellCountY - 1
    for cellX = 0 to cellCountX - 1
      aliveCount = getAliveNeighborCount(cellX, cellY)

      if aliveCount = 2 then
        nextCells[cellX, cellY] = currCells[cellX, cellY]
      else
        if aliveCount = 3 then
          nextCells[cellX, cellY] = true
        else
          nextCells[cellX, cellY] = false
        end if
      end if
    next cellX
  next cellY

  tempArray = currCells
  currCells = nextCells
  nextCells = tempArray
end function


'Return the number of alive cells surrounding the given cell
function getAliveNeighborCount(cellX, cellY)
  var neighborX, neighborY
  var aliveCount = 0

  for neighborY = cellY - 1 to cellY + 1
    for neighborX = cellX - 1 to cellX + 1
      if not (neighborX = cellX and neighborY = cellY) then
        if neighborIsAlive(neighborX, neighborY) then aliveCount = aliveCount + 1
      end if
    next neighborX
  next neighborY

  return aliveCount
end function


'Return the state of the given cell, or return false if the cell is out of the grid bounds
function neighborIsAlive(x, y)
  if (x < 0) or (x >= cellCountX) or (y < 0) or (y >= cellCountY) then
    return false
  end if

  return currCells[x, y]
end function
