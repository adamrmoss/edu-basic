CONSOLE "MATRIX TORTURE"

LET failures% = 0

SUB AssertEq name$, actual#, expected#
    CONSOLE name$
    IF actual# = expected# THEN
        CONSOLE "OK"
    ELSE
        CONSOLE "FAIL"
        LET failures% = failures% + 1
    END IF
END SUB

DIM a#[2, 3]
LET a#[1, 1] = 1
LET a#[1, 2] = 2
LET a#[1, 3] = 3
LET a#[2, 1] = 4
LET a#[2, 2] = 5
LET a#[2, 3] = 6

DIM b#[3, 2]
LET b#[1, 1] = 7
LET b#[1, 2] = 8
LET b#[2, 1] = 9
LET b#[2, 2] = 10
LET b#[3, 1] = 11
LET b#[3, 2] = 12

DIM c#[2, 2]
FOR i% = 1 TO 2
    FOR j% = 1 TO 2
        LET sum# = 0
        FOR k% = 1 TO 3
            LET sum# = sum# + a#[i%, k%] * b#[k%, j%]
        NEXT k%
        LET c#[i%, j%] = sum#
    NEXT j%
NEXT i%

CALL AssertEq "C11", c#[1, 1], 58
CALL AssertEq "C12", c#[1, 2], 64
CALL AssertEq "C21", c#[2, 1], 139
CALL AssertEq "C22", c#[2, 2], 154

DIM at#[3, 2]
FOR i% = 1 TO 2
    FOR j% = 1 TO 3
        LET at#[j%, i%] = a#[i%, j%]
    NEXT j%
NEXT i%

CALL AssertEq "AT12", at#[1, 2], 4
CALL AssertEq "AT31", at#[3, 1], 3

DIM r#[0 TO 1, 0 TO 2]
LET r#[0, 0] = 10
LET r#[1, 2] = 99
CALL AssertEq "R00", r#[0, 0], 10
CALL AssertEq "R12", r#[1, 2], 99

CONSOLE "FAILURES"
CONSOLE failures%
END
