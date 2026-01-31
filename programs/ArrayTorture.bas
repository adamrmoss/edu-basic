CONSOLE "ARRAY TORTURE"

LET a%[] = [1, 2, 3]
CONSOLE a%[]

PUSH a%[], 4
UNSHIFT a%[], 0
CONSOLE a%[]

POP a%[], p%
SHIFT a%[], s%
CONSOLE p%
CONSOLE s%
CONSOLE a%[]

LET b%[] = [10, 20]
LET c%[] = a%[] + b%[]
CONSOLE c%[]

LET slice%[] = c%[2 TO 4]
CONSOLE slice%[]

CONSOLE "DONE"
END
