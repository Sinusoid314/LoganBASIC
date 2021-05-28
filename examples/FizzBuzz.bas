'FiZZBuZZ
'
'Prints the numbers from 1 to 100. But for multiples 
'of three prints "Fizz" instead of the number and for
'the multiples of five prints "Buzz". For numbers which
'are multiples of both three and five print "FizzBuzz".

var num = 1
var outStr = ""

while num <= 100
  if (num % 3) = 0 then outStr = outStr + "FiZZ"
  if (num % 5) = 0 then outStr = outStr + "BuZZ"

  if outStr = "" then
    print num
  else
    print outStr
  end if

  num = num + 1
  outStr = ""
wend
