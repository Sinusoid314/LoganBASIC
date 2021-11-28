'Letter Count
'
'Get the number of occurences of each letter in a string.

array letterCounts[26]
var char = ""
var checkStr = ""
var countIndex = 0
var charIndex = 0

'Initialize letter counts
for countIndex = 0 to 25
  letterCounts[countIndex] = 0
next countIndex

'Get the string to analyze as all lower case
checkStr = input("Enter text: ")
checkStr = lower(checkStr)

'Look for a letter in each character of the input string
for charIndex = 1 to len(checkStr)
  char = mid(checkStr, charIndex, 1)
  
  countIndex = asc(char) - asc("a")
  
  if countIndex >= 0 and countIndex <= 25 then
    letterCounts[countIndex] = letterCounts[countIndex] + 1
  end if
next charIndex

'Print results
for countIndex = 0 to 25
  print chr(asc("a") + countIndex) + " - " + letterCounts[countIndex]
next countIndex
