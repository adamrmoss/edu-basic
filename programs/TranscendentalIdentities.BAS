CONSOLE "TRANSCENDENTAL IDENTITIES"

LET failures% = 0
LET eps# = 1E-9

SUB AssertNear name$, actual#, expected#, eps#
    CONSOLE name$
    IF ABS(actual# - expected#) <= eps# THEN
        CONSOLE "OK"
    ELSE
        CONSOLE "FAIL"
        LET failures% = failures% + 1
    END IF
END SUB

LET maxDiff# = 0
FOR k% = 0 TO 8
    LET theta# = k% * PI# / 8
    LET diff# = ABS((SIN theta#) ^ 2 + (COS theta#) ^ 2 - 1)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "SIN2+COS2", maxDiff#, 0, eps#

LET maxDiff# = 0
FOR k% = 0 TO 8
    LET theta# = k% * PI# / 8
    LET diff# = ABS(COS(2 * theta#) - ((COS theta#) ^ 2 - (SIN theta#) ^ 2))
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "COS(2x)=C2-S2", maxDiff#, 0, eps#

LET maxDiff# = 0
FOR k% = 0 TO 8
    LET x# = (k% - 4) / 2
    LET diff# = ABS((COSH x#) ^ 2 - (SINH x#) ^ 2 - 1)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "COSH2-SINH2", maxDiff#, 0, eps#

LET maxDiff# = 0
FOR k% = 1 TO 8
    LET x# = k% / 10
    LET diff# = ABS(EXP(LOG x#) - x#)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "EXP(LOG x)=x", maxDiff#, 0, eps#

LET maxDiff# = 0
FOR k% = 0 TO 8
    LET x# = (k% - 4) / 2
    LET diff# = ABS(LOG(EXP x#) - x#)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "LOG(EXP x)=x", maxDiff#, 0, eps#

LET maxDiff# = 0
FOR k% = -3 TO 3
    LET x# = k%
    LET diff# = ABS(LOG10(10 ^ x#) - x#)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "LOG10(10^x)=x", maxDiff#, 0, eps#

LET maxDiff# = 0
FOR k% = -3 TO 3
    LET x# = k%
    LET diff# = ABS(LOG2(2 ^ x#) - x#)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "LOG2(2^x)=x", maxDiff#, 0, eps#

LET maxDiff# = 0
FOR k% = 0 TO 8
    LET x# = k% / 5
    LET diff# = ABS((SQRT x#) ^ 2 - x#)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "SQRT(x)^2=x", maxDiff#, 0, eps#

LET maxDiff# = 0
FOR k% = -4 TO 4
    LET x# = k%
    LET diff# = ABS((CBRT x#) ^ 3 - x#)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "CBRT(x)^3=x", maxDiff#, 0, eps#

CONSOLE "FAILURES"
CONSOLE failures%
END
