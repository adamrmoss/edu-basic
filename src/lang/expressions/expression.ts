import { RuntimeNode } from '../runtime-node';
import { EduBasicValue } from '../edu-basic-value';
import { ExecutionContext } from '../execution-context';

export abstract class Expression extends RuntimeNode
{
    public abstract evaluate(context: ExecutionContext): EduBasicValue;
}
