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
        return `LET ${this.variableName} = ${this.value.toString()}`;
    }
}
