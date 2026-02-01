CONSOLE "WHILE WEND TORTURE"

CONSOLE "MAIN"
LET i% = 0
WHILE i% < 5
    LET i% = i% + 1

    IF i% = 2 THEN
        CONSOLE "SKIP2"
        CONTINUE WHILE
    END IF

    CONSOLE i%

    IF i% = 4 THEN
        EXIT WHILE
    END IF
WEND

CONSOLE i%

CONSOLE "NESTED WHILE"
LET outer% = 0
LET inner% = 0

WHILE outer% < 3
    LET outer% = outer% + 1
    LET j% = 0
    WHILE j% < 10
        LET j% = j% + 1
        LET inner% = inner% + 1

        IF j% = 2 THEN
            EXIT WHILE
        END IF
    WEND
WEND

CONSOLE outer%
CONSOLE inner%

CONSOLE "DONE"
END
