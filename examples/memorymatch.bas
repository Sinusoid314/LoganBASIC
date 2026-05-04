'Memory Match
'
'Flip over any two cards and see if they match.

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
  isSelected
end structure

var maxSelections = 2
array cardDeck[len(cardFaceImages) * maxSelections]
array selectedCards[0]
var flippedCardsCount = 0

var cardUnselectedBorderColor = "palegreen"
var cardSelectedBorderColor = "gold"
var cardBorderSize = 4
var cardWidth = 100, cardHeight = 100
var cardGridX, cardGridY
var cardGridWidth, cardGridHeight
var triesLabel = "Tries:  "
var timeLabel = "Time:  "
var headerX, headerY
var headerWidth, headerHeight
var canvasWidth, canvasHeight

var resultDisplayDuration = 700
var RESULTPENDING = "pending"
var RESULTSUCCESS = "success"
var RESULTFAIL = "fail"
var result = RESULTPENDING
var tryCount = 0
var gameTime = 0
var gameTimerIsRunning = false

loadResources()
createCardDeck()
shuffleCardDeck()
calcDrawLayout()
initCanvas()
drawHeader()
drawCardGrid()

wait


function loadResources()
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
      cardDeck[deckIndex].isSelected = false
    next n
  next faceIndex
end function


function shuffleCardDeck()
  var swapCard
  var deckIndex, swapIndex

  for deckIndex = len(cardDeck) - 1 to 1 step -1
    swapIndex = int(rnd() * (deckIndex + 1))
    swapCard = cardDeck[swapIndex]
    cardDeck[swapIndex] = cardDeck[deckIndex]
    cardDeck[deckIndex] = swapCard
  next deckIndex
end function


function calcDrawLayout()
  var totalColumns = getClosestSquareGridColumns(len(cardDeck))
  var totalRows = len(cardDeck) / totalColumns
  var row, column, deckIndex

  headerX = 0
  headerY = 0
  headerHeight = 30

  cardGridX = 0
  cardGridY = headerY + headerHeight
  cardGridWidth = (totalColumns * ((cardBorderSize * 2) + cardWidth))
  cardGridHeight = (totalRows * ((cardBorderSize * 2) + cardHeight))

  headerWidth = cardGridWidth
  canvasWidth = cardGridWidth
  canvasHeight = cardGridY + cardGridHeight

  for row = 0 to totalRows - 1
    for column = 0 to totalColumns - 1
      deckIndex = (row * totalColumns) + column
      cardDeck[deckIndex].x = (column * ((cardBorderSize * 2) + cardWidth)) + cardBorderSize + cardGridX
      cardDeck[deckIndex].y = (row * ((cardBorderSize * 2) + cardHeight)) + cardBorderSize + cardGridY
    next column
  next row
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


function initCanvas()
  setCanvasWidth(canvasWidth)
  setCanvasHeight(canvasHeight)

  hideConsole()
  showCanvas()

  setCanvasEvent("pointerup", canvasOnPointerUp)
end function


function drawHeader()
  var textX, textY
  var triesText = str(tryCount)
  var timeMinutes = int(gameTime / 60)
  var timeSeconds = gameTime % 60
  var timeText = str(timeMinutes) + "m:" + str(timeSeconds) + "s"

  setFillColor("lightgray")
  drawRect(headerX, headerY, headerWidth, headerHeight, true)

  setLineSize(1)
  setLineColor("black")
  drawRect(headerX, headerY, headerWidth, headerHeight, false)

  setFillColor("black")
  setTextFont("14px system-ui")

  textX = 10
  textY = (headerHeight / 2) - (getTextDrawHeight(triesLabel) / 2)
  drawText(triesLabel, textX,  textY)
  drawText(triesText, textX + getTextDrawWidth(triesLabel), textY)

  textX = textX + getTextDrawWidth(triesLabel + triesText) + 50
  textY = (headerHeight / 2) - (getTextDrawHeight(timeLabel) / 2)
  drawText(timeLabel, textX,  textY)
  drawText(timeText, textX + getTextDrawWidth(timeLabel), textY)
end function


