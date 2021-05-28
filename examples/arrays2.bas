var gridWidth = 5
var gridHeight = 3
array grid[gridWidth, gridHeight]
var row = ""
var x = 0
var y = 0

while y < gridHeight
  x = 0
  while x < gridWidth
    row = row + "(" + x + "," + y + ")" + "  "
    x = x + 1
  wend
  print row
  row = ""
  y = y + 1
wend
