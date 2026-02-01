REM Demonstrates EduBASIC file handle syntax (no leading '#')

WRITEFILE "first\nsecond\nthird\n" TO "handles-demo.txt"

OPEN "handles-demo.txt" FOR READ AS file%

SEEK 0 IN file%

WHILE NOT EOF file%
    LINE INPUT line$ FROM file%
    CONSOLE line$
WEND

CLOSE file%
