# GRIT (Generative Random Iteration Tones) - Authoritative Design Document

## Table of Contents
1. [Design Goals and Non-Goals](#design-goals-and-non-goals)
2. [Voice Architecture](#voice-architecture)
3. [Primary LFSR Set](#primary-lfsr-set)
4. [NoiseCode Bitfield Structure](#noisecode-bitfield-structure)
5. [LFSR Selection and Combination](#lfsr-selection-and-combination)
6. [Clock Coupling Mechanism](#clock-coupling-mechanism)
7. [Signal Flow and Operations](#signal-flow-and-operations)
8. [Sound Design Intent](#sound-design-intent)
9. [Implementation Notes](#implementation-notes)
10. [Worked Examples](#worked-examples)
11. [Comparison with POKEY](#comparison-with-pokey)

---

## Design Goals and Non-Goals

**GRIT** (Generative Random Iteration Tones) is a noise synthesis system that generates procedural audio through LFSR-based bitstream manipulation and pulse wave conversion. GRIT represents **the ultimate evolution of POKEY**, taking the classic Atari POKEY chip's noise synthesis capabilities and extending them with modern flexibility and expressive power.

### Goals
- Create a noise synthesis system that surpasses classic PSG (Programmable Sound Generator) chips like the Atari POKEY
- Provide a compact, expressive language for procedural sound generation
- Enable reproduction of classic game sounds (Pitfall, Defender, etc.) while allowing new creative possibilities
- Support real-time audio generation suitable for engines, weapons, ambience, and glitch effects
- Maintain deterministic behavior for reproducible results
- Each voice defined by a single 32-bit NoiseCode plus frequency and ADSR envelope

### Non-Goals
- Not attempting to be a general-purpose synthesizer (focused on noise/chaotic sounds)
- Not emulating specific hardware exactly (rather, capturing and extending the spirit)

---

## Voice Architecture

Each GRIT voice is defined by three components:
1. **NoiseCode** (32-bit unsigned integer): Encodes the complete synthesis configuration
2. **Frequency** (float, Hz): Controls pitch/playback rate of the pulse waves
3. **ADSR Envelope** (4 floats): Attack, Decay, Sustain level, Release time

The NoiseCode determines the timbre and character; frequency controls pitch; ADSR controls amplitude over time.

### Signal Flow Overview
```
[Primary LFSR Selection] → [Clock Coupling] → [Decimation] → [Logical Combination (COMB)] → 
[Shape Modulation (SHAPE)] → [Pulse Wave Conversion] → [ADSR Envelope] → [Output]
```

---

## Primary LFSR Set

GRIT provides a set of **primary LFSRs** that can be selected and combined. Each primary LFSR is defined by its length and polynomial configuration.

### Primary LFSR Definitions

The primary LFSR set includes all classic POKEY LFSR configurations plus additional useful configurations:

**Polynomial 0: 1-bit Square Wave (50/50)**
- Length: 1 bit (special case)
- Pattern: Alternating 0/1
- Period: 2
- Characteristics: Pure square wave, 50% duty cycle, fundamental tone

**Polynomial 1: 25/75 Pulse Wave**
- Pattern: Repeating 1,0,0,0 (25% high, 75% low)
- Period: 4
- Characteristics: Fixed 25/75 duty cycle pulse wave, creates distinct harmonic character

**Polynomial 2: 4-bit Maximal (POKEY-style)**
- Length: 4 bits
- Polynomial: 1 + x^3 + x^4
- Period: 2^4 - 1 = 15
- Characteristics: Very short period, creates distinct pitched tones, classic POKEY configuration

**Polynomial 3: 5-bit Maximal (POKEY-style)**
- Length: 5 bits
- Polynomial: 1 + x^2 + x^5
- Period: 2^5 - 1 = 31
- Characteristics: Very short period, creates distinct pitched tones

**Polynomial 4: 9-bit Maximal (POKEY-style, also used in TIA)**
- Length: 9 bits
- Polynomial: 1 + x^4 + x^9
- Period: 2^9 - 1 = 511
- Characteristics: Short period, creates pitched/periodic noise

**Polynomial 5: 15-bit Maximal**
- Length: 15 bits
- Polynomial: 1 + x^14 + x^15
- Period: 2^15 - 1 = 32,767
- Characteristics: Medium period, good for rhythmic patterns

**Polynomial 6: 17-bit Maximal (POKEY-style)**
- Length: 17 bits
- Polynomial: 1 + x^12 + x^17
- Period: 2^17 - 1 = 131,071
- Characteristics: Classic POKEY noise, long period, rich spectrum

**Polynomial 7: 31-bit Maximal**
- Length: 31 bits
- Polynomial: 1 + x^28 + x^31
- Period: 2^31 - 1 = 2,147,483,647
- Characteristics: Very long period, white noise character

### LFSR Slots (A, B, C)

Each voice has **3 LFSR slots** (labeled A, B, C). Each slot can:
- Select one of the 8 primary LFSRs (via polynomial selector, 3 bits)
- Be enabled or disabled
- Have its output inverted
- Be clock-coupled to another LFSR

The slots are independent - each can select a different primary LFSR, allowing complex combinations.

---

## NoiseCode Bitfield Structure

The NoiseCode is a **32-bit unsigned integer** that encodes the entire synthesis configuration for a single voice.

### 32-Bit NoiseCode Layout

```
Bits 31-30: Reserved (2 bits) - for future expansion
Bits 29-27: DECIM - Decimation factor (3 bits, values 1-8, stored as 0-7, actual = value + 1)
Bits 26-24: SHAPE - Shape modulation type (3 bits, 0-7)
Bits 23-21: COMB - Logical combination operation (3 bits, 0-7)
Bits 20-18: LFSR C polynomial selector (3 bits, 0-7 = selects from 8 primary LFSRs)
Bits 17-15: LFSR B polynomial selector (3 bits, 0-7)
Bits 14-12: LFSR A polynomial selector (3 bits, 0-7)
Bits 11-10: Clock coupling (2 bits: C_CLK_B, B_CLK_A)
Bits 9-7:   LFSR invert flags (3 bits: C_INV, B_INV, A_INV)
Bits 6-4:   LFSR enable flags (3 bits: C_EN, B_EN, A_EN)
Bits 3-0:   Reserved (4 bits)
```

### Field Definitions

#### LFSR Enable Flags (Bits 6-4)
The enable flags control which LFSR slots are active and contribute to the output:
- **Bit 6**: LFSR C enable (1 = enabled, 0 = disabled)
- **Bit 5**: LFSR B enable (1 = enabled, 0 = disabled)
- **Bit 4**: LFSR A enable (1 = enabled, 0 = disabled)

**How Many LFSRs Can Be Active:**
- You can enable 1, 2, or all 3 LFSRs independently
- At least one LFSR must be enabled for output (otherwise there's no sound)
- Only enabled LFSRs contribute to the COMB operation
- Disabled LFSRs are completely inactive (they don't step, don't consume CPU)

**Examples:**
- `A_EN=1, B_EN=0, C_EN=0`: Only LFSR A is active (single LFSR, COMB has no effect)
- `A_EN=1, B_EN=1, C_EN=0`: LFSRs A and B are active (COMB applied to A and B)
- `A_EN=1, B_EN=1, C_EN=1`: All three LFSRs are active (COMB applied to A, B, and C)

#### LFSR Invert Flags (Bits 9-7)
- **Bit 9**: LFSR C invert
- **Bit 8**: LFSR B invert
- **Bit 7**: LFSR A invert
- When set, inverts the LFSR output before combination

#### Clock Coupling (Bits 11-10)
POKEY-style clock coupling: one LFSR can be clocked by another's output transitions.
- **Bit 11**: C_CLK_B - LFSR C clocked by LFSR B
- **Bit 10**: B_CLK_A - LFSR B clocked by LFSR A

**Clock Coupling Behavior:**
- When an LFSR is clock-coupled, it only steps when its clock source LFSR's output bit transitions (0→1 or 1→0)
- This creates periodic noise patterns similar to POKEY
- Clock coupling takes precedence over normal stepping

#### LFSR Polynomial Selectors (Bits 14-12, 17-15, 20-18)
Each LFSR slot selects from the 8 primary LFSRs (3 bits each):
- **Bits 14-12**: LFSR A polynomial selector (0-7)
- **Bits 17-15**: LFSR B polynomial selector (0-7)
- **Bits 20-18**: LFSR C polynomial selector (0-7)

**Mapping:**
- `0`: 1-bit Square Wave (50/50 duty cycle, pure square wave)
- `1`: 25/75 Pulse Wave (25% high, 75% low, fixed duty cycle)
- `2`: 4-bit Maximal (POKEY-style, period 15)
- `3`: 5-bit Maximal (POKEY-style, period 31)
- `4`: 9-bit Maximal (POKEY-style, also TIA, period 511)
- `5`: 15-bit Maximal (period 32,767)
- `6`: 17-bit Maximal (POKEY-style, period 131,071)
- `7`: 31-bit Maximal (period 2,147,483,647)

#### COMB - Logical Combination (Bits 23-21)
Defines how enabled LFSR outputs are combined:
- `0`: XOR (default, most common)
- `1`: AND
- `2`: OR
- `3`: NAND
- `4`: NOR
- `5`: XNOR
- `6`: Reserved
- `7`: Reserved

#### SHAPE - Shape Modulation (Bits 26-24)
Modulates the combined noise using a carrier signal:
- `0`: None (pass-through, no modulation)
- `1`: XOR_SQUARE - XOR with square wave carrier
- `2`: XOR_SINE - XOR with sine wave carrier
- `3`: XOR_TRIANGLE - XOR with triangle wave carrier
- `4`: XOR_SAW - XOR with sawtooth wave carrier
- `5`: AM - Amplitude modulation with sine carrier
- `6`: RING - Ring modulation (multiply with sine carrier)
- `7`: Reserved

#### DECIM - Decimation Factor (Bits 29-27)
Controls LFSR stepping rate (stored as 0-7, actual value = stored + 1):
- `0`: Decimation ÷1 (full rate)
- `1`: Decimation ÷2
- `2`: Decimation ÷3
- ...
- `7`: Decimation ÷8

Higher decimation = slower stepping = slower patterns (pitched noise)
Lower decimation = faster stepping = faster, noisier patterns

### Bit Extraction Helpers

```typescript
// Example bit extraction (TypeScript)
const A_EN = (noiseCode >> 4) & 1;
const B_EN = (noiseCode >> 5) & 1;
const C_EN = (noiseCode >> 6) & 1;

const A_INV = (noiseCode >> 7) & 1;
const B_INV = (noiseCode >> 8) & 1;
const C_INV = (noiseCode >> 9) & 1;

const B_CLK_A = (noiseCode >> 10) & 1;
const C_CLK_B = (noiseCode >> 11) & 1;

const A_POLY = (noiseCode >> 12) & 7;
const B_POLY = (noiseCode >> 15) & 7;
const C_POLY = (noiseCode >> 18) & 7;

const COMB = (noiseCode >> 21) & 7;
const SHAPE = (noiseCode >> 24) & 7;
const DECIM = ((noiseCode >> 27) & 7) + 1; // +1 to get actual decimation value
```

---

## LFSR Selection and Combination

### Selection Process

1. **Polynomial Selection**: Each of the 3 slots (A, B, C) selects one of the 8 primary LFSRs via its polynomial selector
2. **Enable/Disable**: Each slot can be enabled or disabled independently
3. **Inversion**: Each enabled slot's output can be inverted before combination

### Combination Methods

GRIT provides two complementary mechanisms for combining LFSRs:

#### Method 1: Logical Combination (COMB field)
The COMB field defines how enabled LFSR outputs are combined using bitwise logical operations.

**Operation Details:**
- COMB is applied to all enabled LFSRs simultaneously, bit-by-bit
- With 1 LFSR enabled: Output = that LFSR (COMB has no effect)
- With 2 LFSRs enabled: Output = COMB(A, B) for each bit
- With 3 LFSRs enabled: Output = COMB(COMB(A, B), C) for each bit (left-associative)

**Available Operations:**
- **XOR** (0): Exclusive OR - creates complex, uncorrelated noise (most common)
- **AND** (1): Logical AND - creates sparse, gated patterns
- **OR** (2): Logical OR - creates dense, filled patterns
- **NAND** (3): Negated AND - inverts AND result, different spectral character than AND
- **NOR** (4): Negated OR - inverts OR result, different spectral character than OR
- **XNOR** (5): Exclusive NOR - inverts XOR result, different spectral character than XOR

**Why Inverted Operators Sound Different:**
Inverted operators (NAND, NOR, XNOR) produce different timbres than their non-inverted counterparts:
- **NAND** inverts the AND result, creating denser patterns (opposite of AND's sparsity)
- **NOR** inverts the OR result, creating sparser patterns (opposite of OR's density)
- **XNOR** inverts the XOR result, creating correlated patterns (opposite of XOR's uncorrelation)
- These create distinct duty cycles and spectral characteristics that cannot be achieved by simply inverting inputs

**Purpose**: Logical combination determines HOW bitstreams are merged (logical relationship).

#### Method 2: Clock Coupling (POKEY-style)
Clock coupling creates timing relationships between LFSRs:
- One LFSR's output transitions clock another LFSR
- This creates periodic noise patterns
- Clock coupling works alongside logical combination - the clock-coupled LFSR still contributes to the COMB operation

**Purpose**: Clock coupling determines WHEN an LFSR steps (temporal relationship).

**Why Separate from COMB?**
Clock coupling and logical combination operate at different levels:
- **Clock coupling** is a **temporal** operation - it controls when an LFSR steps (timing)
- **COMB** is a **logical** operation - it controls how outputs are combined (logic)

These are fundamentally different operations that work together:
1. Clock coupling determines the stepping pattern (temporal)
2. COMB determines how the resulting bitstreams are merged (logical)

**Example**: If B_CLK_A is enabled:
- LFSR B only steps when LFSR A's output transitions (0→1 or 1→0) - **temporal relationship**
- LFSR B's output is still combined with other enabled LFSRs via COMB - **logical relationship**
- This creates periodic patterns based on LFSR A's behavior, then logically combined

#### Combining Both Methods
Clock coupling and logical combination work together:
1. LFSRs step according to their clock coupling configuration (temporal)
2. Enabled LFSR outputs are combined using the COMB operation (logical)
3. The combined result is shaped by SHAPE modulation (if enabled)

This allows complex interactions: clock coupling creates timing relationships, while COMB creates logical relationships.

---

## Clock Coupling Mechanism

### POKEY's Clock Coupling

POKEY allowed one LFSR to be clocked by another LFSR's output. When an LFSR is clock-coupled:
- It only steps when its clock source's output bit transitions (0→1 or 1→0)
- This creates periodic noise patterns because the clock source's pattern determines when the coupled LFSR steps
- The coupled LFSR's output is still used in the final audio output

**POKEY Example**: If channel B is clocked by channel A:
- Channel B's LFSR only steps when channel A's LFSR output changes
- This creates periodic noise that repeats based on channel A's pattern
- Both channels contribute to the audio output

### GRIT's Clock Coupling

GRIT replicates POKEY's clock coupling mechanism with additional flexibility:

**Available Clock Couplings:**
- **B_CLK_A**: LFSR B clocked by LFSR A
- **C_CLK_B**: LFSR C clocked by LFSR B
- **D_CLK_C**: LFSR D clocked by LFSR C
- **D_CLK_A**: LFSR D clocked by LFSR A

**Behavior:**
- When clock coupling is enabled, the target LFSR only steps on transitions of its clock source
- Clock coupling takes precedence over normal stepping (decimation-based stepping)
- Multiple clock couplings can be enabled simultaneously
- Clock-coupled LFSRs still contribute to the COMB operation

**Key Difference from POKEY:**
- POKEY: Clock coupling was the primary way to create periodic noise
- GRIT: Clock coupling works alongside logical combination (COMB), allowing both timing and logical relationships

---

## Signal Flow and Operations

### 1. LFSR Selection and Generation
Each of the 3 slots (A, B, C):
- Selects one of the 8 primary LFSRs based on its polynomial selector
- Generates a bitstream according to its LFSR's characteristics
- Can be enabled or disabled
- Can have its output inverted

### 2. Clock Coupling
Clock-coupled LFSRs:
- Step only when their clock source's output transitions (0→1 or 1→0)
- Create periodic noise patterns based on the clock source's behavior
- Still contribute their output to the combination stage

Independent LFSRs:
- Step at `audio_sample_rate / decimation_factor`
- Generate continuous bitstreams

### 3. Decimation
Decimation divides the stepping rate for independent LFSRs:
- **Purpose**: Create sub-audio-rate patterns for pitched noise
- **Mechanism**: Independent LFSRs step at `audio_sample_rate / decimation_factor` (where decimation = 1-8)
- **Effect**: When decimation is high (e.g., ÷8), patterns repeat at audible rates, creating pitched noise
- **Applied to**: Independent LFSRs only (clock-coupled LFSRs inherit timing from their clock source)
- **Key Difference from POKEY**: Decoupled from frequency control - can change pitch without changing noise character

### 4. Logical Combination (COMB)
The COMB field defines how enabled LFSR outputs are combined using bitwise logical operations.

**How COMB Works:**
COMB is applied to all enabled LFSRs simultaneously. The operation is applied bit-by-bit across the enabled LFSR outputs:
- If 1 LFSR is enabled: Output = that LFSR's bitstream (COMB has no effect)
- If 2 LFSRs are enabled: Output = COMB(A, B) applied bitwise
- If 3 LFSRs are enabled: Output = COMB(COMB(A, B), C) applied bitwise (left-associative)

**Example with 3 enabled LFSRs (A, B, C) and XOR:**
- For each sample: `output = A XOR B XOR C`
- This is equivalent to: `output = (A XOR B) XOR C`

**COMB Operations:**
- **XOR** (0): Exclusive OR - creates complex, uncorrelated noise (most common)
  - With 2 LFSRs: Output is 1 when inputs differ
  - With 3 LFSRs: Output is 1 when odd number of inputs are 1
- **AND** (1): Logical AND - creates sparse, gated patterns
  - With 2 LFSRs: Output is 1 only when both are 1
  - With 3 LFSRs: Output is 1 only when all three are 1
- **OR** (2): Logical OR - creates dense, filled patterns
  - With 2 LFSRs: Output is 1 when either is 1
  - With 3 LFSRs: Output is 1 when any are 1
- **NAND** (3): Negated AND - inverted AND pattern
  - With 2 LFSRs: Output is 0 only when both are 1 (inverse of AND)
  - Creates different spectral characteristics than AND due to different duty cycle
- **NOR** (4): Negated OR - inverted OR pattern
  - With 2 LFSRs: Output is 0 when either is 1 (inverse of OR)
  - Creates different spectral characteristics than OR
- **XNOR** (5): Exclusive NOR - inverted XOR pattern
  - With 2 LFSRs: Output is 1 when inputs are the same (inverse of XOR)
  - Creates different spectral characteristics than XOR

**Why Include Inverted Operators?**
While invert flags can flip individual LFSR inputs, the inverted operators (NAND, NOR, XNOR) produce different results:
- **NAND(A, B)** ≠ **AND(NOT(A), NOT(B))** (which equals NOR(A, B) by De Morgan's law)
- **NAND** inverts the AND result, creating different duty cycles and spectral content
- The inverted operators provide direct access to complementary patterns without needing to invert all inputs
- They create distinct timbres: NAND produces denser patterns than AND, NOR produces sparser patterns than OR

**Key Insight**: COMB works alongside clock coupling. Clock coupling creates timing relationships; COMB creates logical relationships between bitstreams.

### 5. Shape Modulation (SHAPE)
Shape operations modify the combined noise using a carrier signal. The carrier frequency is derived from the voice frequency parameter.

#### None (0)
- **Operation**: Pass-through, no modulation
- **Effect**: Combined noise output unchanged
- **Use cases**: When no shape modulation is desired

#### XOR_SQUARE (1)
- **Operation**: XOR between noise bitstream and square wave carrier
- **Effect**: Creates hollow, nasal, metallic tones with spectral notches
- **Use cases**: Metallic weapon impacts, hollow percussive sounds, unique textural effects

#### XOR_SINE (2)
- **Operation**: XOR between noise bitstream and sine wave carrier
- **Effect**: Softer modulation than XOR_SQUARE, creates smoother metallic tones
- **Use cases**: Softer metallic textures, smoother modulated noise

#### XOR_TRIANGLE (3)
- **Operation**: XOR between noise bitstream and triangle wave carrier
- **Effect**: Moderate modulation character between square and sine
- **Use cases**: Varied metallic textures, intermediate modulation character

#### XOR_SAW (4)
- **Operation**: XOR between noise bitstream and sawtooth wave carrier
- **Effect**: Asymmetric modulation with distinct harmonic character
- **Use cases**: Unique textural effects, asymmetric modulation patterns

#### AM (5)
- **Operation**: Amplitude modulation - noise multiplied by sine carrier (0-1 range)
- **Effect**: Tremolo-like effect, creates rhythmic amplitude variation
- **Use cases**: Rhythmic textures, tremolo effects, amplitude-based modulation

#### RING (6)
- **Operation**: Ring modulation - noise multiplied by sine carrier (bipolar)
- **Effect**: Creates sum and difference frequencies, metallic bell-like tones
- **Use cases**: Metallic bell sounds, frequency-shifted textures, ring mod effects

### 6. Pulse Wave Conversion
The final processed signal:
- Starts as a bitstream (0/1) from the LFSR combination and shaping operations
- **Is converted to pulse waves**: Each bit becomes an audio sample
  - `bit === 1` → `+1.0`
  - `bit === 0` → `-1.0`
- Duty cycle is determined by the selected LFSR:
  - **1-bit Square Wave (polynomial 0)**: Fixed 50/50 duty cycle (alternating pattern)
  - **25/75 Pulse Wave (polynomial 1)**: Fixed 25/75 duty cycle (repeating 1,0,0,0 pattern)
  - **All other LFSRs**: Duty cycle determined by the LFSR bitstream pattern
- Frequency parameter controls the playback rate of these pulse waves (pitch)
- Maintains deterministic behavior for reproducible results

**Important**: We are generating pulse waves, not using frequency dividers. The pulse wave rate (frequency) is independent from the LFSR stepping rate (decimation). Fixed duty cycle LFSRs (1-bit square, 25/75 pulse) enable pure tones and predictable waveforms, while other LFSRs preserve their natural duty cycle patterns.

### 7. ADSR Envelope
Amplitude control over time (applied after pulse wave conversion):
- **Attack**: Time to reach full amplitude from zero
- **Decay**: Time to fall from full amplitude to sustain level
- **Sustain**: Level to hold after decay (0.0 to 1.0)
- **Release**: Time to fall from sustain level to zero

The envelope multiplies the pulse wave output, enabling percussive sounds, sustained tones, and smooth fade-outs.

**Default Envelope Presets:**
| Preset | Attack | Decay | Sustain | Release | Use Case |
|--------|--------|-------|---------|---------|----------|
| Percussive | 0.001s | 0.1s | 0.0 | 0.1s | Drums, hits, short impacts |
| Sustained | 0.01s | 0.1s | 0.7 | 0.2s | Melodic instruments, leads |
| Pad | 0.5s | 0.2s | 0.8 | 1.0s | Ambient textures, backgrounds |
| Pluck | 0.005s | 0.15s | 0.3 | 0.15s | Plucky sounds, staccato, game SFX |

### 8. Effects (Reverb/Delay)
Post-processing effects applied to the final output:
- **Reverb**: Spatial depth and room simulation
- **Delay**: Echo and feedback effects
- Effects are applied per-voice or globally (implementation detail)
- Effects parameters are separate from NoiseCode (not encoded in the 32-bit format)

---

## Sound Design Intent

GRIT is not a neutral DSP block - it is a **sound language** designed for specific aesthetic goals.

### Target Sound Categories

#### Engines
- Rhythmic, mechanical noise
- Combines multiple LFSRs with decimation
- Uses clock coupling for periodic elements
- COMB operations create complex, layered textures

#### Weapons
- Sharp, aggressive noise bursts
- High-frequency, uncorrelated LFSRs
- Shape modulation (XOR_SQUARE, RING) for metallic impact sounds
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
- Rapid clock coupling or shape changes

### Historical References
GRIT can reproduce sounds from:
- **Pitfall!**: Periodic noise patterns
- **Defender**: Engine and weapon sounds
- **Other classic games**: Any POKEY-based sound can be approximated

---

## Implementation Notes

### LFSR Implementation
- Each primary LFSR is implemented according to its polynomial definition
- LFSR state is maintained as integers
- Stepping is deterministic given initial state and polynomial
- Use `>>>` (unsigned right shift) for bit operations in TypeScript

### Pulse Wave Generation
- Each LFSR bit (0 or 1) is converted to a pulse wave sample: `(bit === 1) ? +1.0 : -1.0`
- Frequency parameter controls the playback rate of these pulse waves (pitch)
- Decimation factor controls LFSR stepping rate (how often bits are generated)
- These are decoupled - can change pitch without affecting noise character

### Determinism Guarantees
- LFSR state is fully deterministic given initial state and polynomial
- Same NoiseCode + frequency + initial state = same output
- Useful for reproducible sound effects
- Initial state can be seeded for variation

### AudioWorkletNode
- Runs in a dedicated real-time audio thread (AudioWorkletGlobalScope)
- Avoids JavaScript timing jitter from the main thread
- Enables sample-accurate LFSR stepping
- Provides deterministic, reproducible audio generation
- Similar performance characteristics to VST plugin process loops
- Allows sample-by-sample processing required for LFSR-based noise generation

### Frequency Control
- Frequency parameter controls **pulse wave playback rate** (pitch), not LFSR stepping rate
- The LFSR bitstream is converted to pulse waves: `(bit ? +1.0 : -1.0)`
- Frequency determines how fast these pulse wave samples are played back
- Decimation factor controls LFSR stepping rate (how often bits are generated)
- Smooth frequency changes don't affect noise character (unlike POKEY)
- Frequency automation can create pitch sweeps in pitched noise modes
- **We are not using frequency dividers** - we generate pulse waves directly from bitstreams

### Performance Considerations
- LFSR stepping is extremely fast (bit operations)
- Three LFSR slots + combination logic is negligible CPU cost
- AudioWorkletNode ensures real-time performance
- No memory allocation in audio processing loop

---

## Worked Examples

### Example 1: Pitfall-Like Periodic Noise
**Goal**: Reproduce the periodic noise from Pitfall!

**Configuration:**
- Enable LFSR A only
- LFSR A: 9-bit Maximal (polynomial 4)
- Use decimation factor of 8 (÷8)
- COMB: XOR (single LFSR, so no effect)
- SHAPE: None
- No clock coupling

**How it works:**
- LFSR A (9-bit) generates a repeating pattern with period 511
- Decimation ÷8 makes the pattern repeat at an audible rate
- The repeating pattern creates a pitched noise tone
- This approximates POKEY's "periodic noise" mode

### Example 2: Metallic Weapon Impact
**Goal**: Create a sharp, metallic impact sound

**Configuration:**
- Enable LFSRs A and B
- LFSR A: 17-bit Maximal (polynomial 6)
- LFSR B: 17-bit Maximal (polynomial 6)
- COMB: XOR (uncorrelated combination)
- SHAPE: XOR_SQUARE
- DECIM: 1 (no decimation, full noise)
- High-frequency setting

**How it works:**
- Two uncorrelated 17-bit LFSRs create complex noise
- XOR_SQUARE introduces phase cancellation
- Phase cancellation creates spectral notches (metallic character)
- High frequency makes it sharp and percussive

### Example 3: Engine Rumble (POKEY-style)
**Goal**: Create a rhythmic, mechanical engine sound using clock coupling

**Configuration:**
- Enable LFSRs A, B, C
- LFSR A: 17-bit Maximal (polynomial 6)
- LFSR B: 9-bit Maximal (polynomial 4)
- LFSR C: 4-bit Maximal (polynomial 2)
- COMB: XOR (complex layering)
- DECIM: 8 (moderate decimation for rhythm)
- Clock coupling: C_CLK_B enabled (C clocked by B)
- Lower frequency range

**How it works:**
- LFSR A runs independently with decimation
- LFSR B runs independently with decimation
- LFSR C is clocked by LFSR B's transitions, creating periodic patterns
- XOR combination creates complex, layered texture
- Clock coupling adds rhythmic emphasis based on B's pattern
- Lower frequency makes it rumbly and mechanical

### Example 4: Pure Square Wave
**Goal**: Create a pure square wave tone

**Configuration:**
- Enable LFSR A only
- LFSR A: 1-bit Square Wave (polynomial 0)
- COMB: XOR (single LFSR, so no effect - COMB only matters with multiple LFSRs)
- SHAPE: None
- DECIM: 1 (full rate)
- No clock coupling

**How it works:**
- 1-bit Square Wave LFSR produces alternating 0/1 pattern (period 2)
- Fixed 50/50 duty cycle ensures symmetric square wave
- Each bit converts to pulse wave: `1 → +1.0`, `0 → -1.0`
- Frequency parameter controls playback rate (pitch)
- Result is a pure square wave tone at the specified frequency
- Useful for creating fundamental tones, testing, and as a building block for more complex sounds

**Pure Tone Generation:**
GRIT supports pure tones through:
1. **1-bit Square Wave (polynomial 0)**: Pure square wave, 50% duty cycle
2. **25/75 Pulse Wave (polynomial 1)**: Pure pulse wave, 25% duty cycle
3. **Short-period LFSRs with high decimation**: Creates pitched tones from repeating patterns
   - Example: 4-bit LFSR (period 15) with decimation ÷8 creates a pitched tone

### Example 5: Sparse Glitch Pattern
**Goal**: Create sparse, gated noise bursts

**Configuration:**
- Enable LFSRs A and B
- LFSR A: 17-bit Maximal (polynomial 6)
- LFSR B: 17-bit Maximal (polynomial 6)
- COMB: AND (sparse combination)
- DECIM: 4 (some structure)
- SHAPE: None
- Medium frequency

**How it works:**
- AND operation only outputs 1 when both LFSRs are 1
- This creates sparse, gated patterns
- Decimation adds some rhythmic structure
- Result is glitchy, stuttering noise

---

## Preset System

GRIT includes a comprehensive set of **128 presets** optimized for retro music instruments and sound effects. Each preset is a single 32-bit NoiseCode value that can be used directly or modified for variation.

### Preset Categories

The 128 presets are organized into the following categories:

1. **Pure Tones** (Presets 0-15): Square waves, pulse waves, and fundamental tones
2. **Bass Instruments** (Presets 16-31): Deep, low-frequency sounds for basslines
3. **Lead Instruments** (Presets 32-47): Melodic lead sounds and arpeggios
4. **Drums & Percussion** (Presets 48-63): Kick drums, snares, hi-hats, and percussion
5. **Classic Game Sounds** (Presets 64-79): Pitfall, Defender, and other classic game sounds
6. **Engines & Motors** (Presets 80-95): Rhythmic mechanical sounds
7. **Weapons & Impacts** (Presets 96-111): Sharp, aggressive sounds for impacts and weapons
8. **Ambience & Textures** (Presets 112-127): Background textures and atmospheric sounds

### Preset Table

Each preset entry includes:
- **Preset Number**: Index (0-127)
- **Name**: Descriptive name
- **NoiseCode**: 32-bit value (hexadecimal)
- **Configuration**: Brief description of LFSR setup

**Note**: For a complete preset reference with all 128 presets and detailed configurations, see the [GRIT Preset Reference](grit-presets.md) document.

#### Pure Tones (0-15)

| #  | Name              | NoiseCode    | Configuration                           |
|----|-------------------|--------------|-----------------------------------------|
| 0  | Pure Square 50/50 | `0x00000010` | A=1-bit square (0), enabled only        |
| 1  | Pure Pulse 25/75  | `0x00000020` | A=25/75 pulse (1), enabled only         |
| 2  | Square Decim 2    | `0x08000010` | A=1-bit square (0), decim ÷2            |
| 3  | Square Decim 4    | `0x10000010` | A=1-bit square (0), decim ÷4            |
| 4  | Square Decim 8    | `0x38000010` | A=1-bit square (0), decim ÷8            |
| 5  | Pulse Decim 2     | `0x08000020` | A=25/75 pulse (1), decim ÷2             |
| 6  | Pulse Decim 4     | `0x10000020` | A=25/75 pulse (1), decim ÷4             |
| 7  | 4-bit Tone        | `0x00001010` | A=4-bit (2), enabled only               |
| 8  | 5-bit Tone        | `0x00001810` | A=5-bit (3), enabled only               |
| 9  | 9-bit Tone        | `0x00002010` | A=9-bit (4), enabled only               |
| 10 | 9-bit Decim 8     | `0x38002010` | A=9-bit (4), decim ÷8 (Pitfall! style)  |
| 11 | Square AM         | `0x08000010` | A=1-bit square (0), SHAPE=AM (5)        |
| 12 | Pulse AM          | `0x08000020` | A=25/75 pulse (1), SHAPE=AM (5)         |
| 13 | Square Ring       | `0x18000010` | A=1-bit square (0), SHAPE=RING (6)      |
| 14 | Pulse Ring        | `0x18000020` | A=25/75 pulse (1), SHAPE=RING (6)       |
| 15 | Pitfall Tone      | `0x38002010` | A=9-bit (4), decim ÷8, classic Pitfall! |

#### Bass Instruments (16-31)

| #  | Name           | NoiseCode    | Configuration                              |
|----|----------------|--------------|--------------------------------------------|
| 16 | Deep Bass      | `0x00000010` | A=1-bit square (0), use 60-200 Hz          |
| 17 | Bass Pulse     | `0x00000020` | A=25/75 pulse (1), use 60-200 Hz           |
| 18 | Sub Bass       | `0x00001010` | A=4-bit (2), sub-bass texture              |
| 19 | Bass Rumble    | `0x38002010` | A=9-bit (4), decim ÷8, rumbly              |
| 20 | Bass Layer     | `0x00003010` | A=1-bit (0), B=1-bit (0), XOR              |
| 21 | Bass Clock     | `0x00002040` | A=9-bit (4), B=4-bit (2), B_CLK_A, XOR     |
| 22 | Deep Pulse     | `0x10000020` | A=25/75 pulse (1), decim ÷4                |
| 23 | Bass Texture   | `0x00004010` | A=1-bit (0), B=1-bit (0), C=1-bit (0), XOR |
| 24 | Bass Complex   | `0x00005010` | A=1-bit (0), B=1-bit (0), AND              |
| 25 | Bass Warm      | `0x00006010` | A=1-bit (0), B=1-bit (0), OR               |
| 26 | Bass Metallic  | `0x08000010` | A=1-bit square (0), SHAPE=XOR_SQUARE (1)   |
| 27 | Bass Bell      | `0x18000010` | A=1-bit square (0), SHAPE=RING (6)         |
| 28 | Bass Sync      | `0x00002040` | A=9-bit (4), B=4-bit (2), clock-coupled    |
| 29 | Bass Classic   | `0x38002010` | A=9-bit (4), decim ÷8, classic POKEY       |
| 30 | Bass Variant 1 | `0x10001010` | A=4-bit (2), decim ÷4                      |
| 31 | Bass Variant 2 | `0x10001810` | A=5-bit (3), decim ÷4                      |

#### Lead Instruments (32-47)

| #  | Name          | NoiseCode    | Configuration                              |
|----|---------------|--------------|--------------------------------------------|
| 32 | Lead Square   | `0x00000010` | A=1-bit square (0), bright lead            |
| 33 | Lead Pulse    | `0x00000020` | A=25/75 pulse (1), punchy lead             |
| 34 | Lead Layered  | `0x00003010` | A=1-bit (0), B=1-bit (0), XOR              |
| 35 | Lead Arp      | `0x00002010` | A=9-bit (4), arpeggio-like                 |
| 36 | Lead Bright   | `0x00004010` | A=1-bit (0), B=1-bit (0), C=1-bit (0), XOR |
| 37 | Lead Warm     | `0x00006010` | A=1-bit (0), B=1-bit (0), OR               |
| 38 | Lead Metallic | `0x08000010` | A=1-bit square (0), SHAPE=XOR_SQUARE (1)   |
| 39 | Lead Bell     | `0x18000010` | A=1-bit square (0), SHAPE=RING (6)         |
| 40 | Lead Sync     | `0x00002040` | A=9-bit (4), B=4-bit (2), clock-coupled    |
| 41 | Lead Complex  | `0x00005010` | A=1-bit (0), B=1-bit (0), AND              |
| 42 | Lead Glitch   | `0x00009010` | A=1-bit (0), B=1-bit (0), NAND             |
| 43 | Lead Sweep    | `0x00002010` | A=9-bit (4), good for sweeps               |
| 44 | Lead Classic  | `0x38002010` | A=9-bit (4), decim ÷8, classic             |
| 45 | Lead Ambient  | `0x00008010` | A=1-bit (0), B=1-bit (0), NOR              |
| 46 | Lead Impact   | `0x0000A010` | A=1-bit (0), B=1-bit (0), XNOR             |
| 47 | Lead Variant  | `0x10000010` | A=1-bit square (0), decim ÷4               |

#### Drums & Percussion (48-63)

| #  | Name          | NoiseCode    | Configuration                               |
|----|---------------|--------------|---------------------------------------------|
| 48 | Kick Deep     | `0x00001010` | A=4-bit (2), deep kick, use 40-80 Hz        |
| 49 | Kick Punch    | `0x00001810` | A=5-bit (3), punchy kick, use 50-100 Hz     |
| 50 | Kick Classic  | `0x00002010` | A=9-bit (4), classic kick, use 60-120 Hz    |
| 51 | Snare Sharp   | `0x00003010` | A=1-bit (0), B=1-bit (0), XOR, sharp        |
| 52 | Snare Classic | `0x00004010` | A=1-bit (0), B=1-bit (0), C=1-bit (0), XOR  |
| 53 | HiHat Closed  | `0x00005010` | A=1-bit (0), B=1-bit (0), AND, sparse       |
| 54 | HiHat Open    | `0x00006010` | A=1-bit (0), B=1-bit (0), OR, dense         |
| 55 | Crash         | `0x00007010` | A=1-bit (0), B=1-bit (0), C=1-bit (0), NAND |
| 56 | Tom Low       | `0x00001010` | A=4-bit (2), low tom, use 80-150 Hz         |
| 57 | Tom Mid       | `0x00001810` | A=5-bit (3), mid tom, use 100-200 Hz        |
| 58 | Tom High      | `0x00002010` | A=9-bit (4), high tom, use 150-300 Hz       |
| 59 | Clap          | `0x00003010` | A=1-bit (0), B=1-bit (0), XOR, clap texture |
| 60 | Rimshot       | `0x00004010` | A=1-bit (0), B=1-bit (0), C=1-bit (0), XOR  |
| 61 | Shaker        | `0x00005010` | A=1-bit (0), B=1-bit (0), AND, sparse       |
| 62 | Tambourine    | `0x00006010` | A=1-bit (0), B=1-bit (0), OR, dense         |
| 63 | Perc Glitch   | `0x00009010` | A=1-bit (0), B=1-bit (0), NAND, glitchy     |

#### Classic Game Sounds (64-79)

| #  | Name            | NoiseCode    | Configuration                                     |
|----|-----------------|--------------|---------------------------------------------------|
| 64 | Pitfall!        | `0x38002010` | A=9-bit (4), decim ÷8, classic Pitfall!           |
| 65 | Pitfall Variant | `0x10002010` | A=9-bit (4), decim ÷4, variant                    |
| 66 | Defender Engine | `0x00003040` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR           |
| 67 | Defender Weapon | `0x08004010` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE |
| 68 | POKEY Classic   | `0x00002010` | A=9-bit (4), classic POKEY tone                   |
| 69 | POKEY Noise     | `0x00004010` | A=17-bit (6), B=17-bit (6), XOR                   |
| 70 | POKEY Tone      | `0x00001010` | A=4-bit (2), POKEY-style tone                     |
| 71 | TIA Sound       | `0x00002010` | A=9-bit (4), TIA-style sound                      |
| 72 | Game Beep       | `0x00000010` | A=1-bit square (0), classic beep                  |
| 73 | Game Blip       | `0x00000020` | A=25/75 pulse (1), classic blip                   |
| 74 | Game Zap        | `0x08000010` | A=1-bit square (0), SHAPE=XOR_SQUARE              |
| 75 | Game Powerup    | `0x00002010` | A=9-bit (4), powerup sound                        |
| 76 | Game Coin       | `0x00001810` | A=5-bit (3), coin collection                      |
| 77 | Game Jump       | `0x00001010` | A=4-bit (2), jump sound                           |
| 78 | Game Explosion  | `0x00004010` | A=17-bit (6), B=17-bit (6), XOR, explosion        |
| 79 | Game Victory    | `0x00003010` | A=1-bit (0), B=1-bit (0), XOR, victory fanfare    |

#### Engines & Motors (80-95)

| #  | Name             | NoiseCode    | Configuration                                                           |
|----|------------------|--------------|-------------------------------------------------------------------------|
| 80 | Engine Rumble    | `0x38003040` | A=17-bit (6), B=9-bit (4), C=4-bit (2), B_CLK_A, C_CLK_B, XOR, decim ÷8 |
| 81 | Engine Idle      | `0x00003040` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR                                 |
| 82 | Engine Rev       | `0x10003040` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR, decim ÷4                       |
| 83 | Motor Hum        | `0x00004010` | A=17-bit (6), B=17-bit (6), XOR                                         |
| 84 | Motor Fast       | `0x00005010` | A=17-bit (6), B=17-bit (6), AND                                         |
| 85 | Motor Slow       | `0x38004010` | A=17-bit (6), B=17-bit (6), XOR, decim ÷8                               |
| 86 | Engine Complex   | `0x00006010` | A=17-bit (6), B=17-bit (6), OR                                          |
| 87 | Engine Layered   | `0x00007010` | A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR                           |
| 88 | Engine Metallic  | `0x08004010` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE                       |
| 89 | Engine Classic   | `0x38002010` | A=9-bit (4), decim ÷8, classic style                                    |
| 90 | Motor Rhythmic   | `0x00002040` | A=9-bit (4), B=4-bit (2), B_CLK_A, XOR                                  |
| 91 | Engine Sync      | `0x00003040` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR                                 |
| 92 | Motor Texture    | `0x00005010` | A=17-bit (6), B=17-bit (6), AND                                         |
| 93 | Engine Variant 1 | `0x10003040` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR, decim ÷4                       |
| 94 | Engine Variant 2 | `0x20003040` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR, decim ÷5                       |
| 95 | Engine Glitch    | `0x00009010` | A=17-bit (6), B=17-bit (6), NAND                                        |

#### Weapons & Impacts (96-111)

| #   | Name             | NoiseCode    | Configuration                                     |
|-----|------------------|--------------|---------------------------------------------------|
| 96  | Metallic Impact  | `0x08004010` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE |
| 97  | Weapon Laser     | `0x00004010` | A=17-bit (6), B=17-bit (6), XOR, sharp            |
| 98  | Weapon Blast     | `0x00005010` | A=17-bit (6), B=17-bit (6), AND, sparse           |
| 99  | Impact Sharp     | `0x08004010` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE |
| 100 | Impact Deep      | `0x00006010` | A=17-bit (6), B=17-bit (6), OR, dense             |
| 101 | Weapon Zap       | `0x18004010` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=RING       |
| 102 | Weapon Beam      | `0x00007010` | A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR     |
| 103 | Impact Metallic  | `0x08004010` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE |
| 104 | Weapon Classic   | `0x00004010` | A=17-bit (6), B=17-bit (6), XOR                   |
| 105 | Impact Complex   | `0x00008010` | A=17-bit (6), B=17-bit (6), NOR                   |
| 106 | Weapon Layered   | `0x0000A010` | A=17-bit (6), B=17-bit (6), XNOR                  |
| 107 | Impact Glitch    | `0x00009010` | A=17-bit (6), B=17-bit (6), NAND                  |
| 108 | Weapon Variant 1 | `0x00005010` | A=17-bit (6), B=17-bit (6), AND                   |
| 109 | Impact Variant 1 | `0x00006010` | A=17-bit (6), B=17-bit (6), OR                    |
| 110 | Weapon Sparse    | `0x00005010` | A=17-bit (6), B=17-bit (6), AND, sparse           |
| 111 | Impact Sparse    | `0x00005010` | A=17-bit (6), B=17-bit (6), AND, sparse           |

#### Ambience & Textures (112-127)

| #   | Name               | NoiseCode    | Configuration                                 |
|-----|--------------------|--------------|-----------------------------------------------|
| 112 | Wind               | `0x00004010` | A=17-bit (6), B=17-bit (6), XOR, wind texture |
| 113 | Static             | `0x00007010` | A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR |
| 114 | Texture Deep       | `0x38004010` | A=17-bit (6), B=17-bit (6), XOR, decim ÷8     |
| 115 | Texture Bright     | `0x00004010` | A=17-bit (6), B=17-bit (6), XOR, bright       |
| 116 | Ambience Dark      | `0x00005010` | A=17-bit (6), B=17-bit (6), AND, dark         |
| 117 | Ambience Light     | `0x00006010` | A=17-bit (6), B=17-bit (6), OR, light         |
| 118 | Texture Layered    | `0x00007010` | A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR |
| 119 | Texture Complex    | `0x00008010` | A=17-bit (6), B=17-bit (6), NOR               |
| 120 | Ambience Classic   | `0x38002010` | A=9-bit (4), decim ÷8, classic                |
| 121 | Texture Variant 1  | `0x00009010` | A=17-bit (6), B=17-bit (6), NAND              |
| 122 | Ambience Variant 1 | `0x0000A010` | A=17-bit (6), B=17-bit (6), XNOR              |
| 123 | Texture Glitch     | `0x00009010` | A=17-bit (6), B=17-bit (6), NAND              |
| 124 | Ambience Glitch    | `0x00009010` | A=17-bit (6), B=17-bit (6), NAND              |
| 125 | Texture Sparse     | `0x00005010` | A=17-bit (6), B=17-bit (6), AND               |
| 126 | Ambience Sparse    | `0x00005010` | A=17-bit (6), B=17-bit (6), AND               |
| 127 | Texture Final      | `0x00007010` | A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR |

### Preset Usage

**Loading a Preset:**
```typescript
const presetNoiseCode = PRESETS[presetNumber];
const voice = {
  noiseCode: presetNoiseCode,
  frequency: 440.0, // Hz
  adsr: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2 }
};
```

**Modifying Presets:**
Presets can be modified bitwise for variation:
```typescript
// Start with a preset
let noiseCode = PRESETS[64]; // Pitfall!

// Modify decimation
noiseCode = (noiseCode & ~0x38000000) | (newDecim << 27);

// Modify shape
noiseCode = (noiseCode & ~0x07000000) | (newShape << 24);
```

**Preset Philosophy:**
- Presets serve as curated starting points
- Each preset is optimized for its category
- Presets can be combined, layered, or modified
- Presets demonstrate effective parameter combinations
- All presets are deterministic and reproducible

---

## Comparison with POKEY

### What POKEY Did
- Four channels with LFSR-based noise
- LFSRs: 4-bit, 5-bit, 9-bit, and 17-bit configurations (fixed per channel)
- Clock coupling (one LFSR clocks another) - separate from output combination
- High/low noise selection modes
- Frequency divider controlled both pitch and noise character (coupled)
- Limited combination options - primarily XOR of independent channels

### What GRIT Does

#### 1. Primary LFSR Set
- **POKEY**: Fixed LFSR configurations per channel (4-bit, 5-bit, 9-bit, 17-bit)
- **GRIT**: 8 primary LFSRs (1-bit square, 2-bit, 4-bit, 5-bit, 9-bit, 15-bit, 17-bit, 31-bit) that can be selected for any slot
- **Result**: More flexible - any slot can use any primary LFSR, includes all POKEY LFSR sizes plus pure square wave and extended range

#### 2. Clock Coupling
- **POKEY**: Periodic noise via secondary LFSR clocking
- **GRIT**: Direct clock coupling support (one LFSR clocks another)
- **Result**: Same expressive power as POKEY, with additional flexibility

#### 3. Logical Combination
- **POKEY**: Limited combination options
- **GRIT**: Logical combination operations (XOR, AND, OR, NAND, NOR, XNOR)
- **Result**: Can reproduce POKEY sounds plus new possibilities

#### 4. Pulse Wave Generation vs Clock Division
- **POKEY**: Clock division → LFSR clock → pulse wave output (all coupled)
- **GRIT**: LFSR bitstream → pulse wave conversion → frequency-controlled playback (decoupled)
- **Key difference**: We generate pulse waves from bitstreams, not by dividing a master clock
- Decimation controls LFSR stepping rate (noise character)
- Frequency controls pulse wave playback rate (pitch)
- **Result**: Smooth frequency control without affecting noise character, plus ability to change noise character independently

#### 5. Shape Modulation
- **POKEY**: No equivalent
- **GRIT**: Full set of shape operations (XOR with multiple waveforms, AM, RING modulation)
- **Result**: Unique timbres not possible on POKEY

### Why GRIT is the Ultimate Evolution of POKEY
- **More Expressive**: Can create sounds POKEY cannot, including shape modulation operations (XOR, AM, RING) for unique timbres
- **More Flexible**: Parameter control not limited by hardware - any slot can use any primary LFSR
- **Decoupled Control**: Frequency and noise character are independent (POKEY's key limitation removed)
- **Complete POKEY Compatibility**: Includes all POKEY LFSR sizes (4-bit, 5-bit, 9-bit, 17-bit) plus clock coupling
- **Enhanced Combination**: Logical operations (XOR, AND, OR, etc.) beyond POKEY's capabilities
- **Reproducible**: Can still create classic POKEY sounds with deterministic results
- **Extensible**: New operations can be added (shape modulation, effects)
- **Modern Architecture**: 32-bit NoiseCode provides compact, expressive sound language

---

*This document captures the complete design intent and architectural decisions for GRIT. It should serve as the authoritative reference for implementation and future development.*
