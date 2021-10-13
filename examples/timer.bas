var tickCount = 0

startTimer(1000, onTick)

wait

function onTick()
  tickCount = tickCount + 1
  print "Tick " + tickCount + " at " + time()
  if tickCount = 5 then
    stopTimer()
    print "Done."
    end
  end if
end function