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
var cardWidth, cardHeight
var gameBoardX, gameBoardY
var gameBoardWidth, gameBoardHeight
var gameOver = false

var resultDisplayDuration = 700
var RESULTPENDING = "pending"
var RESULTSUCCESS = "success"
var RESULTFAIL = "fail"
var result = RESULTPENDING

loadResources()
initCanvas()
drawGameBoard()

wait


function initResources()

end function


function unloadResources()

end function


function initCanvas()
  setCanvasWidth(400)
  setCanvasHeight(600)

  hideConsole()
  showCanvas()

  setCanvasEvent("pointerup", canvasOnPointerUp)
end function


function drawGameBoard()

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
