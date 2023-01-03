'HiLo
'
'Generates a random number between 1 and 100
'and prompts the user to guess it.

var guessCount = 0
var guess = 0
var guessMe = int(rnd()*100) + 1

print "Hello!"
print "I'm thinking of a number between 1 and 100."
print "Guess what it is. Enter 'q' to quit."
print ""

while guess <> guessMe
  guess = val(input("Enter guess: "))
  guessCount = guessCount + 1
  if guess < guessMe then print "Guess higher."
  if guess > guessMe then print "Guess lower."
  if guess = guessMe then print "Correct! It took you " + guessCount + " guesses."
  if guess = "q" then guess = guessMe
wend

print ""
print "Goodbye!"
