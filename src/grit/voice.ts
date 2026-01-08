import { AdsrEnvelope, DEFAULT_ADSR_SUSTAINED } from './adsr-envelope';

/**
 * GRIT Voice Configuration
 * 
 * Each voice is defined by three components:
 * 1. NoiseCode (32-bit): Encodes the complete synthesis configuration
 * 2. Frequency (Hz): Controls pitch/playback rate of the pulse waves
 * 3. ADSR Envelope: Controls amplitude over time
 */
export interface GritVoice
{
    /**
     * 32-bit NoiseCode encoding the synthesis configuration
     */
    noiseCode: number;

    /**
     * Frequency in Hz - controls pitch/playback rate
     */
    frequency: number;

    /**
     * ADSR envelope for amplitude control
     */
    adsr: AdsrEnvelope;
}

/**
 * Voice runtime state for audio generation
 */
export interface VoiceState
{
    /**
     * Current phase for LFSR A (bit position in sequence)
     */
    lfsrAState: number;

    /**
     * Current phase for LFSR B
     */
    lfsrBState: number;

    /**
     * Current phase for LFSR C
     */
    lfsrCState: number;

    /**
     * Previous output bit for LFSR A (for clock coupling edge detection)
     */
    lfsrAPrevBit: boolean;

    /**
     * Previous output bit for LFSR B (for clock coupling edge detection)
     */
    lfsrBPrevBit: boolean;

    /**
     * Decimation counter (counts samples until next LFSR step)
     */
    decimationCounter: number;

    /**
     * Current phase for shape modulation carrier (0-1)
     */
    shapePhase: number;

    /**
     * Current envelope phase (attack, decay, sustain, release)
     */
    envelopePhase: 'attack' | 'decay' | 'sustain' | 'release' | 'idle';

    /**
     * Current envelope time within phase (seconds)
     */
    envelopeTime: number;

    /**
     * Current envelope amplitude (0-1)
     */
    envelopeAmplitude: number;

    /**
     * Whether the voice has been triggered (gate on)
     */
    gateOn: boolean;
}

/**
 * Creates a default voice with square wave at 440 Hz
 */
export function createDefaultVoice(): GritVoice
{
    return {
        noiseCode: 0x00000010,
        frequency: 440.0,
        adsr: { ...DEFAULT_ADSR_SUSTAINED },
    };
}

/**
 * Creates a voice from a preset NoiseCode
 */
export function createVoiceFromPreset(noiseCode: number, frequency: number = 440.0, adsr?: AdsrEnvelope): GritVoice
{
    return {
        noiseCode,
        frequency,
        adsr: adsr ?? { ...DEFAULT_ADSR_SUSTAINED },
    };
}

/**
 * Creates initial voice runtime state
 */
export function createVoiceState(seed: number = 1): VoiceState
{
    return {
        lfsrAState: seed,
        lfsrBState: seed,
        lfsrCState: seed,
        lfsrAPrevBit: false,
        lfsrBPrevBit: false,
        decimationCounter: 0,
        shapePhase: 0,
        envelopePhase: 'idle',
        envelopeTime: 0,
        envelopeAmplitude: 0,
        gateOn: false,
    };
}

/**
 * Resets voice state for retriggering
 */
export function resetVoiceState(state: VoiceState, seed: number = 1): void
{
    state.lfsrAState = seed;
    state.lfsrBState = seed;
    state.lfsrCState = seed;
    state.lfsrAPrevBit = false;
    state.lfsrBPrevBit = false;
    state.decimationCounter = 0;
    state.shapePhase = 0;
    state.envelopePhase = 'idle';
    state.envelopeTime = 0;
    state.envelopeAmplitude = 0;
    state.gateOn = false;
}

/**
 * Clones a voice configuration
 */
export function cloneVoice(voice: GritVoice): GritVoice
{
    return {
        noiseCode: voice.noiseCode,
        frequency: voice.frequency,
        adsr: { ...voice.adsr },
    };
}
