import { ExpressionParserService } from '@/app/interpreter/expression-parser.service';
import { ExecutionContext } from '@/lang/execution-context';
import { EduBasicType, EduBasicValue } from '@/lang/edu-basic-value';

describe('ExpressionParserService (bracket access)', () =>
{
    let parser: ExpressionParserService;
    let context: ExecutionContext;

    beforeEach(() =>
    {
        parser = new ExpressionParserService();
        context = new ExecutionContext();
    });

    it('should parse and evaluate array indexing (one-based)', () =>
    {
        context.setVariable('arr%[]', {
            type: EduBasicType.Array,
            value: [
                { type: EduBasicType.Integer, value: 10 },
                { type: EduBasicType.Integer, value: 20 }
            ],
            elementType: EduBasicType.Integer
        });

        context.setVariable('i%', { type: EduBasicType.Integer, value: 2 });

        const exprResult = parser.parseExpression('arr%[i%]');
        expect(exprResult.success).toBe(true);
        if (!exprResult.success)
        {
            return;
        }

        expect(exprResult.value.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 20 });
    });

    it('should parse and evaluate structure member access with identifier key', () =>
    {
        const members = new Map<string, EduBasicValue>();
        members.set('firstName$', { type: EduBasicType.String, value: 'John' });

        context.setVariable('person', { type: EduBasicType.Structure, value: members });

        const exprResult = parser.parseExpression('person[firstName$]');
        expect(exprResult.success).toBe(true);
        if (!exprResult.success)
        {
            return;
        }

        expect(exprResult.value.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'John' });
    });

    it('should parse and evaluate structure member access with computed string key', () =>
    {
        const members = new Map<string, EduBasicValue>();
        members.set('firstName$', { type: EduBasicType.String, value: 'John' });

        context.setVariable('person', { type: EduBasicType.Structure, value: members });
        context.setVariable('key$', { type: EduBasicType.String, value: 'firstName$' });

        const exprResult = parser.parseExpression('person[key$]');
        expect(exprResult.success).toBe(true);
        if (!exprResult.success)
        {
            return;
        }

        expect(exprResult.value.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'John' });
    });

    it('should support chained bracket access for nested structures', () =>
    {
        const name = new Map<string, EduBasicValue>();
        name.set('first$', { type: EduBasicType.String, value: 'Ada' });

        const person = new Map<string, EduBasicValue>();
        person.set('name', { type: EduBasicType.Structure, value: name });

        context.setVariable('person', { type: EduBasicType.Structure, value: person });

        const exprResult = parser.parseExpression('person[name][first$]');
        expect(exprResult.success).toBe(true);
        if (!exprResult.success)
        {
            return;
        }

        expect(exprResult.value.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'Ada' });
    });
});

