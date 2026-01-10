/**
 * GRIT Shape Modulation Types
 * 
 * Shape operations modify the combined noise using a carrier signal.
 * The carrier frequency is derived from the voice frequency parameter.
 */
export enum ShapeModulation
{
    /**
     * Pass-through, no modulation
     * Combined noise output unchanged.
     */
    None = 0,

    /**
     * XOR with square wave carrier
     * Creates hollow, nasal, metallic tones with spectral notches.
     * Use cases: Metallic weapon impacts, hollow percussive sounds
     */
    XorSquare = 1,

    /**
     * XOR with sine wave carrier
     * Softer modulation than XorSquare, creates smoother metallic tones.
     * Use cases: Softer metallic textures, smoother modulated noise
     */
    XorSine = 2,

    /**
     * XOR with triangle wave carrier
     * Moderate modulation character between square and sine.
     * Use cases: Varied metallic textures, intermediate modulation character
     */
    XorTriangle = 3,

    /**
     * XOR with sawtooth wave carrier
     * Asymmetric modulation with distinct harmonic character.
     * Use cases: Unique textural effects, asymmetric modulation patterns
     */
    XorSaw = 4,

    /**
     * Amplitude modulation with sine carrier (0-1 range)
     * Creates tremolo-like effect, rhythmic amplitude variation.
     * Use cases: Rhythmic textures, tremolo effects
     */
    Am = 5,

    /**
     * Ring modulation (multiply with bipolar sine carrier)
     * Creates sum and difference frequencies, metallic bell-like tones.
     * Use cases: Metallic bell sounds, frequency-shifted textures
     */
    Ring = 6,

    /**
     * Reserved for future expansion
     */
    Reserved = 7,
}

/**
 * Human-readable descriptions for shape modulation types
 */
export const SHAPE_DESCRIPTIONS: Record<ShapeModulation, string> =
{
    [ShapeModulation.None]: 'None (pass-through)',
    [ShapeModulation.XorSquare]: 'XOR with Square Wave',
    [ShapeModulation.XorSine]: 'XOR with Sine Wave',
    [ShapeModulation.XorTriangle]: 'XOR with Triangle Wave',
    [ShapeModulation.XorSaw]: 'XOR with Sawtooth Wave',
    [ShapeModulation.Am]: 'Amplitude Modulation',
    [ShapeModulation.Ring]: 'Ring Modulation',
    [ShapeModulation.Reserved]: 'Reserved',
};
