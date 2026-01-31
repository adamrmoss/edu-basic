CONSOLE "PRIMES"
CONSOLE "UP TO 30"

FOR n% = 2 TO 30
    LET isPrime% = TRUE%

    FOR d% = 2 TO n% - 1
        IF n% MOD d% = 0 THEN
            LET isPrime% = FALSE%
            EXIT FOR
        END IF
    NEXT d%

    IF isPrime% THEN
        CONSOLE n%
    END IF
NEXT n%

CONSOLE "DONE"
END
