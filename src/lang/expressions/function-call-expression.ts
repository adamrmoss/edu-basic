import { Expression } from './expression';
import { EduBasicValue, EduBasicType, ComplexValue } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';

export enum FunctionName
{
    // String functions (2 args)
    Left = 'LEFT',
    Right = 'RIGHT',
    Instr = 'INSTR',
    Replace = 'REPLACE',
    Startswith = 'STARTSWITH',
    Endswith = 'ENDSWITH',
    
    // String functions (3 args)
    Mid = 'MID',
    
    // Array functions (2 args)
    Find = 'FIND',
    IndexOf = 'INDEXOF',
    Includes = 'INCLUDES',
    Join = 'JOIN',
    
    // Array functions (1 arg)
    Size = 'SIZE',
    Empty = 'EMPTY',
    Len = 'LEN',
}

export class FunctionCallExpression extends Expression
{
    public constructor(
        public readonly functionName: FunctionName,
        public readonly args: Expression[]
    )
    {
        super();
    }

    public evaluate(context: ExecutionContext): EduBasicValue
    {
        const argValues = this.args.map(arg => arg.evaluate(context));

        switch (this.functionName)
        {
            // String functions (2 args)
            case FunctionName.Left:
                return this.evaluateLeft(argValues);
            case FunctionName.Right:
                return this.evaluateRight(argValues);
            case FunctionName.Instr:
                return this.evaluateInstr(argValues);
            case FunctionName.Replace:
                return this.evaluateReplace(argValues);
            case FunctionName.Startswith:
                return this.evaluateStartswith(argValues);
            case FunctionName.Endswith:
                return this.evaluateEndswith(argValues);
            
            // String functions (3 args)
            case FunctionName.Mid:
                return this.evaluateMid(argValues);
            
            // Array functions (2 args)
            case FunctionName.Find:
                return this.evaluateFind(argValues);
            case FunctionName.IndexOf:
                return this.evaluateIndexOf(argValues);
            case FunctionName.Includes:
                return this.evaluateIncludes(argValues);
            case FunctionName.Join:
                return this.evaluateJoin(argValues);
            
            // Array functions (1 arg)
            case FunctionName.Size:
                return this.evaluateSize(argValues);
            case FunctionName.Empty:
                return this.evaluateEmpty(argValues);
            case FunctionName.Len:
                return this.evaluateLen(argValues);
            
            default:
                throw new Error(`Unknown function: ${this.functionName}`);
        }
    }

