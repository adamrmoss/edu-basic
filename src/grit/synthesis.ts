/**
 * GRIT Synthesis Core
 * 
 * Core synthesis logic extracted for testability.
 * Used by both the AudioWorklet processor and unit tests.
 */

import { LfsrPolynomial, LFSR_CONFIGS } from './lfsr-polynomial';
import { ShapeModulation } from './shape-modulation';
import { AdsrEnvelope } from './adsr-envelope';

/**
 * Steps an LFSR to its next state
 */
export function stepLfsr(state: number, polynomial: LfsrPolynomial): number
{
    const config = LFSR_CONFIGS[polynomial];

    // Special case: fixed patterns
    if (polynomial === LfsrPolynomial.SquareWave)
    {
        // Alternating 0/1
        return state === 0 ? 1 : 0;
    }

    if (polynomial === LfsrPolynomial.PulseWave25_75)
    {
        // Cycle through 0,1,2,3
        return (state + 1) % 4;
    }

    // Standard maximal-length Fibonacci LFSR
    const taps = config.taps;
    const bits = config.bits;

    // XOR the bits at tap positions (0-indexed)
    let feedback = 0;

    for (const tap of taps)
    {
        feedback ^= (state >>> tap) & 1;
    }

    // Shift right and insert feedback at MSB
    const mask = (1 << bits) - 1;

    return ((state >>> 1) | (feedback << (bits - 1))) & mask;
}

/**
 * Gets the output bit from an LFSR state
 */
export function getLfsrOutputBit(state: number, polynomial: LfsrPolynomial): boolean
{
    if (polynomial === LfsrPolynomial.SquareWave)
    {
        return state === 1;
    }

    if (polynomial === LfsrPolynomial.PulseWave25_75)
    {
        // 25% duty cycle: only state 0 is high
        return state === 0;
    }

    // Standard LFSR: output is bit 0
    return (state & 1) === 1;
}

/**
 * Generates a sequence of LFSR output bits
 */
export function generateLfsrSequence(polynomial: LfsrPolynomial, length: number, initialState: number = 1): boolean[]
{
    const sequence: boolean[] = [];
    let state = initialState;

    for (let i = 0; i < length; i++)
    {
        sequence.push(getLfsrOutputBit(state, polynomial));
        state = stepLfsr(state, polynomial);
    }

    return sequence;
}

/**
 * Envelope state for processing
 */
export interface EnvelopeState
{
    phase: 'idle' | 'attack' | 'decay' | 'sustain' | 'release';
    time: number;
    level: number;
}

/**
 * Updates envelope state for one sample
 */
export function updateEnvelope(
    state: EnvelopeState,
    adsr: AdsrEnvelope,
    gateOn: boolean,
    deltaTime: number
): void
{
    // Handle gate transitions
    if (gateOn && state.phase === 'idle')
    {
        state.phase = 'attack';
        state.time = 0;
    }
    else if (!gateOn && (state.phase === 'attack' || state.phase === 'decay' || state.phase === 'sustain'))
    {
        state.phase = 'release';
        state.time = 0;
    }

    state.time += deltaTime;

    switch (state.phase)
    {
        case 'attack':
        {
            if (adsr.attack <= 0)
            {
                state.level = 1.0;
                state.phase = 'decay';
                state.time = 0;
            }
            else
            {
                state.level = Math.min(1.0, state.time / adsr.attack);

                if (state.level >= 1.0)
                {
                    state.phase = 'decay';
                    state.time = 0;
                }
            }

            break;
        }

        case 'decay':
        {
            if (adsr.decay <= 0)
            {
                state.level = adsr.sustain;
                state.phase = 'sustain';
                state.time = 0;
            }
            else
            {
                const decayProgress = Math.min(1.0, state.time / adsr.decay);
                state.level = 1.0 - (1.0 - adsr.sustain) * decayProgress;

                if (state.level <= adsr.sustain)
                {
                    state.level = adsr.sustain;
                    state.phase = 'sustain';
                    state.time = 0;
                }
            }

            break;
        }

        case 'sustain':
        {
            state.level = adsr.sustain;
            break;
        }

        case 'release':
        {
            if (adsr.release <= 0)
            {
                state.level = 0;
                state.phase = 'idle';
            }
            else
            {
                const releaseProgress = Math.min(1.0, state.time / adsr.release);
                state.level = adsr.sustain * (1.0 - releaseProgress);

                if (state.level <= 0)
                {
                    state.level = 0;
                    state.phase = 'idle';
                }
            }

            break;
        }

        case 'idle':
        {
            state.level = 0;
            break;
        }
    }
}

/**
 * Creates initial envelope state
 */
export function createEnvelopeState(): EnvelopeState
{
    return {
        phase: 'idle',
        time: 0,
        level: 0,
    };
}

/**
 * Applies shape modulation to a noise bit
 */
export function applyShapeModulation(
    noiseBit: boolean,
    shape: ShapeModulation,
    phase: number
): boolean
{
    switch (shape)
    {
        case ShapeModulation.None:
            return noiseBit;

        case ShapeModulation.XorSquare:
        {
            const carrierBit = phase < 0.5;
            return noiseBit !== carrierBit;
        }

        case ShapeModulation.XorSine:
        {
            const sineValue = Math.sin(phase * 2 * Math.PI);
            const carrierBit = sineValue >= 0;
            return noiseBit !== carrierBit;
        }

        case ShapeModulation.XorTriangle:
        {
            const triValue = phase < 0.5 ? phase * 4 - 1 : 3 - phase * 4;
            const carrierBit = triValue >= 0;
            return noiseBit !== carrierBit;
        }

        case ShapeModulation.XorSaw:
        {
            const sawValue = phase * 2 - 1;
            const carrierBit = sawValue >= 0;
            return noiseBit !== carrierBit;
        }

        case ShapeModulation.Am:
        case ShapeModulation.Ring:
            // AM and Ring affect amplitude, handled separately
            return noiseBit;

        default:
            return noiseBit;
    }
}

/**
 * Calculates AM (amplitude modulation) factor
 */
export function getAmFactor(phase: number): number
{
    // Sine carrier, 0-1 range
    return (Math.sin(phase * 2 * Math.PI) + 1) * 0.5;
}

/**
 * Calculates Ring modulation factor
 */
export function getRingFactor(phase: number): number
{
    // Sine carrier, bipolar
    return Math.sin(phase * 2 * Math.PI);
}

