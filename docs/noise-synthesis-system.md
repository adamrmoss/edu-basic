# Noise Synthesis System - Authoritative Design Document

## Table of Contents
1. [Design Goals and Non-Goals](#design-goals-and-non-goals)
2. [Historical Context](#historical-context)
3. [Core Architecture](#core-architecture)
4. [NoiseCode Bitfield Structure](#noisecode-bitfield-structure)
5. [LFSR Implementation](#lfsr-implementation)
6. [Signal Flow and Operations](#signal-flow-and-operations)
7. [NoiseCode Field Semantics](#noisecode-field-semantics)
8. [Sound Design Intent](#sound-design-intent)
9. [Implementation Notes](#implementation-notes)
10. [Worked Examples](#worked-examples)
11. [Preset System](#preset-system)

---

## Design Goals and Non-Goals

### Goals
- Create a noise synthesis system that surpasses classic PSG (Programmable Sound Generator) chips like the Atari POKEY
- Provide a compact, expressive language for procedural sound generation
- Enable reproduction of classic game sounds (Pitfall, Defender, etc.) while allowing new creative possibilities
- Support real-time audio generation suitable for engines, weapons, ambience, and glitch effects
- Maintain deterministic behavior for reproducible results
- Use 32-bit LFSRs for precision and flexibility

### Non-Goals
- Not attempting to be a general-purpose synthesizer (focused on noise/chaotic sounds)
- Not emulating specific hardware exactly (rather, capturing and extending the spirit)
- Not requiring external sample libraries (pure procedural generation)
- Not supporting real-time waveform coefficient changes (static PeriodicWave limitations)

---

## Historical Context

### Atari POKEY
The Atari POKEY chip was a sound generator used in Atari 8-bit computers and arcade games. It featured:
- Four independent audio channels
- LFSR-based noise generation
- Clock coupling between channels (one LFSR could clock another)
- High/low noise selection modes
- Periodic noise modes created by clocking one LFSR with another

### Limitations of Classic PSGs
- Fixed register sizes (often 15-bit or 17-bit LFSRs)
- Limited clock routing options
- Binary high/low noise selection
- Hardware-specific tap configurations
- Inflexible modulation capabilities

### This System's Approach
Rather than emulating POKEY exactly, this system:
- Generalizes clock coupling into logical composition operations
- Replaces hardware clock routing with decimation and toggle operations
- Provides a unified 32-bit LFSR architecture with user-selectable taps
- Enables phase-destructive operations (XOR_SQUARE) for unique timbres
- Maintains compatibility with classic sounds while enabling new expressions

---

## Core Architecture

### Signal Flow Overview
```
[4x 32-bit LFSRs] → [Decimation] → [Logical Combination (COMB)] → 
[Shape Modulation (SHAPE)] → [Toggle Operation] → [Output]
```

### Key Components
1. **Four Independent LFSRs (A, B, C, D)**: Each generates a pseudo-random bitstream
2. **Decimation Unit**: Selectively samples LFSR outputs at reduced rates
3. **Combination Logic (COMB)**: Combines LFSR outputs using logical operations
4. **Shape Modulation**: Applies carrier-based shaping (XOR_SQUARE, etc.)
5. **Toggle Operation**: Deterministic polarity flipping for periodic noise effects
6. **AudioWorkletNode**: Real-time DSP processing in a separate thread

### Why AudioWorkletNode
- Runs in a dedicated real-time audio thread (AudioWorkletGlobalScope)
- Avoids JavaScript timing jitter from the main thread
- Enables sample-accurate LFSR stepping
- Provides deterministic, reproducible audio generation
- Similar performance characteristics to VST plugin process loops

---

## NoiseCode Bitfield Structure

The NoiseCode is a compact bitfield that encodes the entire synthesis configuration. The exact bit layout must be verified against the 64-entry preset table, but the structure includes:

### Core Fields
- **COMB**: Logical combination operation selector
  - Defines how LFSR outputs are combined (XOR, AND, OR, etc.)
  - Replaces POKEY's channel coupling mechanism
  
- **SHAPE**: Shape modulation type
  - Controls how the combined noise is shaped by a carrier signal
  - Includes XOR_SQUARE (phase-destructive operation)
  
- **SHAPE_PARAM**: Shape modulation parameter
  - Additional control for shape operations
  - May control carrier frequency, phase offset, or modulation depth
  
- **DECIM**: Decimation factor
  - Controls how often LFSR outputs are sampled
  - Enables sub-audio-rate stepping for pitched noise effects
  
### LFSR Control Fields (per LFSR: A, B, C, D)
- **Enable**: Whether this LFSR contributes to the output
- **Invert**: Polarity inversion of the LFSR output
- **Poly**: Polynomial/tap selection for this LFSR

### Bit Layout (to be finalized)
The exact bit positions and widths need to be determined from the preset table analysis. The structure should accommodate:
- 4 LFSR enable bits
- 4 LFSR invert bits
- 4 LFSR polynomial selectors (width depends on available polynomials)
- COMB operation selector (3-4 bits for operation types)
- SHAPE selector (2-3 bits)
- SHAPE_PARAM (variable width, depends on SHAPE type)
- DECIM factor (4-5 bits for reasonable decimation ranges)

---

## LFSR Implementation

### 32-Bit Standardization
All LFSRs use 32-bit registers, regardless of their effective period. This design decision provides:

1. **Single Standardized Width**: Simplifies implementation and avoids width-dependent code paths
2. **User-Selectable Taps**: Periodicity is controlled by polynomial choice, not register size
3. **IEEE-754 Mantissa Safety**: 32-bit integers fit safely in JavaScript's Number type (53-bit mantissa)
4. **Precision Avoidance**: 32 bits avoids precision loss that could occur with larger registers
5. **Signedness Independence**: The system explicitly does not care about signedness - LFSRs operate on unsigned bit patterns

### LFSR Stepping Algorithm
```typescript
// Pseudo-code for LFSR step
function stepLFSR(lfsr: number, taps: number): number {
  // Calculate feedback bit using XOR of tapped positions
  const feedback = ((lfsr ^ (lfsr >> 1)) & 1);
  // Shift right and insert feedback at MSB
  lfsr = (lfsr >> 1) | (feedback << 31);
  return lfsr;
}
```

### Polynomial Selection
- Each LFSR can select from a set of predefined polynomials
- Polynomials determine tap positions and effective period
- Common choices include maximal-length sequences (period = 2^n - 1)
- Non-maximal polynomials can create shorter, more musical periods

### Stepping Rate vs Audio Sample Rate
- LFSRs step at a rate determined by frequency and decimation
- Frequency does NOT directly clock LFSRs (unlike POKEY)
- Decimation factor divides the stepping rate
- This separation allows smooth frequency control without affecting noise character

---

## Signal Flow and Operations

### 1. LFSR Generation
Each enabled LFSR generates a bitstream:
- Steps according to its polynomial and current state
- Outputs a single bit per step (0 or 1)
- Can be inverted before combination

### 2. Decimation
Decimation selectively samples LFSR outputs:
- **Purpose**: Create sub-audio-rate patterns for pitched noise
- **Mechanism**: Only every Nth sample is taken from the LFSR stream
- **Effect**: When decimation is high (e.g., ÷16), the pattern repeats at an audible rate, creating pitched noise
- **Interaction**: Decimation applies before combination, so each LFSR can have independent decimation (if supported)

### 3. Logical Combination (COMB)
The COMB field defines how LFSR outputs are combined:
- **XOR**: Exclusive OR - creates complex, uncorrelated noise
- **AND**: Logical AND - creates sparse, gated patterns
- **OR**: Logical OR - creates dense, filled patterns
- **Other operations**: May include NAND, NOR, XNOR, or more complex compositions

**Key Insight**: COMB replaces POKEY's channel coupling. Instead of one LFSR clocking another, we combine statistically independent bitstreams logically.

### 4. Shape Modulation (SHAPE)
Shape operations modify the combined noise using a carrier signal:

#### XOR_SQUARE
- **Operation**: XOR between carrier phase and noise phase
- **Effect**: Phase-destructive operation that creates hollow, nasal, metallic tones
- **Why "metallic"**: The phase cancellation creates spectral notches and resonances
- **Not accidental**: This is an explicit design choice for unique timbres

#### Other Shape Types
- Additional shape operations may include amplitude modulation, phase modulation, or other carrier-based effects
- SHAPE_PARAM provides fine control over these operations

### 5. Toggle Operation (TOGGLE)
Toggle is a deterministic polarity flip operation:
- **Not abstract modulation**: It's a specific, deterministic operation
- **Generalization of clocking**: Replaces "LFSR clocked by another LFSR" with a simpler mechanism
- **Periodic noise**: When combined with decimation, creates periodic noise without secondary clocks
- **Interaction with frequency**: Toggle rate may be tied to frequency or decimation factor

### 6. Output Generation
The final processed signal:
- Is a bitstream (0/1 or -1/+1)
- May be converted to audio samples (bit ? 1.0 : -1.0)
- Can be filtered, gain-controlled, or further processed
- Maintains deterministic behavior for reproducible results

---

## NoiseCode Field Semantics

### COMB Field
**Purpose**: Defines logical combination of LFSR outputs

**Values** (examples, exact encoding TBD):
- `0`: XOR (default, most common)
- `1`: AND
- `2`: OR
- `3`: NAND
- `4`: NOR
- `5`: XNOR
- `6+`: Reserved or custom operations

**Semantics**: 
- Combines enabled LFSR outputs using the specified logical operation
- Replaces POKEY's channel coupling mechanism
- Creates statistically independent or correlated noise depending on operation

### SHAPE Field
**Purpose**: Selects shape modulation type

**Values** (examples):
- `0`: None (pass-through)
- `1`: XOR_SQUARE (phase-destructive with square carrier)
- `2`: XOR_SINE (phase-destructive with sine carrier)
- `3+`: Other modulation types

**Semantics**:
- Modulates the combined noise using a carrier signal
- XOR_SQUARE creates metallic/hollow tones through phase cancellation
- Carrier frequency may be derived from the main frequency parameter

### SHAPE_PARAM Field
**Purpose**: Provides additional control for shape operations

**Semantics**:
- Interpretation depends on SHAPE type
- May control: carrier phase offset, modulation depth, carrier frequency multiplier
- Width depends on required precision for each shape type

### DECIM Field
**Purpose**: Controls decimation factor

**Values**: Typically 1-32 or similar range

**Semantics**:
- Divides the LFSR stepping rate
- Higher values create slower patterns (pitched noise)
- Lower values create faster, noisier patterns
- Applied before combination (affects all LFSRs uniformly, or per-LFSR if supported)

### LFSR Enable Bits (A_EN, B_EN, C_EN, D_EN)
**Purpose**: Enable/disable individual LFSRs

**Semantics**:
- `0`: LFSR does not contribute to output
- `1`: LFSR contributes to output
- At least one LFSR should be enabled for output

### LFSR Invert Bits (A_INV, B_INV, C_INV, D_INV)
**Purpose**: Invert LFSR output polarity

**Semantics**:
- `0`: Normal polarity (bit 0 → -1, bit 1 → +1)
- `1`: Inverted polarity (bit 0 → +1, bit 1 → -1)
- Applied before combination

### LFSR Polynomial Selectors (A_POLY, B_POLY, C_POLY, D_POLY)
**Purpose**: Select polynomial/tap configuration for each LFSR

**Semantics**:
- Index into a table of predefined polynomials
- Each polynomial defines tap positions and effective period
- Allows different LFSRs to have different characteristics
- Width depends on number of available polynomials (typically 4-8 bits)

---

## Sound Design Intent

This system is not a neutral DSP block - it is a **sound language** designed for specific aesthetic goals.

### Target Sound Categories

#### Engines
- Rhythmic, mechanical noise
- Combines multiple LFSRs with decimation
- Uses toggle for periodic elements
- COMB operations create complex, layered textures

#### Weapons
- Sharp, aggressive noise bursts
- High-frequency, uncorrelated LFSRs
- XOR_SQUARE for metallic impact sounds
- Sparse patterns via AND operations

#### Ambience
- Textural, background noise
- Slower decimation rates
- Multiple correlated LFSRs
- Subtle shape modulation

#### Glitches
- Chaotic, unpredictable patterns
- Fast LFSR stepping
- XOR combinations for maximum complexity
- Rapid toggle or shape changes

### Historical References
The system can reproduce sounds from:
- **Pitfall!**: Periodic noise patterns
- **Defender**: Engine and weapon sounds
- **Other classic games**: Any POKEY-based sound can be approximated

### Preset Philosophy
The 64-entry preset table provides:
- Curated starting points for common sounds
- Examples of effective parameter combinations
- Teaching tool for understanding the system
- Quick access to proven configurations

---

## Implementation Notes

### TypeScript Bitwise Behavior
- JavaScript/TypeScript bitwise operations work on 32-bit signed integers
- For LFSR operations, treat values as unsigned conceptually
- Use `>>>` (unsigned right shift) instead of `>>` (signed right shift) when appropriate
- Mask operations ensure values stay in 32-bit range: `value & 0xFFFFFFFF`

### Floating-Point Considerations
- LFSR state is maintained as integers (32-bit)
- Conversion to audio samples: `(bit ? 1.0 : -1.0)` or `(bit ? 0.5 : -0.5)`
- No precision loss expected (32-bit fits in 53-bit mantissa)
- Avoid floating-point operations in the LFSR stepping loop

### Determinism Guarantees
- LFSR state is fully deterministic given initial state and polynomial
- Same NoiseCode + frequency + initial state = same output
- Useful for reproducible sound effects
- Initial state can be seeded for variation

### AudioWorkletNode Structure
```typescript
// Main thread
const audioCtx = new AudioContext();
await audioCtx.audioWorklet.addModule('noise-processor.js');
const noiseNode = new AudioWorkletNode(audioCtx, 'noise-processor');

// In noise-processor.js (AudioWorkletGlobalScope)
class NoiseProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    // LFSR stepping and audio generation
    // Runs in real-time audio thread
  }
}
```

### Frequency Control
- Frequency parameter controls output sample rate, not LFSR clock rate directly
- Decimation factor divides the effective stepping rate
- Smooth frequency changes don't affect noise character (unlike POKEY)
- Frequency automation can create pitch sweeps in pitched noise modes

### Performance Considerations
- LFSR stepping is extremely fast (bit operations)
- Four LFSRs + combination logic is negligible CPU cost
- AudioWorkletNode ensures real-time performance
- No memory allocation in audio processing loop

---

## Worked Examples

### Example 1: Pitfall-Like Periodic Noise
**Goal**: Reproduce the periodic noise from Pitfall!

**Configuration**:
- Enable LFSR A only
- Use decimation factor of 16 (÷16)
- COMB: XOR (single LFSR, so no effect)
- SHAPE: None
- TOGGLE: Off
- Polynomial: Short period (e.g., 15-bit maximal)

**How it works**:
- LFSR A generates a repeating pattern
- Decimation ÷16 makes the pattern repeat at an audible rate
- The repeating pattern creates a pitched noise tone
- This approximates POKEY's "periodic noise" mode

### Example 2: Metallic Weapon Impact
**Goal**: Create a sharp, metallic impact sound

**Configuration**:
- Enable LFSRs A and B
- COMB: XOR (uncorrelated combination)
- SHAPE: XOR_SQUARE (phase-destructive)
- DECIM: 1 (no decimation, full noise)
- High-frequency setting

**How it works**:
- Two uncorrelated LFSRs create complex noise
- XOR_SQUARE introduces phase cancellation
- Phase cancellation creates spectral notches (metallic character)
- High frequency makes it sharp and percussive

### Example 3: Engine Rumble
**Goal**: Create a rhythmic, mechanical engine sound

**Configuration**:
- Enable LFSRs A, B, C
- COMB: XOR (complex layering)
- DECIM: 8 (moderate decimation for rhythm)
- TOGGLE: On, synchronized with decimation
- Lower frequency range

**How it works**:
- Multiple LFSRs create layered texture
- Decimation creates rhythmic patterns
- Toggle adds periodic emphasis
- Lower frequency makes it rumbly and mechanical

### Example 4: Sparse Glitch Pattern
**Goal**: Create sparse, gated noise bursts

**Configuration**:
- Enable LFSRs A and B
- COMB: AND (sparse combination)
- DECIM: 4 (some structure)
- SHAPE: None
- Medium frequency

**How it works**:
- AND operation only outputs 1 when both LFSRs are 1
- This creates sparse, gated patterns
- Decimation adds some rhythmic structure
- Result is glitchy, stuttering noise

---

## Preset System

### 64-Entry Preset Table
The system includes a table of 64 predefined NoiseCode values, each optimized for specific sound types.

### Preset Categories (inferred)
- **Engines** (multiple entries for different engine types)
- **Weapons** (impacts, lasers, explosions)
- **Ambience** (wind, static, background)
- **Glitches** (digital artifacts, errors)
- **Classic** (Pitfall, Defender, etc.)
- **Experimental** (unusual combinations)

### Preset Usage
- Presets serve as starting points
- Users can modify presets for variation
- Presets demonstrate effective parameter combinations
- Each preset should be explainable by the design document

### Preset Encoding
Each preset is a single NoiseCode value that can be:
- Stored compactly (single integer)
- Transmitted efficiently
- Reproduced deterministically
- Modified bitwise for variations

---

## Comparison with POKEY

### What POKEY Did
- Four channels with LFSR-based noise
- Clock coupling (one LFSR clocks another)
- High/low noise selection
- Hardware-specific tap configurations
- Fixed register sizes

### What This System Does Differently
1. **Logical Combination vs Clock Coupling**
   - POKEY: One LFSR's output clocks another LFSR
   - This system: LFSRs run independently, combined logically
   - Result: More flexible, can reproduce POKEY sounds plus new possibilities

2. **Decimation vs Clock Division**
   - POKEY: Clock division built into hardware
   - This system: Decimation as a separate, flexible parameter
   - Result: Smooth frequency control without affecting noise character

3. **Toggle vs Secondary Clocking**
   - POKEY: Periodic noise via secondary LFSR clocking
   - This system: Toggle operation for periodic effects
   - Result: Simpler mechanism, same expressive power

4. **Shape Modulation**
   - POKEY: No equivalent
   - This system: XOR_SQUARE and other shape operations
   - Result: Unique timbres not possible on POKEY

5. **32-Bit Standardization**
   - POKEY: Fixed register sizes
   - This system: Unified 32-bit with selectable polynomials
   - Result: More flexible periodicity control

### Why This Surpasses POKEY
- **More Expressive**: Can create sounds POKEY cannot
- **More Flexible**: Parameter control not limited by hardware
- **Reproducible**: Can still create classic POKEY sounds
- **Extensible**: New operations can be added
- **Deterministic**: Reproducible results for game audio

---

## Future Extensions

### Potential Enhancements
- Additional shape operations (beyond XOR_SQUARE)
- Per-LFSR decimation (currently uniform)
- LFSR synchronization options
- Filter integration (low-pass, high-pass)
- Envelope control (ADSR)
- Multiple output channels
- Modulation matrix

### Implementation Priorities
1. Core LFSR system with 32-bit registers
2. Basic COMB operations (XOR, AND, OR)
3. Decimation support
4. AudioWorkletNode integration
5. Preset system
6. Shape operations (XOR_SQUARE)
7. Toggle operation
8. Polish and optimization

---

## Conclusion

This noise synthesis system represents a modern evolution of classic PSG technology. By generalizing and extending the concepts from chips like the Atari POKEY, it provides a compact, expressive language for procedural sound generation. The system maintains compatibility with classic sounds while enabling new creative possibilities through logical combination, shape modulation, and flexible decimation.

The NoiseCode bitfield provides a compact representation of the entire synthesis configuration, making it suitable for storage, transmission, and real-time modification. The 64-entry preset table offers curated starting points for common sound types, while the underlying architecture supports unlimited creative exploration.

---

## Appendix: Key Design Decisions

### Why 32-Bit LFSRs?
- Single standardized width simplifies implementation
- User-selectable taps control periodicity, not register size
- Fits safely in JavaScript's Number type (53-bit mantissa)
- Avoids precision loss
- Signedness is irrelevant for bit operations

### Why AudioWorkletNode?
- Real-time audio thread (no main thread jitter)
- Sample-accurate processing
- Deterministic behavior
- VST-like performance characteristics

### Why Not PeriodicWave?
- PeriodicWave is static (coefficients can't change in real-time)
- LFSR noise is pseudorandom, not periodic in Fourier sense
- AudioWorkletNode allows sample-by-sample LFSR stepping
- True POKEY noise requires algorithmic generation

### Why Logical Combination?
- More flexible than hardware clock coupling
- Can reproduce POKEY sounds (XOR of independent LFSRs)
- Enables new operations (AND, OR, etc.)
- Statistically independent bitstreams provide rich possibilities

### Why XOR_SQUARE?
- Phase-destructive operation creates unique timbres
- Metallic/hollow character not possible with simple noise
- Generalizes carrier-based modulation concepts
- Explicit design choice for sound design palette

---

*This document captures the complete design intent and architectural decisions for the noise synthesis system. It should serve as the authoritative reference for implementation and future development.*

