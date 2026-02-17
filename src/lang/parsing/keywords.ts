import { toSet } from '../../collections';

/**
 * Central keyword definitions for the EduBASIC language.
 *
 * Categories are defined as small arrays; larger sets are built via set operations
 * so there is a single source of truth and no duplication.
 */

const VARIABLE_KEYWORDS = ['LET', 'DIM', 'LOCAL'] as const;

const CONTROL_FLOW_KEYWORDS = [
    'IF', 'THEN', 'ELSE', 'ELSEIF', 'END', 'FOR', 'TO', 'STEP', 'NEXT',
    'WHILE', 'WEND', 'DO', 'LOOP', 'UNTIL', 'UEND', 'UNLESS', 'SELECT', 'CASE',
    'IS',
    'GOSUB', 'RETURN', 'GOTO', 'LABEL', 'CALL',
    'EXIT', 'CONTINUE', 'SUB', 'TRY', 'CATCH', 'FINALLY', 'THROW'
] as const;

const IO_KEYWORDS = ['PRINT', 'INPUT', 'CLS', 'COLOR', 'LOCATE'] as const;

const GRAPHICS_KEYWORDS = [
    'PSET', 'LINE', 'CIRCLE', 'RECTANGLE', 'OVAL', 'TRIANGLE', 'PAINT',
    'GET', 'PUT', 'ARC', 'TURTLE'
] as const;

const FILE_IO_KEYWORDS = [
    'OPEN', 'CLOSE', 'READ', 'WRITE', 'SEEK', 'READFILE', 'WRITEFILE',
    'LISTDIR', 'MKDIR', 'RMDIR', 'COPY', 'MOVE', 'DELETE'
] as const;

const AUDIO_KEYWORDS = ['PLAY', 'TEMPO', 'VOLUME', 'VOICE'] as const;

const ARRAY_KEYWORDS = ['PUSH', 'POP', 'SHIFT', 'UNSHIFT'] as const;

const MISC_STATEMENT_KEYWORDS = ['SLEEP', 'RANDOMIZE', 'SET', 'HELP', 'CONSOLE'] as const;

const SET_MODIFIER_KEYWORDS = ['SPACING', 'TEXT', 'WRAP', 'AUDIO', 'ON', 'OFF'] as const;

const FILE_IO_MODIFIER_KEYWORDS = ['EOF', 'LOC', 'EXISTS', 'APPEND', 'OVERWRITE', 'IN'] as const;

const GRAPHICS_MODIFIER_KEYWORDS = ['FROM', 'WITH', 'AS', 'AT', 'RADIUS', 'RADII', 'FILLED', 'PRESET'] as const;

const AUDIO_MODIFIER_KEYWORDS = ['INSTRUMENT', 'ADSR'] as const;

const GENERAL_MODIFIER_KEYWORDS = ['INTO'] as const;

const DATA_KEYWORDS = ['DATA', 'RESTORE'] as const;

const PARAMETER_KEYWORDS = ['BYREF'] as const;

const LOGICAL_OPERATOR_KEYWORDS = ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR', 'IMP', 'MOD'] as const;

const MATH_FUNCTION_KEYWORDS = [
    'SIN', 'COS', 'TAN', 'ASIN', 'ACOS', 'ATAN', 'SINH', 'COSH', 'TANH',
    'ASINH', 'ACOSH', 'ATANH', 'EXP', 'LOG', 'LOG10', 'LOG2', 'SQRT', 'CBRT',
    'FLOOR', 'CEIL', 'ROUND', 'TRUNC', 'ABS', 'SGN', 'INT'
] as const;

const COMPLEX_FUNCTION_KEYWORDS = ['REAL', 'IMAG', 'CONJ', 'CABS', 'CARG', 'CSQRT'] as const;

