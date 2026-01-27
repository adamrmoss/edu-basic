/**
 * GRIT AudioWorklet Processor
 * 
 * Runs in a dedicated audio thread (AudioWorkletGlobalScope).
 * Generates procedural audio through LFSR-based bitstream manipulation.
 * 
 * This file is bundled separately and loaded via:
 *   audioContext.audioWorklet.addModule('grit-worklet.js')
 */

import { LfsrPolynomial } from '../lfsr-polynomial';
import { combineOutputs } from '../comb-operation';
import { ShapeModulation } from '../shape-modulation';
import { decodeNoiseCode, NoiseCodeFields } from '../noise-code';
import { AdsrEnvelope } from '../adsr-envelope';
import {
    stepLfsr,
    getLfsrOutputBit,
    applyShapeModulation,
    updateEnvelope,
    EnvelopeState,
    createEnvelopeState,
} from '../synthesis';

/**
 * Voice state maintained per-voice in the processor
 */
interface ProcessorVoiceState
{
    // Configuration
    noiseCode: number;
    fields: NoiseCodeFields;
    frequency: number;
    adsr: AdsrEnvelope;

    // LFSR states
    lfsrA: number;
    lfsrB: number;
    lfsrC: number;
    lfsrAPrevBit: boolean;
    lfsrBPrevBit: boolean;

    // Timing
    decimationCounter: number;
    phase: number;
    shapePhase: number;
    frequencyPhase: number;

    // Envelope
    envelope: EnvelopeState;
    gateOn: boolean;

    // Output
    currentBit: boolean;
}

/**
 * Message types for communication with main thread
 */
type WorkletMessage =
    | { type: 'setVoice'; voiceIndex: number; noiseCode: number; frequency: number; adsr: AdsrEnvelope }
    | { type: 'noteOn'; voiceIndex: number }
    | { type: 'noteOff'; voiceIndex: number }
    | { type: 'setFrequency'; voiceIndex: number; frequency: number }
    | { type: 'setNoiseCode'; voiceIndex: number; noiseCode: number }
    | { type: 'stopAll' };

/**
 * Number of polyphonic voices
 */
const NUM_VOICES = 8;

/**
 * GRIT AudioWorklet Processor
 */
class GritProcessor extends AudioWorkletProcessor
{
    private voices: ProcessorVoiceState[];
    private sampleRate: number;

    public constructor()
    {
        super();

        this.sampleRate = sampleRate;
        this.voices = [];

        for (let i = 0; i < NUM_VOICES; i++)
        {
            this.voices.push(this.createVoiceState());
        }

        this.port.onmessage = (event: MessageEvent<WorkletMessage>) =>
        {
            this.handleMessage(event.data);
        };
    }

