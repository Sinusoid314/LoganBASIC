var tickCount = 0
var xPos = 0, yPos = 0

loadImage("fish", "../examples/fishy-fart-os.png")

enableCanvasBuffer()

startTimer(100, onTick)

wait

function onTick()
  tickCount = tickCount + 1
  xPos = xPos + 2
  yPos = yPos + 2

  clearCanvas()
  drawImage("fish", xPos, yPos)
  drawCanvasBuffer()

  if tickCount = 100 then
    stopTimer()
    unloadImage("fish")
    end
  end if
end function