    private evaluateLeft(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 2);
        if (argValues[0].type !== EduBasicType.String)
        {
            throw new Error(`LEFT requires string as first argument, got ${argValues[0].type}`);
        }
        const n = this.toInteger(argValues[1]);
        const str = argValues[0].value;
        return { type: EduBasicType.String, value: str.substring(0, Math.max(0, n)) };
    }

    private evaluateRight(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 2);
        if (argValues[0].type !== EduBasicType.String)
        {
            throw new Error(`RIGHT requires string as first argument, got ${argValues[0].type}`);
        }
        const n = this.toInteger(argValues[1]);
        const str = argValues[0].value;
        const start = Math.max(0, str.length - n);
        return { type: EduBasicType.String, value: str.substring(start) };
    }

    private evaluateInstr(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 2);
        if (argValues[0].type !== EduBasicType.String || argValues[1].type !== EduBasicType.String)
        {
            throw new Error(`INSTR requires two string arguments`);
        }
        const haystack = argValues[0].value;
        const needle = argValues[1].value;
        const index = haystack.indexOf(needle);
        return { type: EduBasicType.Integer, value: index >= 0 ? index + 1 : 0 };
    }

    private evaluateReplace(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 3);
        if (argValues[0].type !== EduBasicType.String || argValues[1].type !== EduBasicType.String || argValues[2].type !== EduBasicType.String)
        {
            throw new Error(`REPLACE requires three string arguments`);
        }
        const str = argValues[0].value;
        const search = argValues[1].value;
        const replace = argValues[2].value;
        return { type: EduBasicType.String, value: str.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace) };
    }

    private evaluateStartswith(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 2);
        if (argValues[0].type !== EduBasicType.String || argValues[1].type !== EduBasicType.String)
        {
            throw new Error(`STARTSWITH requires two string arguments`);
        }
        const str = argValues[0].value;
        const prefix = argValues[1].value;
        return { type: EduBasicType.Integer, value: str.startsWith(prefix) ? -1 : 0 };
    }

    private evaluateEndswith(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 2);
        if (argValues[0].type !== EduBasicType.String || argValues[1].type !== EduBasicType.String)
        {
            throw new Error(`ENDSWITH requires two string arguments`);
        }
        const str = argValues[0].value;
        const suffix = argValues[1].value;
        return { type: EduBasicType.Integer, value: str.endsWith(suffix) ? -1 : 0 };
    }

    private evaluateMid(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 3);
        if (argValues[0].type !== EduBasicType.String)
        {
            throw new Error(`MID requires string as first argument, got ${argValues[0].type}`);
        }
        const str = argValues[0].value;
        const start = this.toInteger(argValues[1]) - 1; // Convert to 0-based
        const end = this.toInteger(argValues[2]);
        const startPos = Math.max(0, start);
        const endPos = Math.min(str.length, startPos + end);
        return { type: EduBasicType.String, value: str.substring(startPos, endPos) };
    }

    private evaluateFind(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 2);
        if (argValues[0].type !== EduBasicType.Array)
        {
            throw new Error(`FIND requires array as first argument, got ${argValues[0].type}`);
        }
        const arr = argValues[0].value as EduBasicValue[];
        const searchValue = argValues[1];
        for (let i = 0; i < arr.length; i++)
        {
            if (this.valuesEqual(arr[i], searchValue))
            {
                return { type: EduBasicType.Integer, value: i + 1 }; // 1-based index
            }
        }
        return { type: EduBasicType.Integer, value: 0 };
    }

    private evaluateIndexOf(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 2);
        if (argValues[0].type !== EduBasicType.Array)
        {
            throw new Error(`INDEXOF requires array as first argument, got ${argValues[0].type}`);
        }
        const arr = argValues[0].value as EduBasicValue[];
        const searchValue = argValues[1];
        for (let i = 0; i < arr.length; i++)
        {
            if (this.valuesEqual(arr[i], searchValue))
            {
                return { type: EduBasicType.Integer, value: i }; // 0-based index
            }
        }
        return { type: EduBasicType.Integer, value: -1 };
    }

    private evaluateIncludes(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 2);
        if (argValues[0].type !== EduBasicType.Array)
        {
            throw new Error(`INCLUDES requires array as first argument, got ${argValues[0].type}`);
        }
        const arr = argValues[0].value as EduBasicValue[];
        const searchValue = argValues[1];
        for (const element of arr)
        {
            if (this.valuesEqual(element, searchValue))
            {
                return { type: EduBasicType.Integer, value: -1 };
            }
        }
        return { type: EduBasicType.Integer, value: 0 };
    }

    private evaluateJoin(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 2);
        if (argValues[0].type !== EduBasicType.Array)
        {
            throw new Error(`JOIN requires array as first argument, got ${argValues[0].type}`);
        }
        if (argValues[1].type !== EduBasicType.String)
        {
            throw new Error(`JOIN requires string as second argument, got ${argValues[1].type}`);
        }
        const arr = argValues[0].value as EduBasicValue[];
        const delimiter = argValues[1].value;
        const strings = arr.map(el => {
            if (el.type !== EduBasicType.String)
            {
                throw new Error(`JOIN array elements must be strings, got ${el.type}`);
            }
            return el.value;
        });
        return { type: EduBasicType.String, value: strings.join(delimiter) };
    }

    private evaluateSize(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 1);
        if (argValues[0].type !== EduBasicType.Array)
        {
            throw new Error(`SIZE requires array argument, got ${argValues[0].type}`);
        }
        const arr = argValues[0].value as EduBasicValue[];
        return { type: EduBasicType.Integer, value: arr.length };
    }

    private evaluateEmpty(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 1);
        if (argValues[0].type !== EduBasicType.Array)
        {
            throw new Error(`EMPTY requires array argument, got ${argValues[0].type}`);
        }
        const arr = argValues[0].value as EduBasicValue[];
        return { type: EduBasicType.Integer, value: arr.length === 0 ? -1 : 0 };
    }

    private evaluateLen(argValues: EduBasicValue[]): EduBasicValue
    {
        this.checkArity(argValues, 1);
        if (argValues[0].type === EduBasicType.String)
        {
            return { type: EduBasicType.Integer, value: argValues[0].value.length };
        }
        if (argValues[0].type === EduBasicType.Array)
        {
            const arr = argValues[0].value as EduBasicValue[];
            return { type: EduBasicType.Integer, value: arr.length };
        }
        throw new Error(`LEN requires string or array argument, got ${argValues[0].type}`);
    }

    private checkArity(argValues: EduBasicValue[], expected: number): void
    {
        if (argValues.length !== expected)
        {
            throw new Error(`${this.functionName} requires ${expected} argument(s), got ${argValues.length}`);
        }
    }

    private toInteger(value: EduBasicValue): number
    {
        if (value.type === EduBasicType.Integer)
        {
            return value.value;
        }
        if (value.type === EduBasicType.Real)
        {
            return Math.trunc(value.value);
        }
        throw new Error(`Cannot convert ${value.type} to integer`);
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
            case EduBasicType.Structure:
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

    public toString(omitOuterParens?: boolean): string
    {
        const argsStr = this.args.map(arg => arg.toString()).join(', ');
        return `${this.functionName}(${argsStr})`;
    }
}
