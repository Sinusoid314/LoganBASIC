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

var canvasWidth = 400
var canvasHeight = 600
var gameBoardX = 0
var gameBoardY = 0
var gameBoardWidth = canvasWidth
var gameBoardHeight = canvasHeight

var maxSelections = 2
var cardCount = len(cardFaceImages) * maxSelections
var cardGridColumns = getClosestSquareGridColumns(cardCount)
var resultDisplayDuration = 700
var RESULT_PENDING = "pending"
var RESULT_SUCCESS = "success"
var RESULT_FAIL = "fail"

array cardDeck[cardCount]
array selectedCards[maxSelections]
var result = RESULT_PENDING
var gameOver = false

loadResources()
initCanvas()

wait


function initResources()

end function


function unloadResources()

end function


function initCanvas()
  setCanvasWidth(canvasWidth)
  setCanvasHeight(canvasHeight)

  hideConsole()
  showCanvas()

  setCanvasEvent("pointerup", canvasOnPointerUp)
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
