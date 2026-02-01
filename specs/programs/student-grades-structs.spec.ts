import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - Student grades (structs)', () =>
{
    it('should produce stable console output for structure-based grade calculations', () =>
    {
        const result = BasProgramTestRunner.runFile('StudentGradesStructs.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output).toEqual([
            'STUDENT GRADES - STRUCTS',
            'META:',
            '{ title$: "GRADEBOOK", passMark%: 70 }',
            'N STUDENTS = 5',
            'Ada AVG = 85',
            'Bob AVG = 90',
            'Cyd AVG = 75',
            'Dee AVG = 90',
            'Eli AVG = 60',
            'CLASS AVG = 80',
            'CLASS MIN = 50',
            'CLASS MAX = 100',
            'PASS COUNT (>=70) = 4',
            'HONOR COUNT (>=90) = 2',
            'TOP STUDENT = Bob',
            'ADA NAME = Ada',
            'ADA NAME via NAME$ = Ada',
            'ADA MISSING% DEFAULT = 0',
            'ADA STRUCT:',
            '{ name$: "Ada", scores#[]: [100, 90, 80, 70], stats: { avg#: 85, min#: 70, max#: 100 } }',
            'DONE'
        ]);
    });
});