export class CommandHelpRegistry
{
    private static readonly helpForms: Map<string, string[]> = new Map([
        ['PRINT', [
            'PRINT expression1, expression2, ...',
            'PRINT expression1, expression2, ...;',
            'PRINT array[]',
            'PRINT array[];',
            'PRINT'
        ]],
        ['INPUT', [
            'INPUT variable',
            'INPUT array[]'
        ]],
        ['COLOR', [
            'COLOR foregroundColor%',
            'COLOR foregroundColor%, backgroundColor%',
            'COLOR , backgroundColor%'
        ]],
        ['LOCATE', [
            'LOCATE row%, column%'
        ]],
        ['CLS', [
            'CLS'
        ]],
        ['LET', [
            'LET variable = expression',
            'LET array[] = expression'
        ]],
        ['DIM', [
            'DIM array[] [dimension1, dimension2, ...]'
        ]],
        ['LOCAL', [
            'LOCAL variable = expression',
            'LOCAL array[] = expression'
        ]],
        ['IF', [
            'IF condition THEN ... END IF',
            'IF condition THEN ... ELSE ... END IF',
            'IF condition THEN ... ELSEIF condition THEN ... END IF'
        ]],
        ['FOR', [
            'FOR var% = start TO end',
            'FOR var% = start TO end STEP step'
        ]],
        ['NEXT', [
            'NEXT',
            'NEXT var%'
        ]],
        ['WHILE', [
            'WHILE condition ... WEND'
        ]],
        ['WEND', [
            'WEND'
        ]],
        ['DO', [
            'DO ... LOOP',
            'DO WHILE condition ... LOOP',
            'DO ... LOOP UNTIL condition',
            'DO ... LOOP WHILE condition'
        ]],
        ['LOOP', [
            'LOOP',
            'LOOP WHILE condition',
            'LOOP UNTIL condition'
        ]],
        ['GOTO', [
            'GOTO label'
        ]],
        ['GOSUB', [
            'GOSUB label'
        ]],
        ['RETURN', [
            'RETURN'
        ]],
        ['END', [
            'END',
            'END IF',
            'END UNLESS',
            'END SELECT',
            'END SUB',
            'END TRY'
        ]],
        ['EXIT', [
            'EXIT FOR',
            'EXIT WHILE',
            'EXIT DO',
            'EXIT SUB'
        ]],
        ['CONTINUE', [
            'CONTINUE FOR',
            'CONTINUE WHILE',
            'CONTINUE DO'
        ]],
        ['SELECT', [
            'SELECT CASE expr ... END SELECT'
        ]],
        ['CASE', [
            'CASE value',
            'CASE value1 TO value2',
            'CASE IS < value',
            'CASE IS > value',
            'CASE IS <= value',
            'CASE IS >= value'
        ]],
        ['TRY', [
            'TRY ... CATCH ... FINALLY ... END TRY'
        ]],
        ['CATCH', [
            'CATCH errorVar$ ...'
        ]],
        ['FINALLY', [
            'FINALLY ...'
        ]],
        ['THROW', [
            'THROW message$'
        ]],
        ['SUB', [
            'SUB name(param1, param2) ... END SUB'
        ]],
        ['CALL', [
            'CALL name(arg1, arg2)'
        ]],
        ['LABEL', [
            'LABEL name'
        ]],
        ['PSET', [
            'PSET (x%, y%)',
            'PSET (x%, y%) WITH color%'
        ]],
        ['LINE', [
            'LINE FROM (x1%, y1%) TO (x2%, y2%)',
            'LINE FROM (x1%, y1%) TO (x2%, y2%) WITH color%'
        ]],
        ['CIRCLE', [
            'CIRCLE AT (x%, y%) RADIUS radius%',
            'CIRCLE AT (x%, y%) RADIUS radius% WITH color%',
            'CIRCLE AT (x%, y%) RADIUS radius% FILLED',
            'CIRCLE AT (x%, y%) RADIUS radius% WITH color% FILLED'
        ]],
        ['RECTANGLE', [
            'RECTANGLE FROM (x1%, y1%) TO (x2%, y2%)',
            'RECTANGLE FROM (x1%, y1%) TO (x2%, y2%) WITH color%',
            'RECTANGLE FROM (x1%, y1%) TO (x2%, y2%) FILLED',
            'RECTANGLE FROM (x1%, y1%) TO (x2%, y2%) WITH color% FILLED'
        ]],
        ['OVAL', [
            'OVAL AT (x%, y%) RADII (radiusX%, radiusY%)',
            'OVAL AT (x%, y%) RADII (radiusX%, radiusY%) WITH color%',
            'OVAL AT (x%, y%) RADII (radiusX%, radiusY%) FILLED',
            'OVAL AT (x%, y%) RADII (radiusX%, radiusY%) WITH color% FILLED'
        ]],
        ['TRIANGLE', [
            'TRIANGLE (x1%, y1%), (x2%, y2%), (x3%, y3%)',
            'TRIANGLE (x1%, y1%), (x2%, y2%), (x3%, y3%) WITH color%',
            'TRIANGLE (x1%, y1%), (x2%, y2%), (x3%, y3%) FILLED',
            'TRIANGLE (x1%, y1%), (x2%, y2%), (x3%, y3%) WITH color% FILLED'
        ]],
        ['ARC', [
            'ARC AT (x%, y%) RADIUS radius% FROM startAngle# TO endAngle#',
            'ARC AT (x%, y%) RADIUS radius% FROM startAngle# TO endAngle# WITH color%'
        ]],
        ['PAINT', [
            'PAINT (x%, y%) WITH color%'
        ]],
        ['GET', [
            'GET array[] FROM (x1%, y1%) TO (x2%, y2%)'
        ]],
        ['PUT', [
            'PUT array[] AT (x%, y%)'
        ]],
        ['TURTLE', [
            'TURTLE command$, ...'
        ]],
        ['OPEN', [
            'OPEN "filename" FOR READ AS #handle%',
            'OPEN "filename" FOR APPEND AS #handle%',
            'OPEN "filename" FOR OVERWRITE AS #handle%'
        ]],
        ['CLOSE', [
            'CLOSE #handle%'
        ]],
        ['READ', [
            'READ variable FROM #handle%'
        ]],
        ['WRITE', [
            'WRITE expression TO #handle%'
        ]],
        ['LINE INPUT', [
            'LINE INPUT variable$ FROM #handle%'
        ]],
        ['SEEK', [
            'SEEK position% IN #handle%'
        ]],
        ['READFILE', [
            'READFILE variable$ FROM "filename"'
        ]],
        ['WRITEFILE', [
            'WRITEFILE expression TO "filename"'
        ]],
        ['LISTDIR', [
            'LISTDIR array$[] FROM "path"'
        ]],
        ['MKDIR', [
            'MKDIR "path"'
        ]],
        ['RMDIR', [
            'RMDIR "path"'
        ]],
        ['COPY', [
            'COPY "source" TO "destination"'
        ]],
        ['MOVE', [
            'MOVE "source" TO "destination"'
        ]],
        ['DELETE', [
            'DELETE "path"'
        ]],
        ['PUSH', [
            'PUSH array[], value'
        ]],
        ['POP', [
            'POP array[]',
            'POP array[], variable'
        ]],
        ['SHIFT', [
            'SHIFT array[]',
            'SHIFT array[], variable'
        ]],
        ['UNSHIFT', [
            'UNSHIFT array[], value'
        ]],
        ['PLAY', [
            'PLAY voice%, "mml"'
        ]],
        ['TEMPO', [
            'TEMPO bpm%'
        ]],
        ['VOLUME', [
            'VOLUME volume%'
        ]],
        ['VOICE', [
            'VOICE voice% PRESET preset$',
            'VOICE voice% WITH noiseCode%',
            'VOICE voice% PRESET preset$ ADSR PRESET adsrPreset%',
            'VOICE voice% PRESET preset$ ADSR attack#, decay#, sustain#, release#'
        ]],
        ['SLEEP', [
            'SLEEP milliseconds%'
        ]],
        ['RANDOMIZE', [
            'RANDOMIZE',
            'RANDOMIZE seed%'
        ]],
        ['SET', [
            'SET LINE SPACING ON',
            'SET LINE SPACING OFF',
            'SET TEXT WRAP ON',
            'SET TEXT WRAP OFF',
            'SET AUDIO ON',
            'SET AUDIO OFF'
        ]],
        ['UNLESS', [
            'UNLESS condition THEN ... END UNLESS'
        ]],
        ['UNTIL', [
            'UNTIL condition'
        ]],
        ['UEND', [
            'UEND'
        ]]
    ]);

    public static getHelpForms(command: string): string[]
    {
        const upperCommand = command.toUpperCase();
        return this.helpForms.get(upperCommand) || [];
    }
}
