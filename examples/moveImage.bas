var xPos = 0, yPos = 0

loadImage("fish", "../examples/fishy-fart-os.png")

enableCanvasBuffer()

drawLoop()

wait

function drawLoop()
  xPos = xPos + 2
  yPos = yPos + 2

  if xPos > 100 then
    unloadImage("fish")
    end
  end if

  clearCanvas()
  drawImage("fish", xPos, yPos)

  drawCanvasBuffer(drawLoop)
end function