import { Expression } from '../expression';
import { EduBasicValue, EduBasicType, ComplexValue } from '../../edu-basic-value';
import { ExecutionContext } from '../../execution-context';

/**
 * Array search operators.
 */
export enum ArraySearchOperator
{
    Find = 'FIND',
    IndexOf = 'INDEXOF',
    Includes = 'INCLUDES',
}

/**
 * Expression node for array search operators (`FIND` / `INDEXOF` / `INCLUDES`).
 */
export class ArraySearchExpression extends Expression
{
    /**
     * Array operand expression (left side).
     */
    public readonly arrayExpr: Expression;

    /**
     * Search operator to apply.
     */
    public readonly operator: ArraySearchOperator;

    /**
     * Search value expression (right side).
     */
    public readonly valueExpr: Expression;

    /**
     * Create a new array search expression.
     *
     * @param arrayExpr Array operand expression.
     * @param operator Search operator to apply.
     * @param valueExpr Search value expression.
     */
    public constructor(arrayExpr: Expression, operator: ArraySearchOperator, valueExpr: Expression)
    {
        super();
        this.arrayExpr = arrayExpr;
        this.operator = operator;
        this.valueExpr = valueExpr;
    }

    /**
     * Evaluate the array and search value, then apply the selected operator.
     *
     * @param context Execution context to evaluate against.
     * @returns The evaluated runtime value.
     */
    public evaluate(context: ExecutionContext): EduBasicValue
    {
        // Require 1D array and search value; dispatch to INCLUDES / INDEXOF / FIND.
        const arrayValue = this.arrayExpr.evaluate(context);
        if (arrayValue.type !== EduBasicType.Array)
        {
            throw new Error(`${this.operator} requires array as left operand, got ${arrayValue.type}`);
        }

        if (arrayValue.dimensions && arrayValue.dimensions.length > 1)
        {
            throw new Error(`${this.operator} is only supported for 1D arrays`);
        }

        const searchValue = this.valueExpr.evaluate(context);

        switch (this.operator)
        {
            case ArraySearchOperator.Includes:
                return this.evaluateIncludes(arrayValue.value, searchValue);
            case ArraySearchOperator.IndexOf:
                return this.evaluateIndexOf(arrayValue.value, searchValue);
            case ArraySearchOperator.Find:
                return this.evaluateFind(arrayValue.value, searchValue, arrayValue.elementType);
        }
    }

    public toString(omitOuterParens?: boolean): string
    {
        return `${this.arrayExpr.toString()} ${this.operator} ${this.valueExpr.toString()}`;
    }

    private evaluateIncludes(elements: EduBasicValue[], searchValue: EduBasicValue): EduBasicValue
    {
        for (const element of elements)
        {
            if (this.valuesEqual(element, searchValue))
            {
                return { type: EduBasicType.Integer, value: -1 };
            }
        }

        return { type: EduBasicType.Integer, value: 0 };
    }

    private evaluateIndexOf(elements: EduBasicValue[], searchValue: EduBasicValue): EduBasicValue
    {
        for (let i = 0; i < elements.length; i++)
        {
            if (this.valuesEqual(elements[i], searchValue))
            {
                // EduBASIC arrays are one-based by default.
                return { type: EduBasicType.Integer, value: i + 1 };
            }
        }

        return { type: EduBasicType.Integer, value: 0 };
    }

    private evaluateFind(elements: EduBasicValue[], searchValue: EduBasicValue, elementType: EduBasicType): EduBasicValue
    {
        for (const element of elements)
        {
            if (this.valuesEqual(element, searchValue))
            {
                return element;
            }
        }

        return this.getDefaultValueForType(elementType);
    }

    private getDefaultValueForType(type: EduBasicType): EduBasicValue
    {
        switch (type)
        {
            case EduBasicType.Integer:
                return { type: EduBasicType.Integer, value: 0 };
            case EduBasicType.Real:
                return { type: EduBasicType.Real, value: 0.0 };
            case EduBasicType.String:
                return { type: EduBasicType.String, value: '' };
            case EduBasicType.Complex:
                return { type: EduBasicType.Complex, value: { real: 0, imaginary: 0 } };
            case EduBasicType.Array:
                return { type: EduBasicType.Array, value: [], elementType: EduBasicType.Integer };
            case EduBasicType.Structure:
                return { type: EduBasicType.Structure, value: new Map() };
        }
    }

    private valuesEqual(a: EduBasicValue, b: EduBasicValue): boolean
    {
        if (a.type !== b.type)
        {
            return false;
        }

        switch (a.type)
        {
            case EduBasicType.Integer:
            case EduBasicType.Real:
            case EduBasicType.String:
                return a.value === b.value;
            case EduBasicType.Complex:
            {
                const complexA = a.value as ComplexValue;
                const complexB = b.value as ComplexValue;
                return complexA.real === complexB.real && complexA.imaginary === complexB.imaginary;
            }
            case EduBasicType.Array:
            {
                const arrA = a.value as EduBasicValue[];
                const arrB = b.value as EduBasicValue[];
                if (arrA.length !== arrB.length)
                {
                    return false;
                }
                for (let i = 0; i < arrA.length; i++)
                {
                    if (!this.valuesEqual(arrA[i], arrB[i]))
                    {
                        return false;
                    }
                }
                return true;
            }
            case EduBasicType.Structure:
            {
                const mapA = a.value as Map<string, EduBasicValue>;
                const mapB = b.value as Map<string, EduBasicValue>;
                if (mapA.size !== mapB.size)
                {
                    return false;
                }
                for (const [key, valueA] of mapA.entries())
                {
                    const valueB = mapB.get(key);
                    if (!valueB || !this.valuesEqual(valueA, valueB))
                    {
                        return false;
                    }
                }
                return true;
            }
        }
    }
}
