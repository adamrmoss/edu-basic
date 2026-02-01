import { Statement } from '../statements/statement';
import { ParserContext } from './parsers/parser-context';
import { ArrayParsers } from './parsers/array-parsers';
import { AudioParsers } from './parsers/audio-parsers';
import { ControlFlowParsers } from './parsers/control-flow-parsers';
import { FileIoParsers } from './parsers/file-io-parsers';
import { GraphicsParsers } from './parsers/graphics-parsers';
import { IoParsers } from './parsers/io-parsers';
import { MiscParsers } from './parsers/misc-parsers';
import { VariableParsers } from './parsers/variable-parsers';
import { ParseResult } from './parse-result';

/**
 * Statement parse function signature.
 */
export type StatementParser = (context: ParserContext) => ParseResult<Statement>;

const DISPATCH: Record<string, StatementParser> = {
    'ARC': GraphicsParsers.parseArc,
    'CALL': ControlFlowParsers.parseCall,
    'CASE': ControlFlowParsers.parseCase,
    'CATCH': ControlFlowParsers.parseCatch,
    'CIRCLE': GraphicsParsers.parseCircle,
    'CLOSE': FileIoParsers.parseClose,
    'CLS': IoParsers.parseCls,
    'COLOR': IoParsers.parseColor,
    'CONSOLE': MiscParsers.parseConsole,
    'CONTINUE': ControlFlowParsers.parseContinue,
    'COPY': FileIoParsers.parseCopy,
    'DELETE': FileIoParsers.parseDelete,
    'DIM': VariableParsers.parseDim,
    'DO': ControlFlowParsers.parseDo,
    'ELSE': ControlFlowParsers.parseElse,
    'ELSEIF': ControlFlowParsers.parseElseIf,
    'END': ControlFlowParsers.parseEnd,
    'EXIT': ControlFlowParsers.parseExit,
    'FINALLY': ControlFlowParsers.parseFinally,
    'FOR': ControlFlowParsers.parseFor,
    'GET': GraphicsParsers.parseGet,
    'GOSUB': ControlFlowParsers.parseGosub,
    'GOTO': ControlFlowParsers.parseGoto,
    'HELP': MiscParsers.parseHelp,
    'IF': ControlFlowParsers.parseIf,
    'INPUT': IoParsers.parseInput,
    'LABEL': ControlFlowParsers.parseLabel,
    'LET': VariableParsers.parseLet,
    'LINE': GraphicsParsers.parseLineInputOrGraphics,
    'LISTDIR': FileIoParsers.parseListdir,
    'LOCAL': VariableParsers.parseLocal,
    'LOCATE': IoParsers.parseLocate,
    'LOOP': ControlFlowParsers.parseLoop,
    'MKDIR': FileIoParsers.parseMkdir,
    'MOVE': FileIoParsers.parseMove,
    'NEXT': ControlFlowParsers.parseNext,
    'OPEN': FileIoParsers.parseOpen,
    'OVAL': GraphicsParsers.parseOval,
    'PAINT': GraphicsParsers.parsePaint,
    'PLAY': AudioParsers.parsePlay,
    'POP': ArrayParsers.parsePop,
    'PRINT': IoParsers.parsePrint,
    'PSET': GraphicsParsers.parsePset,
    'PUSH': ArrayParsers.parsePush,
    'PUT': GraphicsParsers.parsePut,
    'RANDOMIZE': MiscParsers.parseRandomize,
    'READ': FileIoParsers.parseRead,
    'READFILE': FileIoParsers.parseReadfile,
    'RECTANGLE': GraphicsParsers.parseRectangle,
    'RETURN': ControlFlowParsers.parseReturn,
    'RMDIR': FileIoParsers.parseRmdir,
    'SEEK': FileIoParsers.parseSeek,
    'SELECT': ControlFlowParsers.parseSelectCase,
    'SET': MiscParsers.parseSet,
    'SHIFT': ArrayParsers.parseShift,
    'SLEEP': MiscParsers.parseSleep,
    'SUB': ControlFlowParsers.parseSub,
    'TEMPO': AudioParsers.parseTempo,
    'THROW': ControlFlowParsers.parseThrow,
    'TRIANGLE': GraphicsParsers.parseTriangle,
    'TRY': ControlFlowParsers.parseTry,
    'TURTLE': GraphicsParsers.parseTurtle,
    'UEND': ControlFlowParsers.parseUend,
    'UNLESS': ControlFlowParsers.parseUnless,
    'UNSHIFT': ArrayParsers.parseUnshift,
    'UNTIL': ControlFlowParsers.parseUntil,
    'VOICE': AudioParsers.parseVoice,
    'VOLUME': AudioParsers.parseVolume,
    'WEND': ControlFlowParsers.parseWend,
    'WHILE': ControlFlowParsers.parseWhile,
    'WRITE': FileIoParsers.parseWrite,
    'WRITEFILE': FileIoParsers.parseWritefile
};

/**
 * Statement keyword dispatch table.
 */
export const statementDispatch = new Map<string, StatementParser>(Object.entries(DISPATCH));

/**
 * Get the statement parser for a statement-start keyword (case-insensitive).
 *
 * @param keyword Keyword to look up.
 * @returns The parser function, or `undefined` if the keyword is not a statement starter.
 */
export function getStatementParser(keyword: string): StatementParser | undefined
{
    return statementDispatch.get(keyword.toUpperCase());
}
