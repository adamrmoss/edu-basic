import { BasProgramTestRunner } from './program-test-runner';

describe('Programs - Multi-dimensional array disallowed list ops', () =>
{
    it('should throw when using list-like operations on multi-dimensional arrays', () =>
    {
        expect(() => BasProgramTestRunner.runFile('MultiDimListOpsDisallowed.bas'))
            .toThrow('PUSH: m#[] is multi-dimensional');
    });
});

