loadImage("fish", "../examples/fishy-fart-os.png")

setCanvasEvent("pointerup", onPointerUp)
setCanvasEvent("keyup", onKeyUp)

wait

function onPointerUp(pointerX, pointerY)
  drawImage("fish", pointerX, pointerY)
end function

function onKeyUp(key)
  if key = "q" then
    unloadImage("fish")
    end
  end if
end function
