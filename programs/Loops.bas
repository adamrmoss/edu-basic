CONSOLE "LOOPS"

CONSOLE "FOR"
FOR i% = 1 TO 5
    CONSOLE i%
NEXT i%

CONSOLE "WHILE"
LET j% = 1
WHILE j% < 4
    CONSOLE j%
    LET j% = j% + 1
WEND

CONSOLE "UNTIL"
LET k% = 0
UNTIL k% >= 3
    CONSOLE k%
    LET k% = k% + 1
UEND

CONSOLE "DO WHILE"
LET m% = 1
DO WHILE m% < 3
    CONSOLE m%
    LET m% = m% + 1
LOOP

CONSOLE "DONE"
END
