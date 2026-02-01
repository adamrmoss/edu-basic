CONSOLE "EXIT FOR EXPLICIT INNER"
LET innerCount% = 0
LET outerCount% = 0

FOR i% = 1 TO 3
    FOR j% = 1 TO 5
        LET innerCount% = innerCount% + 1
        EXIT FOR j%
    NEXT j%

    LET outerCount% = outerCount% + 1
NEXT i%

CONSOLE innerCount%
CONSOLE outerCount%
END
