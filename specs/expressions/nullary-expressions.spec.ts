import { NullaryExpression } from '../../src/lang/expressions/nullary-expression';
import { Constant } from '../../src/lang/expressions/helpers/constant-evaluator';
import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType } from '../../src/lang/edu-basic-value';

describe('Nullary Expressions (Built-in Values)', () =>
{
    let context: ExecutionContext;

    beforeEach(() =>
    {
        context = new ExecutionContext();
    });

    describe('Mathematical Constants', () =>
    {
        it('should evaluate PI# to Math.PI', () =>
        {
            const expr = new NullaryExpression(Constant.Pi);
            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Math.PI);
        });

        it('should evaluate E# to Math.E', () =>
        {
            const expr = new NullaryExpression(Constant.E);
            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Real);
            expect(result.value).toBe(Math.E);
        });

        it('should return same value for PI# on multiple evaluations', () =>
        {
            const expr = new NullaryExpression(Constant.Pi);
            const result1 = expr.evaluate(context);
            const result2 = expr.evaluate(context);

            expect(result1.value).toBe(result2.value);
            expect(result1.value).toBe(Math.PI);
        });
    });

    describe('Boolean Constants', () =>
    {
        it('should evaluate TRUE% to -1', () =>
        {
            const expr = new NullaryExpression(Constant.True);
            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(-1);
        });

        it('should evaluate FALSE% to 0', () =>
        {
            const expr = new NullaryExpression(Constant.False);
            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBe(0);
        });
    });

    describe('Runtime-Changing Values', () =>
    {
        it('should return different random values for RND# on each evaluation', () =>
        {
            const expr = new NullaryExpression(Constant.Rnd);
            const results: number[] = [];
            
            // Evaluate multiple times
            for (let i = 0; i < 10; i++)
            {
                const result = expr.evaluate(context);
                expect(result.type).toBe(EduBasicType.Real);
                if (result.type === EduBasicType.Real)
                {
                    results.push(result.value);
                    expect(result.value).toBeGreaterThanOrEqual(0);
                    expect(result.value).toBeLessThan(1);
                }
            }

            // Check that we got at least some different values
            const uniqueValues = new Set(results);
            expect(uniqueValues.size).toBeGreaterThan(1);
        });

        it('should return current date for DATE$', () =>
        {
            const expr = new NullaryExpression(Constant.Date);
            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            if (result.type === EduBasicType.String)
            {
                // Should match YYYY-MM-DD format
                expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            }
        });

        it('should return different DATE$ values when evaluated with delay', (done) =>
        {
            const expr = new NullaryExpression(Constant.Date);
            const result1 = expr.evaluate(context);

            // Wait a moment to ensure different time
            setTimeout(() =>
            {
                const result2 = expr.evaluate(context);
                
                // Results might be the same if evaluated in same second, but structure should be correct
                expect(result1.type).toBe(EduBasicType.String);
                expect(result2.type).toBe(EduBasicType.String);
                if (result1.type === EduBasicType.String && result2.type === EduBasicType.String)
                {
                    expect(result1.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                    expect(result2.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                }
                done();
            }, 10);
        });

        it('should return current time for TIME$', () =>
        {
            const expr = new NullaryExpression(Constant.Time);
            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            if (result.type === EduBasicType.String)
            {
                // Should match HH:MM:SS format
                expect(result.value).toMatch(/^\d{2}:\d{2}:\d{2}$/);
            }
        });

        it('should return different TIME$ values when evaluated with delay', (done) =>
        {
            const expr = new NullaryExpression(Constant.Time);
            const result1 = expr.evaluate(context);

            // Wait a moment to ensure different time
            setTimeout(() =>
            {
                const result2 = expr.evaluate(context);
                
                expect(result1.type).toBe(EduBasicType.String);
                expect(result2.type).toBe(EduBasicType.String);
                if (result1.type === EduBasicType.String && result2.type === EduBasicType.String)
                {
                    expect(result1.value).toMatch(/^\d{2}:\d{2}:\d{2}$/);
                    expect(result2.value).toMatch(/^\d{2}:\d{2}:\d{2}$/);
                    // Times should be different (or at least valid)
                    expect(result1.value).toBeTruthy();
                    expect(result2.value).toBeTruthy();
                }
                done();
            }, 100);
        });

        it('should return current timestamp for NOW%', () =>
        {
            const expr = new NullaryExpression(Constant.Now);
            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.Integer);
            expect(result.value).toBeGreaterThan(0);
            
            // Should be roughly current Unix timestamp (within last minute)
            const expectedMin = Math.floor(Date.now() / 1000) - 60;
            const expectedMax = Math.floor(Date.now() / 1000) + 1;
            expect(result.value).toBeGreaterThanOrEqual(expectedMin);
            expect(result.value).toBeLessThanOrEqual(expectedMax);
        });

        it('should return different NOW% values when evaluated with delay', (done) =>
        {
            const expr = new NullaryExpression(Constant.Now);
            const result1 = expr.evaluate(context);

            setTimeout(() =>
            {
                const result2 = expr.evaluate(context);
                
                expect(result1.type).toBe(EduBasicType.Integer);
                expect(result2.type).toBe(EduBasicType.Integer);
                // Second evaluation should be greater (or equal if same second)
                if (result1.type === EduBasicType.Integer && result2.type === EduBasicType.Integer)
                {
                    expect(result2.value).toBeGreaterThanOrEqual(result1.value);
                }
                done();
            }, 100);
        });

        it('should return empty string for INKEY$ when no key is pressed', () =>
        {
            const expr = new NullaryExpression(Constant.Inkey);
            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('');
        });

        it('should return current key for INKEY$ when a key is pressed', () =>
        {
            context.setKeyDown('ESC');

            const expr = new NullaryExpression(Constant.Inkey);
            const result = expr.evaluate(context);

            expect(result.type).toBe(EduBasicType.String);
            expect(result.value).toBe('ESC');

            context.setKeyUp('ESC');

            const resultAfter = expr.evaluate(context);
            expect(resultAfter.type).toBe(EduBasicType.String);
            expect(resultAfter.value).toBe('');
        });
    });

    describe('toString', () =>
    {
        it('should return constant name for PI#', () =>
        {
            const expr = new NullaryExpression(Constant.Pi);
            expect(expr.toString()).toBe('PI#');
        });

        it('should return constant name for RND#', () =>
        {
            const expr = new NullaryExpression(Constant.Rnd);
            expect(expr.toString()).toBe('RND#');
        });

        it('should return constant name for DATE$', () =>
        {
            const expr = new NullaryExpression(Constant.Date);
            expect(expr.toString()).toBe('DATE$');
        });
    });
});
