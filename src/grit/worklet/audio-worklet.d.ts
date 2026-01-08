/**
 * Type definitions for AudioWorklet globals
 * 
 * These globals are available in the AudioWorkletGlobalScope,
 * but not in the main thread.
 */

declare const sampleRate: number;

declare function registerProcessor(
    name: string,
    processorCtor: new (options?: AudioWorkletNodeOptions) => AudioWorkletProcessor
): void;

declare class AudioWorkletProcessor
{
    readonly port: MessagePort;
    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean;
}
