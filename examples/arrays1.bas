stuffCount = 10
array stuff[stuffCount]

index = 0
while index < stuffCount
  stuff[index] = index * 2
  print stuff[index]
  index = index + 1
wend

stuffCount = input("Enter new size: ")

redim stuff[stuffCount]

index = 0
while index < stuffCount
  stuff[index] = index * 3
  print stuff[index]
  index = index + 1
wend
