var imagePath = "../examples/images/"
var successImage = "success"
var failImage = "fail"
var cardBackImage = "card-back"
array cardFaceImages[6]
  cardFaceImages[0] = "star"
  cardFaceImages[1] = "square"
  cardFaceImages[2] = "circle"
  cardFaceImages[3] = "triangle"
  cardFaceImages[4] = "diamond"
  cardFaceImages[5] = "heart"

structure Card
  x
  y
  image
  isFlipped
end structure

var maxSelections = 2
array cardDeck[len(cardFaceImages) * maxSelections]
array selectedCards[maxSelections]

var cardBorderSize = 4
var cardWidth = 100, cardHeight = 100
var cardGridWidth, cardGridHeight

var resultDisplayDuration = 700
var RESULTPENDING = "pending"
var RESULTSUCCESS = "success"
var RESULTFAIL = "fail"
var result = RESULTPENDING
var gameOver = false

loadResources()
createCardDeck()
shuffleCardDeck()
calcCardGridLayout()
initCanvas()
drawCardGrid()

wait


function initResources()
  var faceIndex

  print "Loading images..."

  if not loadImage(successImage, imagePath + successImage + ".png") then
    print "Failed to load image '" + successImage + ".png'."
    end
  end if

  if not loadImage(failImage, imagePath + failImage + ".png") then
    print "Failed to load image '" + failImage + ".png'."
    end
  end if

  if not loadImage(cardBackImage, imagePath + cardBackImage + ".png") then
    print "Failed to load image '" + cardBackImage + ".png'."
    end
  end if

  for faceIndex = 0 to len(cardFaceImages) - 1
    if not loadImage(cardFaceImages[faceIndex], imagePath + cardFaceImages[faceIndex] + ".png") then
      print "Failed to load image '" + cardFaceImages[faceIndex] + ".png'."
      end
    end if
  next faceIndex
end function


function unloadResources()
  var faceIndex

  for faceIndex = 0 to len(cardFaceImages) - 1
    unloadImage(cardFaceImage[faceIndex])
  next faceIndex

  unloadImage(cardBackImage)
  unloadImage(failImage)
  unloadImage(successImage)
end function


function createCardDeck()
  var faceIndex, n, deckIndex

  for faceIndex = 0 to len(cardFaceImages) - 1
    for n = 0 to maxSelections - 1
      deckIndex = (faceIndex * maxSelections) + n
      cardDeck[deckIndex] = new Card
      cardDeck[deckIndex].image = cardFaceImages[faceIndex]
      cardDeck[deckIndex].isFlipped = false
    next n
  next faceIndex
end function


function shuffleCardDeck()
end function


function calcCardGridLayout()
  var totalColumns = getClosestSquareGridColumns(len(cardDeck))
  var totalRows = len(cardDeck) / totalColumns
  var row, column, deckIndex

  for row = 0 to totalRows - 1
    for column = 0 to totalColumns - 1
      deckIndex = (row * totalColumns) + column
      cardDeck[deckIndex].x = (column * (cardBroderSize + cardWidth)) + cardBroderSize
      cardDeck[deckIndex].y = (row * (cardBroderSize + cardHeight)) + cardBroderSize
    next column
  next row

  cardGridWidth = (totalColumns * (cardBroderSize + cardWidth)) + cardBroderSize
  cardGridHeight = (totalRows * (cardBroderSize + cardHeight)) + cardBroderSize
end function


function initCanvas()
  setCanvasWidth(cardGridWidth)
  setCanvasHeight(cardGridHeight)

  hideConsole()
  showCanvas()

  setCanvasEvent("pointerup", canvasOnPointerUp)
end function


function drawCardGrid()

end function


function canvasOnPointerUp(pointerX, pointerY)

end function


function cardOnPointerUp(card)

end function


function getClosestSquareGridColumns(gridItemCount)
  array factors[0]
  var num = 1

  while (num ^ 2) <= gridItemCount
    if (gridItemCount % num) = 0 then addArrayItem(factors, num)
    num = num + 1
  wend

  return factors[len(factors) - 1]
end function
