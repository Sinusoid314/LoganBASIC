structure ComplexNumber
  real
  imaginary
end structure

var PI = 3.14159
var inputString
var compNumStrings
var index
array timeSeries[0]
array freqSeries[0]

inputString = input(">> ")

compNumStrings = splitStr(inputString, "|")

redim timeSeries[len(compNumStrings)]

for index = 0 to len(timeSeries) - 1
  timeSeries[index] = createComplexNumber(compNumStrings[index])
next index

calcDFT(timeSeries, freqSeries)

for index = 0 to len(freqSeries) - 1
    print freqSeries[index].real
    print freqSeries[index].imaginary
    print ""
next index


function createComplexNumber(compNumString)
  var compNumParts = splitStr(compNumString, ",")
  var compNum = new ComplexNumber

  compNum.real = val(compNumParts[0])
  
  if len(compNumParts) > 1 then compNum.imaginary = val(compNumParts[1])

  return compNum
end function

function calcDFT(timeSeries, freqSeries)
  var timeIndex, freqIndex
  var realSum, imagSum
  var radians
  var seriesLength = len(timeSeries)

  redim freqSeries[seriesLength]

  for freqIndex = 0 to seriesLength - 1
    realSum = 0
    imagSum = 0

    for timeIndex = 0 to seriesLength - 1
      radians = 2 * PI * timeIndex * freqIndex / seriesLength
      realSum = realSum + (timeSeries[timeIndex].real * cos(radians) + timeSeries[timeIndex].imaginary * sin(radians))
      imagSum = imagSum + (-timeSeries[timeIndex].real * sin(radians) + timeSeries[timeIndex].imaginary * cos(radians))
    next timeIndex

    freqSeries[freqIndex].real = realSum
    freqSeries[freqIndex].imaginary = imagSum
  next freqIndex
end function
