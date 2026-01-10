import {
    stepLfsr,
    getLfsrOutputBit,
    generateLfsrSequence,
    updateEnvelope,
    createEnvelopeState,
    applyShapeModulation,
    getAmFactor,
    getRingFactor,
    EnvelopeState,
} from '../../src/grit/synthesis';
import { LfsrPolynomial, LFSR_CONFIGS } from '../../src/grit/lfsr-polynomial';
import { ShapeModulation } from '../../src/grit/shape-modulation';
import { AdsrEnvelope } from '../../src/grit/adsr-envelope';

describe('Synthesis Core', () =>
{
    describe('stepLfsr', () =>
    {
        describe('SquareWave (1-bit)', () =>
        {
            it('should alternate between 0 and 1', () =>
            {
                expect(stepLfsr(0, LfsrPolynomial.SquareWave)).toBe(1);
                expect(stepLfsr(1, LfsrPolynomial.SquareWave)).toBe(0);
            });

            it('should have period 2', () =>
            {
                let state = 0;
                const sequence: number[] = [];

                for (let i = 0; i < 4; i++)
                {
                    sequence.push(state);
                    state = stepLfsr(state, LfsrPolynomial.SquareWave);
                }

                expect(sequence).toEqual([0, 1, 0, 1]);
            });
        });

        describe('PulseWave25_75 (2-bit counter)', () =>
        {
            it('should cycle through 0,1,2,3', () =>
            {
                expect(stepLfsr(0, LfsrPolynomial.PulseWave25_75)).toBe(1);
                expect(stepLfsr(1, LfsrPolynomial.PulseWave25_75)).toBe(2);
                expect(stepLfsr(2, LfsrPolynomial.PulseWave25_75)).toBe(3);
                expect(stepLfsr(3, LfsrPolynomial.PulseWave25_75)).toBe(0);
            });

            it('should have period 4', () =>
            {
                let state = 0;

                for (let i = 0; i < 4; i++)
                {
                    state = stepLfsr(state, LfsrPolynomial.PulseWave25_75);
                }

                expect(state).toBe(0);
            });
        });

        describe('4-bit LFSR', () =>
        {
            it('should produce a non-zero next state from state 1', () =>
            {
                const nextState = stepLfsr(1, LfsrPolynomial.Lfsr4Bit);

                expect(nextState).toBeGreaterThan(0);
                expect(nextState).toBeLessThan(16);
            });

            it('should have maximal period of 15', () =>
            {
                const visited = new Set<number>();
                let state = 1;

                for (let i = 0; i < 20; i++)
                {
                    if (visited.has(state))
                    {
                        break;
                    }

                    visited.add(state);
                    state = stepLfsr(state, LfsrPolynomial.Lfsr4Bit);
                }

                expect(visited.size).toBe(LFSR_CONFIGS[LfsrPolynomial.Lfsr4Bit].period);
            });
        });

        describe('5-bit LFSR', () =>
        {
            it('should have maximal period of 31', () =>
            {
                const visited = new Set<number>();
                let state = 1;

                for (let i = 0; i < 40; i++)
                {
                    if (visited.has(state))
                    {
                        break;
                    }

                    visited.add(state);
                    state = stepLfsr(state, LfsrPolynomial.Lfsr5Bit);
                }

                expect(visited.size).toBe(31);
            });
        });

        describe('9-bit LFSR', () =>
        {
            it('should have maximal period of 511', () =>
            {
                const visited = new Set<number>();
                let state = 1;

                for (let i = 0; i < 520; i++)
                {
                    if (visited.has(state))
                    {
                        break;
                    }

                    visited.add(state);
                    state = stepLfsr(state, LfsrPolynomial.Lfsr9Bit);
                }

                expect(visited.size).toBe(511);
            });
        });
    });

    describe('getLfsrOutputBit', () =>
    {
        it('should return correct bit for SquareWave', () =>
        {
            expect(getLfsrOutputBit(0, LfsrPolynomial.SquareWave)).toBe(false);
            expect(getLfsrOutputBit(1, LfsrPolynomial.SquareWave)).toBe(true);
        });

        it('should return correct bit for PulseWave25_75 (25% duty cycle)', () =>
        {
            expect(getLfsrOutputBit(0, LfsrPolynomial.PulseWave25_75)).toBe(true);
            expect(getLfsrOutputBit(1, LfsrPolynomial.PulseWave25_75)).toBe(false);
            expect(getLfsrOutputBit(2, LfsrPolynomial.PulseWave25_75)).toBe(false);
            expect(getLfsrOutputBit(3, LfsrPolynomial.PulseWave25_75)).toBe(false);
        });

        it('should return bit 0 for standard LFSRs', () =>
        {
            expect(getLfsrOutputBit(0b0001, LfsrPolynomial.Lfsr4Bit)).toBe(true);
            expect(getLfsrOutputBit(0b0010, LfsrPolynomial.Lfsr4Bit)).toBe(false);
            expect(getLfsrOutputBit(0b1010, LfsrPolynomial.Lfsr4Bit)).toBe(false);
            expect(getLfsrOutputBit(0b1011, LfsrPolynomial.Lfsr4Bit)).toBe(true);
        });
    });

    describe('generateLfsrSequence', () =>
    {
        it('should generate square wave sequence', () =>
        {
            const sequence = generateLfsrSequence(LfsrPolynomial.SquareWave, 6, 0);

            expect(sequence).toEqual([false, true, false, true, false, true]);
        });

        it('should generate 25/75 pulse sequence', () =>
        {
            const sequence = generateLfsrSequence(LfsrPolynomial.PulseWave25_75, 8, 0);

            // Pattern: true (state 0), false, false, false, true (state 0 again), ...
            expect(sequence).toEqual([true, false, false, false, true, false, false, false]);
        });

        it('should generate specified length', () =>
        {
            const sequence = generateLfsrSequence(LfsrPolynomial.Lfsr4Bit, 10);

            expect(sequence.length).toBe(10);
        });

        it('should be deterministic with same initial state', () =>
        {
            const seq1 = generateLfsrSequence(LfsrPolynomial.Lfsr9Bit, 20, 42);
            const seq2 = generateLfsrSequence(LfsrPolynomial.Lfsr9Bit, 20, 42);

            expect(seq1).toEqual(seq2);
        });

        it('should produce different sequences with different initial states', () =>
        {
            const seq1 = generateLfsrSequence(LfsrPolynomial.Lfsr9Bit, 20, 1);
            const seq2 = generateLfsrSequence(LfsrPolynomial.Lfsr9Bit, 20, 100);

            expect(seq1).not.toEqual(seq2);
        });
    });

    describe('createEnvelopeState', () =>
    {
        it('should create initial idle state', () =>
        {
            const state = createEnvelopeState();

            expect(state.phase).toBe('idle');
            expect(state.time).toBe(0);
            expect(state.level).toBe(0);
        });
    });

    describe('updateEnvelope', () =>
    {
        const testAdsr: AdsrEnvelope = {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.5,
            release: 0.3,
        };

        describe('attack phase', () =>
        {
            it('should transition from idle to attack when gate turns on', () =>
            {
                const state = createEnvelopeState();

                updateEnvelope(state, testAdsr, true, 0.01);

                expect(state.phase).toBe('attack');
                expect(state.level).toBeGreaterThan(0);
            });

            it('should ramp up during attack', () =>
            {
                const state: EnvelopeState = { phase: 'attack', time: 0, level: 0 };

                updateEnvelope(state, testAdsr, true, 0.05);

                expect(state.level).toBeCloseTo(0.5, 2);
            });

            it('should transition to decay at end of attack', () =>
            {
                const state: EnvelopeState = { phase: 'attack', time: 0.09, level: 0.9 };

                updateEnvelope(state, testAdsr, true, 0.02);

                expect(state.phase).toBe('decay');
                expect(state.level).toBe(1.0);
            });

            it('should handle zero attack time', () =>
            {
                const state = createEnvelopeState();
                const zeroAttackAdsr = { ...testAdsr, attack: 0 };

                updateEnvelope(state, zeroAttackAdsr, true, 0.01);

                expect(state.phase).toBe('decay');
                expect(state.level).toBe(1.0);
            });
        });

        describe('decay phase', () =>
        {
            it('should decay from 1.0 toward sustain level', () =>
            {
                const state: EnvelopeState = { phase: 'decay', time: 0, level: 1.0 };

                updateEnvelope(state, testAdsr, true, 0.1);

                expect(state.level).toBeCloseTo(0.75, 2);
            });

            it('should transition to sustain at end of decay', () =>
            {
                const state: EnvelopeState = { phase: 'decay', time: 0.19, level: 0.55 };

                updateEnvelope(state, testAdsr, true, 0.02);

                expect(state.phase).toBe('sustain');
                expect(state.level).toBe(testAdsr.sustain);
            });

            it('should handle zero decay time', () =>
            {
                const state: EnvelopeState = { phase: 'decay', time: 0, level: 1.0 };
                const zeroDecayAdsr = { ...testAdsr, decay: 0 };

                updateEnvelope(state, zeroDecayAdsr, true, 0.01);

                expect(state.phase).toBe('sustain');
                expect(state.level).toBe(testAdsr.sustain);
            });
        });

        describe('sustain phase', () =>
        {
            it('should maintain sustain level', () =>
            {
                const state: EnvelopeState = { phase: 'sustain', time: 0, level: testAdsr.sustain };

                updateEnvelope(state, testAdsr, true, 1.0);

                expect(state.phase).toBe('sustain');
                expect(state.level).toBe(testAdsr.sustain);
            });

            it('should transition to release when gate turns off', () =>
            {
                const state: EnvelopeState = { phase: 'sustain', time: 0, level: testAdsr.sustain };

                updateEnvelope(state, testAdsr, false, 0.01);

                expect(state.phase).toBe('release');
            });
        });

        describe('release phase', () =>
        {
            it('should decay from sustain level to zero', () =>
            {
                const state: EnvelopeState = { phase: 'release', time: 0, level: testAdsr.sustain };

                updateEnvelope(state, testAdsr, false, 0.15);

                expect(state.level).toBeCloseTo(0.25, 2);
            });

            it('should transition to idle at end of release', () =>
            {
                const state: EnvelopeState = { phase: 'release', time: 0.29, level: 0.05 };

                updateEnvelope(state, testAdsr, false, 0.02);

                expect(state.phase).toBe('idle');
                expect(state.level).toBe(0);
            });

            it('should handle zero release time', () =>
            {
                const state: EnvelopeState = { phase: 'release', time: 0, level: testAdsr.sustain };
                const zeroReleaseAdsr = { ...testAdsr, release: 0 };

                updateEnvelope(state, zeroReleaseAdsr, false, 0.01);

                expect(state.phase).toBe('idle');
                expect(state.level).toBe(0);
            });
        });

        describe('idle phase', () =>
        {
            it('should remain idle with gate off', () =>
            {
                const state = createEnvelopeState();

                updateEnvelope(state, testAdsr, false, 0.01);

                expect(state.phase).toBe('idle');
                expect(state.level).toBe(0);
            });
        });
    });

    describe('applyShapeModulation', () =>
    {
        describe('None', () =>
        {
            it('should pass through unchanged', () =>
            {
                expect(applyShapeModulation(true, ShapeModulation.None, 0)).toBe(true);
                expect(applyShapeModulation(false, ShapeModulation.None, 0.5)).toBe(false);
            });
        });

        describe('XorSquare', () =>
        {
            it('should XOR with square wave carrier', () =>
            {
                // Phase < 0.5: carrier is true
                expect(applyShapeModulation(true, ShapeModulation.XorSquare, 0.25)).toBe(false);
                expect(applyShapeModulation(false, ShapeModulation.XorSquare, 0.25)).toBe(true);

                // Phase >= 0.5: carrier is false
                expect(applyShapeModulation(true, ShapeModulation.XorSquare, 0.75)).toBe(true);
                expect(applyShapeModulation(false, ShapeModulation.XorSquare, 0.75)).toBe(false);
            });
        });

        describe('XorSine', () =>
        {
            it('should XOR based on sine wave sign', () =>
            {
                // Phase 0.25: sin = 1 (positive), carrier true
                expect(applyShapeModulation(true, ShapeModulation.XorSine, 0.25)).toBe(false);

                // Phase 0.75: sin = -1 (negative), carrier false
                expect(applyShapeModulation(true, ShapeModulation.XorSine, 0.75)).toBe(true);
            });
        });

        describe('XorTriangle', () =>
        {
            it('should XOR based on triangle wave sign', () =>
            {
                // Phase 0: tri = -1, carrier false
                expect(applyShapeModulation(true, ShapeModulation.XorTriangle, 0)).toBe(true);

                // Phase 0.25: tri = 0, carrier true (>= 0)
                expect(applyShapeModulation(true, ShapeModulation.XorTriangle, 0.25)).toBe(false);
            });
        });

        describe('XorSaw', () =>
        {
            it('should XOR based on sawtooth wave sign', () =>
            {
                // Phase 0: saw = -1, carrier false
                expect(applyShapeModulation(true, ShapeModulation.XorSaw, 0)).toBe(true);

                // Phase 0.75: saw = 0.5, carrier true
                expect(applyShapeModulation(true, ShapeModulation.XorSaw, 0.75)).toBe(false);
            });
        });

        describe('AM and Ring', () =>
        {
            it('should pass through (amplitude handled separately)', () =>
            {
                expect(applyShapeModulation(true, ShapeModulation.Am, 0.5)).toBe(true);
                expect(applyShapeModulation(false, ShapeModulation.Ring, 0.5)).toBe(false);
            });
        });
    });

    describe('getAmFactor', () =>
    {
        it('should return 0.5 at phase 0', () =>
        {
            expect(getAmFactor(0)).toBeCloseTo(0.5, 5);
        });

        it('should return 1.0 at phase 0.25', () =>
        {
            expect(getAmFactor(0.25)).toBeCloseTo(1.0, 5);
        });

        it('should return 0.5 at phase 0.5', () =>
        {
            expect(getAmFactor(0.5)).toBeCloseTo(0.5, 5);
        });

        it('should return 0.0 at phase 0.75', () =>
        {
            expect(getAmFactor(0.75)).toBeCloseTo(0.0, 5);
        });

        it('should always be in range [0, 1]', () =>
        {
            for (let phase = 0; phase < 1; phase += 0.1)
            {
                const factor = getAmFactor(phase);

                expect(factor).toBeGreaterThanOrEqual(0);
                expect(factor).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('getRingFactor', () =>
    {
        it('should return 0 at phase 0', () =>
        {
            expect(getRingFactor(0)).toBeCloseTo(0, 5);
        });

        it('should return 1 at phase 0.25', () =>
        {
            expect(getRingFactor(0.25)).toBeCloseTo(1, 5);
        });

        it('should return 0 at phase 0.5', () =>
        {
            expect(getRingFactor(0.5)).toBeCloseTo(0, 5);
        });

        it('should return -1 at phase 0.75', () =>
        {
            expect(getRingFactor(0.75)).toBeCloseTo(-1, 5);
        });

        it('should always be in range [-1, 1]', () =>
        {
            for (let phase = 0; phase < 1; phase += 0.1)
            {
                const factor = getRingFactor(phase);

                expect(factor).toBeGreaterThanOrEqual(-1);
                expect(factor).toBeLessThanOrEqual(1);
            }
        });
    });
});