    private createVoiceState(): ProcessorVoiceState
    {
        return {
            noiseCode: 0x00000010,
            fields: decodeNoiseCode(0x00000010),
            frequency: 440,
            adsr: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2 },
            lfsrA: 1,
            lfsrB: 1,
            lfsrC: 1,
            lfsrAPrevBit: false,
            lfsrBPrevBit: false,
            decimationCounter: 0,
            phase: 0,
            shapePhase: 0,
            frequencyPhase: 0,
            envelope: createEnvelopeState(),
            gateOn: false,
            currentBit: false,
        };
    }

    private handleMessage(message: WorkletMessage): void
    {
        switch (message.type)
        {
            case 'setVoice':
            {
                const voice = this.voices[message.voiceIndex];

                if (voice)
                {
                    voice.noiseCode = message.noiseCode;
                    voice.fields = decodeNoiseCode(message.noiseCode);
                    voice.frequency = message.frequency;
                    voice.adsr = message.adsr;
                }

                break;
            }

            case 'noteOn':
            {
                const voice = this.voices[message.voiceIndex];

                if (voice)
                {
                    voice.gateOn = true;
                    voice.envelope.phase = 'attack';
                    voice.envelope.time = 0;
                    voice.lfsrA = 1;
                    voice.lfsrB = 1;
                    voice.lfsrC = 1;
                    voice.decimationCounter = 0;
                    voice.phase = 0;
                    voice.shapePhase = 0;
                    voice.frequencyPhase = 0;
                }

                break;
            }

            case 'noteOff':
            {
                const voice = this.voices[message.voiceIndex];

                if (voice && voice.gateOn)
                {
                    voice.gateOn = false;
                    voice.envelope.phase = 'release';
                    voice.envelope.time = 0;
                }

                break;
            }

            case 'setFrequency':
            {
                const voice = this.voices[message.voiceIndex];

                if (voice)
                {
                    voice.frequency = message.frequency;
                }

                break;
            }

            case 'setNoiseCode':
            {
                const voice = this.voices[message.voiceIndex];

                if (voice)
                {
                    voice.noiseCode = message.noiseCode;
                    voice.fields = decodeNoiseCode(message.noiseCode);
                }

                break;
            }

            case 'stopAll':
            {
                for (const voice of this.voices)
                {
                    voice.gateOn = false;
                    voice.envelope.phase = 'idle';
                    voice.envelope.level = 0;
                }

                break;
            }
        }
    }

    public override process(
        _inputs: Float32Array[][],
        outputs: Float32Array[][],
        _parameters: Record<string, Float32Array>
    ): boolean
    {
        const output = outputs[0];

        if (!output || output.length === 0)
        {
            return true;
        }

        const channel = output[0];
        const numSamples = channel.length;
        const invSampleRate = 1.0 / this.sampleRate;

        for (let i = 0; i < numSamples; i++)
        {
            let sample = 0;

            for (const voice of this.voices)
            {
                if (voice.envelope.phase !== 'idle')
                {
                    sample += this.processVoiceSample(voice, invSampleRate);
                }
            }

            // Soft clip to prevent harsh distortion
            sample = Math.tanh(sample * 0.5);
            channel[i] = sample;
        }

        // Copy to all output channels
        for (let ch = 1; ch < output.length; ch++)
        {
            output[ch].set(channel);
        }

        return true;
    }

    private processVoiceSample(voice: ProcessorVoiceState, invSampleRate: number): number
    {
        // Update envelope
        updateEnvelope(voice.envelope, voice.adsr, voice.gateOn, invSampleRate);

        if (voice.envelope.level <= 0)
        {
            return 0;
        }

        // Step LFSRs based on frequency (for pitch control)
        // Frequency controls how fast we step through the LFSR sequence
        // For a 1-bit square wave (period 2), we need 2 steps per cycle
        // So step rate = frequency * 2 / sampleRate
        const stepRate = (voice.frequency * 2) * invSampleRate;
        voice.frequencyPhase += stepRate;

        // Frequency-based stepping takes precedence for pitch control
        if (voice.frequencyPhase >= 1.0)
        {
            voice.frequencyPhase -= 1.0;
            this.stepLfsrs(voice);
        }

        // Get combined output
        const outputs: boolean[] = [];

        if (voice.fields.aEnabled)
        {
            let bit = getLfsrOutputBit(voice.lfsrA, voice.fields.aPolynomial);

            if (voice.fields.aInverted)
            {
                bit = !bit;
            }

            outputs.push(bit);
        }

        if (voice.fields.bEnabled)
        {
            let bit = getLfsrOutputBit(voice.lfsrB, voice.fields.bPolynomial);

            if (voice.fields.bInverted)
            {
                bit = !bit;
            }

            outputs.push(bit);
        }

        if (voice.fields.cEnabled)
        {
            let bit = getLfsrOutputBit(voice.lfsrC, voice.fields.cPolynomial);

            if (voice.fields.cInverted)
            {
                bit = !bit;
            }

            outputs.push(bit);
        }

        // Combine outputs
        voice.currentBit = combineOutputs(voice.fields.comb, outputs);

        // Apply shape modulation
        let shapedBit = voice.currentBit;

        if (voice.fields.shape !== ShapeModulation.None)
        {
            // Update shape phase
            voice.shapePhase += voice.frequency * invSampleRate;

            if (voice.shapePhase >= 1.0)
            {
                voice.shapePhase -= 1.0;
            }

            shapedBit = applyShapeModulation(shapedBit, voice.fields.shape, voice.shapePhase);
        }

        // Convert bit to audio sample (-1 or +1)
        const sample = shapedBit ? 1.0 : -1.0;

        // Apply envelope
        return sample * voice.envelope.level;
    }

    private stepLfsrs(voice: ProcessorVoiceState): void
    {
        const fields = voice.fields;

        // Step LFSR A (always independent unless clock coupled)
        const prevABit = getLfsrOutputBit(voice.lfsrA, fields.aPolynomial);
        voice.lfsrA = stepLfsr(voice.lfsrA, fields.aPolynomial);
        const newABit = getLfsrOutputBit(voice.lfsrA, fields.aPolynomial);
        const aTransition = prevABit !== newABit;

        // Step LFSR B
        if (fields.bEnabled)
        {
            if (fields.bClockedByA)
            {
                // Only step on A transitions
                if (aTransition)
                {
                    voice.lfsrB = stepLfsr(voice.lfsrB, fields.bPolynomial);
                }
            }
            else
            {
                voice.lfsrB = stepLfsr(voice.lfsrB, fields.bPolynomial);
            }
        }

        const prevBBit = voice.lfsrBPrevBit;
        const newBBit = getLfsrOutputBit(voice.lfsrB, fields.bPolynomial);
        voice.lfsrBPrevBit = newBBit;
        const bTransition = prevBBit !== newBBit;

        // Step LFSR C
        if (fields.cEnabled)
        {
            if (fields.cClockedByB)
            {
                // Only step on B transitions
                if (bTransition)
                {
                    voice.lfsrC = stepLfsr(voice.lfsrC, fields.cPolynomial);
                }
            }
            else
            {
                voice.lfsrC = stepLfsr(voice.lfsrC, fields.cPolynomial);
            }
        }

        voice.lfsrAPrevBit = newABit;
    }
}

// Register the processor
registerProcessor('grit-processor', GritProcessor);
