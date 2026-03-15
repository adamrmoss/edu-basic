/**
 * Minimal interfaces that the language runtime uses for host services.
 * The host (e.g. Angular app) implements these and injects an InterpreterFacade
 * so that lang does not depend on the host.
 */

/**
 * File system surface used by file I/O statements.
 */
export interface LangFileSystem
{
    openFile(path: string, mode: 'read' | 'write' | 'append'): number;
    closeFile(handleId: number): void;
    readBytes(handleId: number, count: number): Uint8Array;
    writeBytes(handleId: number, data: Uint8Array): void;
    seek(handleId: number, position: number): void;
    readFile(path: string): Uint8Array | null;
    writeFile(path: string, data: Uint8Array): void;
    deleteFile(path: string): boolean;
    createDirectory(path: string): void;
    deleteDirectory(path: string): boolean;
    listDirectory(path: string): string[];
}

/**
 * Console surface used by CONSOLE and HELP statements.
 */
export interface LangConsole
{
    printOutput(text: string): void;
}

/**
 * Facade supplied by the host and passed into the runtime.
 * Lang uses this to access filesystem and console without depending on the host.
 */
export interface InterpreterFacade
{
    getFileSystem(): LangFileSystem;
    getConsole(): LangConsole | null;
}