const STRING_FUNCTION_KEYWORDS = [
    'ASC', 'CHR', 'STR', 'VAL', 'HEX', 'BIN', 'UCASE', 'LCASE',
    'LTRIM', 'RTRIM', 'TRIM', 'REVERSE', 'LEFT', 'RIGHT', 'MID',
    'INSTR', 'JOIN', 'REPLACE', 'FIND', 'INDEXOF', 'INCLUDES',
    'STARTSWITH', 'ENDSWITH'
] as const;

const CONSTANT_KEYWORDS = ['RND', 'PI', 'E', 'TRUE', 'FALSE', 'INKEY', 'DATE', 'TIME', 'NOW'] as const;

const OTHER_OPERATOR_KEYWORDS = ['DEG', 'RAD', 'EXPAND', 'NOTES'] as const;

const STATEMENT_START_KEYWORDS = [
    'ARC', 'CALL', 'CASE', 'CATCH', 'CIRCLE', 'CLOSE', 'CLS', 'COLOR',
    'CONSOLE', 'CONTINUE', 'COPY', 'DELETE', 'DIM', 'DO', 'ELSE', 'ELSEIF',
    'END', 'EXIT', 'FINALLY', 'FOR', 'GET', 'GOSUB', 'GOTO', 'HELP', 'IF',
    'INPUT', 'LABEL', 'LET', 'LINE', 'LISTDIR', 'LOCAL', 'LOCATE', 'LOOP',
    'MKDIR', 'MOVE', 'NEXT', 'OPEN', 'OVAL', 'PAINT', 'PLAY', 'POP', 'PRINT',
    'PSET', 'PUSH', 'PUT', 'RANDOMIZE', 'READ', 'READFILE', 'RECTANGLE',
    'RETURN', 'RMDIR', 'SEEK', 'SELECT', 'SET', 'SHIFT', 'SLEEP', 'SUB',
    'TEMPO', 'THROW', 'TRIANGLE', 'TRY', 'TURTLE', 'UEND', 'UNLESS', 'UNSHIFT',
    'UNTIL', 'VOICE', 'VOLUME', 'WEND', 'WHILE', 'WRITE', 'WRITEFILE'
] as const;

const EXPRESSION_TERMINATOR_KEYWORDS = [
    'ADSR', 'APPEND', 'AS', 'AT', 'FILLED', 'FOR', 'FROM', 'IN', 'INSTRUMENT',
    'INTO',
    'OVERWRITE', 'PRESET', 'RADII', 'RADIUS', 'READ', 'STEP', 'THEN', 'TO', 'WITH'
] as const;

/**
 * Keyword taxonomy used by tokenization and parsing.
 *
 * Provides categorized keyword lists and case-insensitive membership tests.
 */
export class Keywords
{
    /**
     * Variable statement keywords.
     */
    public static readonly variable = VARIABLE_KEYWORDS;

    /**
     * Control-flow statement keywords.
     */
    public static readonly controlFlow = CONTROL_FLOW_KEYWORDS;

    /**
     * I/O statement keywords.
     */
    public static readonly io = IO_KEYWORDS;

    /**
     * Graphics statement keywords.
     */
    public static readonly graphics = GRAPHICS_KEYWORDS;

    /**
     * File I/O statement keywords.
     */
    public static readonly fileIo = FILE_IO_KEYWORDS;

    /**
     * Audio statement keywords.
     */
    public static readonly audio = AUDIO_KEYWORDS;

    /**
     * Array statement keywords.
     */
    public static readonly array = ARRAY_KEYWORDS;

    /**
     * Miscellaneous statement keywords.
     */
    public static readonly miscStatement = MISC_STATEMENT_KEYWORDS;

    /**
     * `SET` modifier keywords.
     */
    public static readonly setModifier = SET_MODIFIER_KEYWORDS;

    /**
     * File I/O modifier keywords.
     */
    public static readonly fileIoModifier = FILE_IO_MODIFIER_KEYWORDS;

    /**
     * Graphics modifier keywords.
     */
    public static readonly graphicsModifier = GRAPHICS_MODIFIER_KEYWORDS;

