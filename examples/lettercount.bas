'Letter Count
'
'Get the number of occurences of each letter in a string.

var alphabetSize = 26
array letterCounts[alphabetSize]
var char = ""
var checkStr = ""
var countIndex = 0
var charIndex = 0
var totalLetters = 0

var barWidth = 20
var barHeight, barX, barY
var barViewHeight = 280
var canvasWidth = barWidth * alphabetSize
var canvasHeight = barViewHeight + 20

setCanvasWidth(canvasWidth)
setCanvasHeight(canvasHeight)

'Initialize letter counts
for countIndex = 0 to alphabetSize - 1
  letterCounts[countIndex] = 0
next countIndex

'Get the string to analyze as all lower case
checkStr = input("Enter text: ")
checkStr = lower(checkStr)

'Look for a letter in each character of the input string
for charIndex = 1 to len(checkStr)
  char = mid(checkStr, charIndex, 1)
  
  countIndex = asc(char) - asc("a")
  
  if countIndex >= 0 and countIndex < alphabetSize then
    letterCounts[countIndex] = letterCounts[countIndex] + 1
    totalLetters = totalLetters + 1
  end if
next charIndex

'Display results
setTextFont("12px sans-serif")

for countIndex = 0 to alphabetSize - 1
  barHeight = int((letterCounts[countIndex] / totalLetters) * barViewHeight)
  barX = countIndex * barWidth
  barY = barViewHeight - barHeight

  setFillColor("blue")
  drawRect(barX, barY, barWidth, barHeight)
  setLineColor("white")
  setLineSize(2)
  drawRect(barX, barY, barWidth, barHeight, false)

  setFillColor("black")
  drawText(chr(asc("A") + countIndex), barX + 5, barViewHeight + 15)

  print chr(asc("A") + countIndex) + " - " + letterCounts[countIndex]
next countIndex
