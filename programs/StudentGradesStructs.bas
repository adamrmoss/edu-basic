CONSOLE "STUDENT GRADES - STRUCTS"

LET classroom.meta = { title$: "GRADEBOOK", passMark%: 70 }
CONSOLE "META:"
CONSOLE classroom.meta

LET classroom.students[1] = { }
LET classroom.students[2] = { }
LET classroom.students[3] = { }
LET classroom.students[4] = { }
LET classroom.students[5] = { }

LET classroom.students[1].name$ = "Ada"
LET classroom.students[1].scores#[1] = 100
LET classroom.students[1].scores#[2] = 90
LET classroom.students[1].scores#[3] = 80
LET classroom.students[1].scores#[4] = 70

LET classroom.students[2].name$ = "Bob"
LET classroom.students[2].scores#[1] = 90
LET classroom.students[2].scores#[2] = 90
LET classroom.students[2].scores#[3] = 90
LET classroom.students[2].scores#[4] = 90

LET classroom.students[3].name$ = "Cyd"
LET classroom.students[3].scores#[1] = 60
LET classroom.students[3].scores#[2] = 70
LET classroom.students[3].scores#[3] = 80
LET classroom.students[3].scores#[4] = 90

LET classroom.students[4].name$ = "Dee"
LET classroom.students[4].scores#[1] = 88
LET classroom.students[4].scores#[2] = 92
LET classroom.students[4].scores#[3] = 84
LET classroom.students[4].scores#[4] = 96

LET classroom.students[5].name$ = "Eli"
LET classroom.students[5].scores#[1] = 50
LET classroom.students[5].scores#[2] = 60
LET classroom.students[5].scores#[3] = 55
LET classroom.students[5].scores#[4] = 75

LET nStudents% = | classroom.students[] |
CONSOLE "N STUDENTS = " + STR(nStudents%)

LET classMin# = classroom.students[1].scores#[1]
LET classMax# = classroom.students[1].scores#[1]
LET classSumAvg# = 0
LET passCount% = 0
LET honorCount% = 0
LET topAvg# = -1
LET topName$ = ""

FOR i% = 1 TO nStudents%
    LET nScores% = | classroom.students[i%].scores#[] |

    LET sum# = 0
    LET min# = classroom.students[i%].scores#[1]
    LET max# = classroom.students[i%].scores#[1]

    FOR j% = 1 TO nScores%
        LET score# = classroom.students[i%].scores#[j%]
        LET sum# = sum# + score#

        IF score# < min# THEN
            LET min# = score#
        END IF

        IF score# > max# THEN
            LET max# = score#
        END IF

        IF score# < classMin# THEN
            LET classMin# = score#
        END IF

        IF score# > classMax# THEN
            LET classMax# = score#
        END IF
    NEXT j%

    LET avg# = sum# / nScores%

    LET classroom.students[i%].stats.avg# = avg#
    LET classroom.students[i%].stats.min# = min#
    LET classroom.students[i%].stats.max# = max#

    CONSOLE classroom.students[i%].name$ + " AVG = " + STR(avg#)

    LET classSumAvg# = classSumAvg# + avg#

    IF avg# >= 70 THEN
        LET passCount% = passCount% + 1
    END IF

    IF avg# >= 90 THEN
        LET honorCount% = honorCount% + 1
    END IF

    IF avg# > topAvg# THEN
        LET topAvg# = avg#
        LET topName$ = classroom.students[i%].name$
    END IF
NEXT i%

LET classAvg# = classSumAvg# / nStudents%

CONSOLE "CLASS AVG = " + STR(classAvg#)
CONSOLE "CLASS MIN = " + STR(classMin#)
CONSOLE "CLASS MAX = " + STR(classMax#)
CONSOLE "PASS COUNT (>=70) = " + STR(passCount%)
CONSOLE "HONOR COUNT (>=90) = " + STR(honorCount%)
CONSOLE "TOP STUDENT = " + topName$

CONSOLE "ADA NAME = " + classroom.students[1].name$
CONSOLE "ADA NAME via NAME$ = " + classroom.students[1].NAME$
CONSOLE "ADA MISSING% DEFAULT = " + STR(classroom.students[1].missing%)

CONSOLE "ADA STRUCT:"
CONSOLE classroom.students[1]

CONSOLE "DONE"
END