    /**
     * Audio modifier keywords.
     */
    public static readonly audioModifier = AUDIO_MODIFIER_KEYWORDS;

    /**
     * General modifier keywords.
     */
    public static readonly generalModifier = GENERAL_MODIFIER_KEYWORDS;

    /**
     * DATA/RESTORE keywords.
     */
    public static readonly data = DATA_KEYWORDS;

    /**
     * Parameter modifier keywords (e.g. `BYREF`).
     */
    public static readonly parameter = PARAMETER_KEYWORDS;

    /**
     * Logical operator keywords.
     */
    public static readonly logicalOperator = LOGICAL_OPERATOR_KEYWORDS;

    /**
     * Math operator keywords.
     */
    public static readonly mathFunction = MATH_FUNCTION_KEYWORDS;

    /**
     * Complex-number operator keywords.
     */
    public static readonly complexFunction = COMPLEX_FUNCTION_KEYWORDS;

    /**
     * String operator keywords.
     */
    public static readonly stringFunction = STRING_FUNCTION_KEYWORDS;

    /**
     * Built-in constant keywords.
     */
    public static readonly constant = CONSTANT_KEYWORDS;

    /**
     * Other operator keywords.
     */
    public static readonly otherOperator = OTHER_OPERATOR_KEYWORDS;

    /**
     * Keywords that can begin a statement.
     */
    public static readonly statementStart = STATEMENT_START_KEYWORDS;

    /**
     * Keywords that terminate expression parsing in statement contexts.
     */
    public static readonly expressionTerminator = EXPRESSION_TERMINATOR_KEYWORDS;

    /**
     * Set containing all defined keywords.
     */
    // Union of all category arrays for case-insensitive membership tests.
    public static readonly all = toSet(
        VARIABLE_KEYWORDS,
        CONTROL_FLOW_KEYWORDS,
        IO_KEYWORDS,
        GRAPHICS_KEYWORDS,
        FILE_IO_KEYWORDS,
        AUDIO_KEYWORDS,
        ARRAY_KEYWORDS,
        MISC_STATEMENT_KEYWORDS,
        SET_MODIFIER_KEYWORDS,
        FILE_IO_MODIFIER_KEYWORDS,
        GRAPHICS_MODIFIER_KEYWORDS,
        AUDIO_MODIFIER_KEYWORDS,
        GENERAL_MODIFIER_KEYWORDS,
        DATA_KEYWORDS,
        PARAMETER_KEYWORDS,
        LOGICAL_OPERATOR_KEYWORDS,
        MATH_FUNCTION_KEYWORDS,
        COMPLEX_FUNCTION_KEYWORDS,
        STRING_FUNCTION_KEYWORDS,
        CONSTANT_KEYWORDS,
        OTHER_OPERATOR_KEYWORDS
    );

    /**
     * Set containing keywords that can begin a statement.
     */
    public static readonly statementStartSet = new Set(STATEMENT_START_KEYWORDS) as Set<string>;

    /**
     * Set containing keywords that terminate expressions in statement contexts.
     */
    public static readonly expressionTerminatorSet = new Set(EXPRESSION_TERMINATOR_KEYWORDS) as Set<string>;

    /**
     * Determine whether a word is a recognized keyword (case-insensitive).
     *
     * @param word Word to test.
     */
    public static isKeyword(word: string): boolean
    {
        return this.all.has(word.toUpperCase());
    }

    /**
     * Determine whether a word is a recognized statement-start keyword (case-insensitive).
     *
     * @param word Word to test.
     */
    public static isStatementStartKeyword(word: string): boolean
    {
        return this.statementStartSet.has(word.toUpperCase());
    }

    /**
     * Determine whether a word is a recognized expression-terminator keyword (case-insensitive).
     *
     * @param word Word to test.
     */
    public static isExpressionTerminatorKeyword(word: string): boolean
    {
        return this.expressionTerminatorSet.has(word.toUpperCase());
    }
}
