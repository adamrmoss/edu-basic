import { EduBasicValue, EduBasicType } from '../../edu-basic-value';

export enum Constant
{
    Rnd = 'RND#',
    Inkey = 'INKEY$',
    Pi = 'PI#',
    E = 'E#',
    Date = 'DATE$',
    Time = 'TIME$',
    Now = 'NOW%',
    True = 'TRUE%',
    False = 'FALSE%',
}

export class ConstantEvaluator
{
    public evaluate(constant: Constant): EduBasicValue
    {
        switch (constant)
        {
            case Constant.Pi:
                return { type: EduBasicType.Real, value: Math.PI };
            case Constant.E:
                return { type: EduBasicType.Real, value: Math.E };
            case Constant.True:
                return { type: EduBasicType.Integer, value: -1 };
            case Constant.False:
                return { type: EduBasicType.Integer, value: 0 };
            case Constant.Rnd:
                return { type: EduBasicType.Real, value: Math.random() };
            case Constant.Inkey:
                // TODO: Implement keyboard input when available
                return { type: EduBasicType.String, value: '' };
            case Constant.Date:
            {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                return { type: EduBasicType.String, value: `${year}-${month}-${day}` };
            }
            case Constant.Time:
            {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                return { type: EduBasicType.String, value: `${hours}:${minutes}:${seconds}` };
            }
            case Constant.Now:
                return { type: EduBasicType.Integer, value: Math.floor(Date.now() / 1000) };
            default:
                throw new Error(`Unknown constant: ${constant}`);
        }
    }
}
