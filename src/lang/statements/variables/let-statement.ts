import { Statement, ExecutionStatus, ExecutionResult } from '../statement';
import { Expression } from '../../expressions/expression';
import { ExecutionContext } from '../../execution-context';
import { Graphics } from '../../graphics';
import { Audio } from '../../audio';
import { Program } from '../../program';
import { RuntimeExecution } from '../../runtime-execution';
import { EduBasicValue, EduBasicType, coerceValue } from '../../edu-basic-value';

export class LetStatement extends Statement
{
    public constructor(
        public readonly variableName: string,
        public readonly value: Expression
    )
    {
        super();
    }

    public override execute(
        context: ExecutionContext,
        graphics: Graphics,
        audio: Audio,
        program: Program,
        runtime: RuntimeExecution
    ): ExecutionStatus
    {
        let evaluatedValue = this.value.evaluate(context);
        
        // Check for downcasting errors (complex → real/integer)
        const existingType = context.getVariableType(this.variableName);
        if (existingType !== null)
        {
            if (evaluatedValue.type === EduBasicType.Complex)
            {
                if (existingType === EduBasicType.Integer || existingType === EduBasicType.Real)
                {
                    throw new Error(`Cannot assign complex number to ${existingType} variable ${this.variableName}. Use REALPART or IMAGPART to extract parts.`);
                }
            }
        }
        else
        {
            // Infer type from variable name sigil
            const sigil = this.variableName.charAt(this.variableName.length - 1);
            let targetType: EduBasicType | null = null;
            
            switch (sigil)
            {
                case '%':
                    targetType = EduBasicType.Integer;
                    break;
                case '#':
                    targetType = EduBasicType.Real;
                    break;
                case '$':
                    targetType = EduBasicType.String;
                    break;
                case '&':
                    targetType = EduBasicType.Complex;
                    break;
            }
            
            if (targetType !== null)
            {
                if (evaluatedValue.type === EduBasicType.Complex && (targetType === EduBasicType.Integer || targetType === EduBasicType.Real))
                {
                    throw new Error(`Cannot assign complex number to ${targetType} variable ${this.variableName}. Use REALPART or IMAGPART to extract parts.`);
                }
            }
        }
        
        if (evaluatedValue.type === EduBasicType.Array && this.variableName.endsWith('[]'))
        {
            const sigil = this.variableName.charAt(this.variableName.length - 3);
            let targetElementType: EduBasicType | null = null;
            
            switch (sigil)
            {
                case '%':
                    targetElementType = EduBasicType.Integer;
                    break;
                case '#':
                    targetElementType = EduBasicType.Real;
                    break;
                case '$':
                    targetElementType = EduBasicType.String;
                    break;
                case '&':
                    targetElementType = EduBasicType.Complex;
                    break;
            }
            
            if (targetElementType !== null && evaluatedValue.elementType !== targetElementType)
            {
                // Check for downcasting in array elements
                if (evaluatedValue.elementType === EduBasicType.Complex && (targetElementType === EduBasicType.Integer || targetElementType === EduBasicType.Real))
                {
                    throw new Error(`Cannot assign complex array to ${targetElementType} array ${this.variableName}. Use REALPART or IMAGPART to extract parts.`);
                }
                
                const coercedElements = evaluatedValue.value.map(el => coerceValue(el, targetElementType!));
                evaluatedValue = {
                    type: EduBasicType.Array,
                    value: coercedElements,
                    elementType: targetElementType
                };
            }
        }
        
        context.setVariable(this.variableName, evaluatedValue, false);

        return { result: ExecutionResult.Continue };
    }

    public override toString(): string
    {
        return `LET ${this.variableName} = ${this.value.toString(true)}`;
    }
}
