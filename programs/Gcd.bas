CONSOLE "GCD"

LET a% = 48
LET b% = 18
LET origA% = a%
LET origB% = b%
WHILE b% <> 0
    LET r% = a% MOD b%
    LET a% = b%
    LET b% = r%
WEND
CONSOLE "gcd(" + STR origA% + "," + STR origB% + ")=" + STR a%

LET a% = 54
LET b% = 24
LET origA% = a%
LET origB% = b%
WHILE b% <> 0
    LET r% = a% MOD b%
    LET a% = b%
    LET b% = r%
WEND
CONSOLE "gcd(" + STR origA% + "," + STR origB% + ")=" + STR a%

LET a% = 1071
LET b% = 462
LET origA% = a%
LET origB% = b%
WHILE b% <> 0
    LET r% = a% MOD b%
    LET a% = b%
    LET b% = r%
WEND
CONSOLE "gcd(" + STR origA% + "," + STR origB% + ")=" + STR a%

CONSOLE "DONE"
END
