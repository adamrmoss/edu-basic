export type ControlStructureType = 'if' | 'unless' | 'while' | 'do' | 'for' | 'sub' | 'select';

export interface ControlStructureFrame
{
    type: ControlStructureType;
    startLine: number;
    endLine: number;

    branchTaken?: boolean;

    loopVariable?: string;
    loopEndValue?: number;
    loopStepValue?: number;

    selectTestValue?: any;
    selectMatched?: boolean;
}

