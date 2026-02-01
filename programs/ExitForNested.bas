CONSOLE "EXIT FOR NESTED"
LET innerCount% = 0
LET outerCount% = 0

FOR i% = 1 TO 3
    FOR j% = 1 TO 5
        LET innerCount% = innerCount% + 1
        EXIT FOR
    NEXT j%

    LET outerCount% = outerCount% + 1
NEXT i%

CONSOLE innerCount%
CONSOLE outerCount%
END
