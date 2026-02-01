CONSOLE "SELECT CASE TORTURE"
LET hits% = 0

FOR x% = -1 TO 7
    SELECT CASE x%
        CASE IS < 0
            CONSOLE "NEG"
            LET hits% = hits% + 1
        CASE 0
            CONSOLE "ZERO"
            LET hits% = hits% + 10
        CASE 1, 3, 5, 7
            CONSOLE "ODD"
            LET hits% = hits% + 100
        CASE 2 TO 4
            CONSOLE "RANGE"
            LET hits% = hits% + 1000
        CASE IS >= 6
            CONSOLE "BIG"
            LET hits% = hits% + 10000
        CASE ELSE
            CONSOLE "ELSE"
            LET hits% = hits% + 100000
    END SELECT
NEXT x%

CONSOLE hits%
END
