CONSOLE "COMPLEX IDENTITIES"

LET failures% = 0
LET eps# = 1E-9
LET i& = 0+1i

SUB AssertNear name$, actual#, expected#, eps#
    CONSOLE name$
    IF ABS(actual# - expected#) <= eps# THEN
        CONSOLE "OK"
    ELSE
        CONSOLE "FAIL"
        LET failures% = failures% + 1
    END IF
END SUB

SUB AssertNearComplex name$, actual&, expected&, eps#
    CONSOLE name$
    IF CABS(actual& - expected&) <= eps# THEN
        CONSOLE "OK"
    ELSE
        CONSOLE "FAIL"
        LET failures% = failures% + 1
    END IF
END SUB

LET maxDiff# = 0
FOR k% = 0 TO 8
    LET theta# = k% * PI# / 8
    LET lhs& = EXP(i& * theta#)
    LET rhs& = (COS theta#) + i& * (SIN theta#)
    LET diff# = CABS(lhs& - rhs&)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "EULER", maxDiff#, 0, eps#

LET z& = EXP(i& * PI#) + 1
CALL AssertNearComplex "EXP(i*pi)+1", z&, 0+0i, 1E-8

LET maxDiff# = 0
FOR k% = 0 TO 6
    LET x# = k% / 4
    LET lhs& = SIN(i& * x#)
    LET rhs& = i& * (SINH x#)
    LET diff# = CABS(lhs& - rhs&)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "SIN(i*x)=i*SINH", maxDiff#, 0, 1E-8

LET maxDiff# = 0
FOR k% = 0 TO 6
    LET x# = k% / 4
    LET lhs& = COS(i& * x#)
    LET rhs& = COSH x#
    LET diff# = CABS(lhs& - rhs&)
    IF diff# > maxDiff# THEN
        LET maxDiff# = diff#
    END IF
NEXT k%
CALL AssertNear "COS(i*x)=COSH", maxDiff#, 0, 1E-8

LET z& = 3+4i
CALL AssertNear "REAL(3+4i)", REAL z&, 3, eps#
CALL AssertNear "IMAG(3+4i)", IMAG z&, 4, eps#
CALL AssertNear "CABS(3+4i)", CABS z&, 5, eps#
CALL AssertNearComplex "CONJ(3+4i)", CONJ z&, 3-4i, eps#

LET prod& = (CONJ z&) * z&
CALL AssertNear "CONJ(z)*z=|z|^2", REAL prod&, (CABS z&) ^ 2, eps#

CONSOLE "FAILURES"
CONSOLE failures%
END
