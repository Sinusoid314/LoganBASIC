loadImage("fish", "../examples/fishy-fart-os.png")

print "Loading image..."
startTimer(2000, drawFish)

wait

function drawFish()
  print "Image loaded."
  drawImage("fish", 10, 10)
  print "Image drawn."
  startTimer(2000, eraseFish)
end function

function eraseFish()
  clearCanvas()
  print "Image erased."
  startTimer(2000, done)
end function

function done()
  unloadImage("fish")
  print "Done."
  end
end function