function drawCardGrid()
  var deckIndex, card

  for deckIndex = 0 to len(cardDeck) - 1
    drawCard(cardDeck[deckIndex])
  next deckIndex
end function


function drawCard(card)
  var borderColor, image

  if card.isFlipped then
    image = card.image
  else
    image = cardBackImage
  end if

  if card.isSelected then
    borderColor = cardSelectedBorderColor
  else
    borderColor = cardUnselectedBorderColor
  end if

  setLineColor(borderColor)
  setLineSize(cardBorderSize)
  drawRect(card.x - (cardBorderSize / 2), card.y - (cardBorderSize / 2), cardWidth + cardBorderSize, cardHeight + cardBorderSize, false)
  drawImage(image, card.x, card.y, cardWidth, cardHeight)
end function


function drawResult()
  var resultImage, imageX, imageY

  if result = RESULTSUCCESS then
    resultImage = successImage
  else
    resultImage = failImage
  end if

  imageX = (cardGridWidth / 2) - (getImageWidth(resultImage) / 2)
  imageY = (cardGridHeight / 2) - (getImageHeight(resultImage) / 2)

  drawImage(resultImage, imageX, imageY)

  pauseFor(resultDisplayDuration)
end function


function drawGameOver()
  var textX, textY, textWidth, textHeight
  var rectX, rectY, rectWidth, rectHeight
  var text = "GAME OVER"

  setTextFont("50px bold")

  textWidth = getTextDrawWidth(text)
  textHeight = getTextDrawHeight(text)
  textX = (cardGridWidth / 2) - (textWidth / 2)
  textY = (cardGridHeight / 2) - (textHeight / 2)

  rectWidth = textWidth * 1.05
  rectHeight = textHeight * 1.65
  rectX = textX - ((rectWidth - textWidth) / 2)
  rectY = textY - ((rectHeight - textHeight) / 2)

  setFillColor("black")
  drawRect(rectX + 1, rectY + 1, rectWidth, rectHeight, true)

  setFillColor("palegreen")
  drawRect(rectX, rectY, rectWidth, rectHeight, true)

  setFillColor("white")
  drawText(text, textX + 2, textY + 2)

  setFillColor("black")
  drawText(text, textX, textY)
end function


function canvasOnPointerUp(pointerX, pointerY)
  var deckIndex

  for deckIndex = 0 to len(cardDeck) - 1
    if pointInRect(pointerX, pointerY, cardDeck[deckIndex].x, cardDeck[deckIndex].y, cardWidth, cardHeight) then
      cardOnPointerUp(cardDeck[deckIndex])
      exit for
    end if
  next deckIndex
end function


function cardOnPointerUp(card)
  if card.isFlipped then return
  if result <> RESULTPENDING then return

  card.isFlipped = true
  card.isSelected = true
  addArrayItem(selectedCards, card)
  flippedCardsCount = flippedCardsCount + 1

  drawCard(card)

  if not gameTimerIsRunning then
    startTimer(1000, gameTimerOnTick)
    gameTimerIsRunning = true
  end if

  if len(selectedCards) < maxSelections then return

  result = compareSelectedCards()

  drawResult()

  startNewTry()
end function


function compareSelectedCards()
  var cardIndex

  for cardIndex = 1 to len(selectedCards) - 1
    if selectedCards[0].image <> selectedCards[cardIndex].image then return RESULTFAIL
  next cardIndex

  return RESULTSUCCESS
end function


function startNewTry()
  var cardIndex

  for cardIndex = 0 to len(selectedCards) - 1
    selectedCards[cardIndex].isSelected = false
    if result = RESULTFAIL then
      selectedCards[cardIndex].isFlipped = false
      flippedCardsCount = flippedCardsCount - 1
    end if
  next cardIndex

  redim selectedCards[0]

  result = RESULTPENDING
  tryCount = tryCount + 1

  drawHeader()
  drawCardGrid()

  if flippedCardsCount = len(cardDeck) then
    drawGameOver()
    stopTimer()
    end
  end if
end function


function gameTimerOnTick()
  gameTime = gameTime + 1
  drawHeader()
end function
