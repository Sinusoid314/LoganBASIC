structure ComplexNumber
  real
  imag
  magnitude
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
    'print freqSeries[index].real
    'print freqSeries[index].imag
    print freqSeries[index].magnitude
    print ""
next index


function createComplexNumber(compNumString)
  var compNumParts = splitStr(compNumString, ",")
  var compNum = new ComplexNumber

  compNum.real = val(compNumParts[0])
  
  if len(compNumParts) > 1 then compNum.imag = val(compNumParts[1])

  return compNum
end function

function calcDFT(timeSeries, freqSeries)
  var timeIndex, freqIndex
  var realSum, imagSum
  var radians, sinVal, cosVal
  var seriesLength = len(timeSeries)

  redim freqSeries[seriesLength]

  for freqIndex = 0 to seriesLength - 1
    realSum = 0
    imagSum = 0

    for timeIndex = 0 to seriesLength - 1
      radians = 2 * PI * timeIndex * freqIndex / seriesLength
      sinVal = round(sin(radians), 2)
      cosVal = round(cos(radians), 2)
      realSum = realSum + (timeSeries[timeIndex].real * cosVal + timeSeries[timeIndex].imag * sinVal)
      imagSum = imagSum + (-timeSeries[timeIndex].real * sinVal + timeSeries[timeIndex].imag * cosVal)
    next timeIndex

    freqSeries[freqIndex] = new ComplexNumber
    freqSeries[freqIndex].real = round(realSum, 2)
    freqSeries[freqIndex].imag = round(imagSum, 2)
    freqSeries[freqIndex].magnitude = round(sqr(realSum^2 + imagSum^2), 2)
  next freqIndex
end function
