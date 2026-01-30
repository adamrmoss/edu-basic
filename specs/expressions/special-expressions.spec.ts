import { ExecutionContext } from '../../src/lang/execution-context';
import { EduBasicType, EduBasicValue } from '../../src/lang/edu-basic-value';
import { LiteralExpression } from '../../src/lang/expressions/literal-expression';
import { ArrayAccessExpression, StructureMemberExpression, VariableExpression } from '../../src/lang/expressions/special';

describe('Special Expressions', () => {
    it('ArrayAccessExpression.toString should format array access', () => {
        const expr = new ArrayAccessExpression(
            new VariableExpression('arr%'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );

        expect(expr.toString()).toBe('arr%[1]');
    });

    it('ArrayAccessExpression.evaluate should index arrays (one-based)', () => {
        const context = new ExecutionContext();
        context.setVariable('arr%[]', {
            type: EduBasicType.Array,
            value: [
                { type: EduBasicType.Integer, value: 10 },
                { type: EduBasicType.Integer, value: 20 }
            ],
            elementType: EduBasicType.Integer
        });

        const first = new ArrayAccessExpression(
            new VariableExpression('arr%'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 1 })
        );

        const second = new ArrayAccessExpression(
            new VariableExpression('arr%'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 })
        );

        expect(first.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 10 });
        expect(second.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 20 });
    });

    it('ArrayAccessExpression.evaluate should return default element when out of bounds', () => {
        const context = new ExecutionContext();
        context.setVariable('arr%[]', {
            type: EduBasicType.Array,
            value: [
                { type: EduBasicType.Integer, value: 10 }
            ],
            elementType: EduBasicType.Integer
        });

        const expr = new ArrayAccessExpression(
            new VariableExpression('arr%'),
            new LiteralExpression({ type: EduBasicType.Integer, value: 2 })
        );

        expect(expr.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });
    });

    it('StructureMemberExpression.toString should format member access', () => {
        const expr = new StructureMemberExpression(
            new VariableExpression('person'),
            'firstName$'
        );

        expect(expr.toString()).toBe('person[firstName$]');
    });

    it('StructureMemberExpression.evaluate should return member value', () => {
        const context = new ExecutionContext();
        const map = new Map<string, EduBasicValue>();
        map.set('firstName$', { type: EduBasicType.String, value: 'John' });
        map.set('age%', { type: EduBasicType.Integer, value: 30 });

        context.setVariable('person', { type: EduBasicType.Structure, value: map });

        const firstName = new StructureMemberExpression(
            new VariableExpression('person'),
            'firstName$'
        );

        expect(firstName.evaluate(context)).toEqual({ type: EduBasicType.String, value: 'John' });
    });

    it('StructureMemberExpression.evaluate should return default value when member missing', () => {
        const context = new ExecutionContext();
        context.setVariable('person', { type: EduBasicType.Structure, value: new Map() });

        const age = new StructureMemberExpression(
            new VariableExpression('person'),
            'age%'
        );

        expect(age.evaluate(context)).toEqual({ type: EduBasicType.Integer, value: 0 });
    });
});

