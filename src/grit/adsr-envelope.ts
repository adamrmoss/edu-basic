/**
 * GRIT ADSR Envelope
 * 
 * Amplitude control over time, applied after pulse wave conversion.
 * Enables percussive sounds, sustained tones, and smooth fade-outs.
 */
export interface AdsrEnvelope
{
    /**
     * Attack time in seconds
     * Time to reach full amplitude from zero
     */
    attack: number;

    /**
     * Decay time in seconds
     * Time to fall from full amplitude to sustain level
     */
    decay: number;

    /**
     * Sustain level (0.0 to 1.0)
     * Level to hold after decay phase
     */
    sustain: number;

    /**
     * Release time in seconds
     * Time to fall from sustain level to zero
     */
    release: number;
}

/**
 * ADSR envelope phase
 */
export enum AdsrPhase
{
    Idle = 'IDLE',
    Attack = 'ATTACK',
    Decay = 'DECAY',
    Sustain = 'SUSTAIN',
    Release = 'RELEASE',
}

/**
 * Default ADSR envelope for percussive sounds
 */
export const DEFAULT_ADSR_PERCUSSIVE: AdsrEnvelope =
{
    attack: 0.001,
    decay: 0.1,
    sustain: 0.0,
    release: 0.1,
};

/**
 * Default ADSR envelope for sustained sounds
 */
export const DEFAULT_ADSR_SUSTAINED: AdsrEnvelope =
{
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.2,
};

/**
 * Default ADSR envelope for ambient/pad sounds
 */
export const DEFAULT_ADSR_PAD: AdsrEnvelope =
{
    attack: 0.5,
    decay: 0.2,
    sustain: 0.8,
    release: 1.0,
};

/**
 * Creates a copy of an ADSR envelope
 */
export function cloneAdsr(adsr: AdsrEnvelope): AdsrEnvelope
{
    return {
        attack: adsr.attack,
        decay: adsr.decay,
        sustain: adsr.sustain,
        release: adsr.release,
    };
}

/**
 * Validates an ADSR envelope and clamps values to valid ranges
 */
export function validateAdsr(adsr: AdsrEnvelope): AdsrEnvelope
{
    return {
        attack: Math.max(0, adsr.attack),
        decay: Math.max(0, adsr.decay),
        sustain: Math.max(0, Math.min(1, adsr.sustain)),
        release: Math.max(0, adsr.release),
    };
}
