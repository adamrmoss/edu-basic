import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - AngleConversions', () => {
    it('should support DEG and RAD postfix operators', () => {
        const result = BasProgramTestRunner.runFile('angle-conversions.bas');

        expect(result.parseErrors).toEqual([]);
        expect(result.consoleService.output.length).toBe(2);

        const sin45Deg = parseFloat(result.consoleService.output[0]);
        const piRad = parseFloat(result.consoleService.output[1]);

        expect(sin45Deg).toBeCloseTo(Math.SQRT1_2);
        expect(piRad).toBeCloseTo(180);
    });
});
