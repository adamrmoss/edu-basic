CONSOLE "DO LOOP TORTURE"

CONSOLE "DO LOOP"
LET i% = 0
DO
    LET i% = i% + 1

    IF i% = 2 THEN
        CONSOLE "CONTINUE"
        CONTINUE DO
    END IF

    CONSOLE i%

    IF i% >= 4 THEN
        EXIT DO
    END IF
LOOP

CONSOLE "DO WHILE"
LET w% = 0
DO WHILE w% < 3
    LET w% = w% + 1
    CONSOLE w%
LOOP

CONSOLE "DO UNTIL"
LET u% = 0
DO UNTIL u% >= 3
    LET u% = u% + 1
    CONSOLE u%
LOOP

CONSOLE "DO LOOP WHILE"
LET bw% = 0
DO
    LET bw% = bw% + 1
    CONSOLE bw%
LOOP WHILE bw% < 3

CONSOLE "DO LOOP UNTIL"
LET bu% = 0
DO
    LET bu% = bu% + 1
    CONSOLE bu%
LOOP UNTIL bu% >= 3

CONSOLE "NESTED DO"
LET outer% = 0
LET inner% = 0

DO WHILE outer% < 3
    LET outer% = outer% + 1
    LET j% = 0
    DO
        LET j% = j% + 1
        LET inner% = inner% + 1

        IF j% = 2 THEN
            EXIT DO
        END IF
    LOOP
LOOP

CONSOLE outer%
CONSOLE inner%

CONSOLE "DONE"
END
