# GRIT Preset Reference

This document provides a complete reference for all 128 GRIT presets, organized by category. Each preset is a 32-bit NoiseCode value optimized for retro music instruments and sound effects.

## Preset Categories

1. **Pure Tones** (0-15): Square waves, pulse waves, and fundamental tones
2. **Bass Instruments** (16-31): Deep, low-frequency sounds for basslines
3. **Lead Instruments** (32-47): Melodic lead sounds and arpeggios
4. **Drums & Percussion** (48-63): Kick drums, snares, hi-hats, and percussion
5. **Classic Game Sounds** (64-79): Pitfall, Defender, and other classic game sounds
6. **Engines & Motors** (80-95): Rhythmic mechanical sounds
7. **Weapons & Impacts** (96-111): Sharp, aggressive sounds for impacts and weapons
8. **Ambience & Textures** (112-127): Background textures and atmospheric sounds

## NoiseCode Calculation

Each NoiseCode is calculated from the bit layout:
- Bits 31-30: Reserved (0)
- Bits 29-27: DECIM (0-7, actual = value + 1)
- Bits 26-24: SHAPE (0-7)
- Bits 23-21: COMB (0-7)
- Bits 20-18: C_POLY (0-7)
- Bits 17-15: B_POLY (0-7)
- Bits 14-12: A_POLY (0-7)
- Bits 11-10: Clock coupling (C_CLK_B, B_CLK_A)
- Bits 9-7: Invert (C_INV, B_INV, A_INV)
- Bits 6-4: Enable (C_EN, B_EN, A_EN)
- Bits 3-0: Reserved (0)

Formula: `(DECIM << 27) | (SHAPE << 24) | (COMB << 21) | (C_POLY << 18) | (B_POLY << 15) | (A_POLY << 12) | (C_CLK_B << 11) | (B_CLK_A << 10) | (C_INV << 9) | (B_INV << 8) | (A_INV << 7) | (C_EN << 6) | (B_EN << 5) | (A_EN << 4)`

## Preset Tables

### Pure Tones (0-15)

| # | Name | NoiseCode | Configuration |
|---|------|-----------|---------------|
| 0 | Pure Square 50/50 | `0x00000010` | A=1-bit square (0), enabled only, no decimation |
| 1 | Pure Pulse 25/75 | `0x00001010` | A=25/75 pulse (1), enabled only, no decimation |
| 2 | Square Decim 2 | `0x08000010` | A=1-bit square, decim ÷2 |
| 3 | Square Decim 4 | `0x18000010` | A=1-bit square, decim ÷4 |
| 4 | Square Decim 8 | `0x38000010` | A=1-bit square, decim ÷8 |
| 5 | Pulse Decim 2 | `0x08001010` | A=25/75 pulse, decim ÷2 |
| 6 | Pulse Decim 4 | `0x18001010` | A=25/75 pulse, decim ÷4 |
| 7 | 4-bit Tone | `0x00002010` | A=4-bit (2), enabled only |
| 8 | 5-bit Tone | `0x00003010` | A=5-bit (3), enabled only |
| 9 | 9-bit Tone | `0x00004010` | A=9-bit (4), enabled only |
| 10 | 9-bit Decim 8 | `0x38004010` | A=9-bit (4), decim ÷8 (Pitfall! style) |
| 11 | 4-bit Decim 4 | `0x18002010` | A=4-bit (2), decim ÷4 |
| 12 | 5-bit Decim 4 | `0x18003010` | A=5-bit (3), decim ÷4 |
| 13 | Square AM | `0x05000010` | A=1-bit square, SHAPE=AM (5) |
| 14 | Pulse AM | `0x05001010` | A=25/75 pulse, SHAPE=AM (5) |
| 15 | Square Ring | `0x06000010` | A=1-bit square, SHAPE=RING (6) |

### Bass Instruments (16-31)

| # | Name | NoiseCode | Configuration |
|---|------|-----------|---------------|
| 16 | Deep Bass | `0x00000010` | A=1-bit square, use 60-200 Hz |
| 17 | Bass Pulse | `0x00001010` | A=25/75 pulse, use 60-200 Hz |
| 18 | Sub Bass | `0x00002010` | A=4-bit, creates sub-bass texture |
| 19 | Bass Rumble | `0x38004010` | A=9-bit, decim ÷8, rumbly texture |
| 20 | Bass Layer | `0x00008030` | A=1-bit, B=25/75 pulse, XOR combination |
| 21 | Bass Clock | `0x00014430` | A=9-bit, B=4-bit, B_CLK_A, XOR |
| 22 | Deep Pulse | `0x18001010` | A=25/75 pulse, decim ÷4 |
| 23 | Bass Texture | `0x00088070` | A=1-bit, B=25/75 pulse, C=4-bit, XOR |
| 24 | Bass Complex | `0x00200030` | A=1-bit, B=1-bit, AND combination |
| 25 | Bass Warm | `0x00400030` | A=1-bit, B=1-bit, OR combination |
| 26 | Bass Metallic | `0x01000010` | A=1-bit square, SHAPE=XOR_SQUARE (1) |
| 27 | Bass Bell | `0x06000010` | A=1-bit square, SHAPE=RING (6) |
| 28 | Bass Sync | `0x08014430` | A=9-bit, B=4-bit, B_CLK_A, XOR, decim ÷2 |
| 29 | Bass Classic | `0x38004010` | A=9-bit, decim ÷8, classic POKEY style |
| 30 | Bass Variant 1 | `0x18002010` | A=4-bit, decim ÷4 |
| 31 | Bass Variant 2 | `0x18003010` | A=5-bit, decim ÷4 |

### Lead Instruments (32-47)

| # | Name | NoiseCode | Configuration |
|---|------|-----------|---------------|
| 32 | Lead Square | `0x00000010` | A=1-bit square, bright lead |
| 33 | Lead Pulse | `0x00001010` | A=25/75 pulse, punchy lead |
| 34 | Lead Layered | `0x00008030` | A=1-bit, B=25/75 pulse, XOR, rich texture |
| 35 | Lead Arp | `0x08004010` | A=9-bit, decim ÷2, arpeggio-like pattern |
| 36 | Lead Bright | `0x00088070` | A=1-bit, B=25/75 pulse, C=4-bit, XOR |
| 37 | Lead Warm | `0x00400030` | A=1-bit, B=1-bit, OR combination |
| 38 | Lead Metallic | `0x01000010` | A=1-bit square, SHAPE=XOR_SQUARE |
| 39 | Lead Bell | `0x06000010` | A=1-bit square, SHAPE=RING |
| 40 | Lead Sync | `0x0001C430` | A=9-bit, B=5-bit, B_CLK_A, XOR |
| 41 | Lead Complex | `0x00200030` | A=1-bit, B=1-bit, AND combination |
| 42 | Lead Glitch | `0x00600030` | A=1-bit, B=1-bit, NAND combination |
| 43 | Lead Sweep | `0x00004010` | A=9-bit, good for frequency sweeps |
| 44 | Lead Classic | `0x38004010` | A=9-bit, decim ÷8, classic style |
| 45 | Lead Ambient | `0x00800030` | A=1-bit, B=1-bit, NOR combination |
| 46 | Lead Impact | `0x00A00030` | A=1-bit, B=1-bit, XNOR combination |
| 47 | Lead Variant | `0x18000010` | A=1-bit square, decim ÷4 |

### Drums & Percussion (48-63)

| # | Name | NoiseCode | Configuration |
|---|------|-----------|---------------|
| 48 | Kick Deep | `0x00002010` | A=4-bit, deep kick, use 40-80 Hz |
| 49 | Kick Punch | `0x00003010` | A=5-bit, punchy kick, use 50-100 Hz |
| 50 | Kick Classic | `0x00004010` | A=9-bit, classic kick, use 60-120 Hz |
| 51 | Snare Sharp | `0x00008030` | A=1-bit, B=25/75 pulse, XOR, sharp snare |
| 52 | Snare Classic | `0x00088070` | A=1-bit, B=25/75 pulse, C=4-bit, XOR |
| 53 | HiHat Closed | `0x00200030` | A=1-bit, B=1-bit, AND, sparse |
| 54 | HiHat Open | `0x00400030` | A=1-bit, B=1-bit, OR, dense |
| 55 | Crash | `0x00600030` | A=1-bit, B=1-bit, NAND |
| 56 | Tom Low | `0x00002010` | A=4-bit, low tom, use 80-150 Hz |
| 57 | Tom Mid | `0x00003010` | A=5-bit, mid tom, use 100-200 Hz |
| 58 | Tom High | `0x00004010` | A=9-bit, high tom, use 150-300 Hz |
| 59 | Clap | `0x00008030` | A=1-bit, B=25/75 pulse, XOR, clap texture |
| 60 | Rimshot | `0x00088070` | A=1-bit, B=25/75 pulse, C=4-bit, XOR |
| 61 | Shaker | `0x00200030` | A=1-bit, B=1-bit, AND, sparse pattern |
| 62 | Tambourine | `0x00400030` | A=1-bit, B=1-bit, OR, dense pattern |
| 63 | Perc Glitch | `0x00600030` | A=1-bit, B=1-bit, NAND, glitchy |

### Classic Game Sounds (64-79)

| # | Name | NoiseCode | Configuration |
|---|------|-----------|---------------|
| 64 | Pitfall! | `0x38004010` | A=9-bit (4), decim ÷8, classic Pitfall! |
| 65 | Pitfall Variant | `0x18004010` | A=9-bit (4), decim ÷4, variant |
| 66 | Defender Engine | `0x00026430` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR |
| 67 | Defender Weapon | `0x01036030` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE |
| 68 | POKEY Classic | `0x00004010` | A=9-bit (4), classic POKEY tone |
| 69 | POKEY Noise | `0x00036030` | A=17-bit (6), B=17-bit (6), XOR |
| 70 | POKEY Tone | `0x00002010` | A=4-bit (2), POKEY-style tone |
| 71 | TIA Sound | `0x00004010` | A=9-bit (4), TIA-style sound |
| 72 | Game Beep | `0x00000010` | A=1-bit square, classic beep |
| 73 | Game Blip | `0x00001010` | A=25/75 pulse, classic blip |
| 74 | Game Zap | `0x01000010` | A=1-bit square, SHAPE=XOR_SQUARE |
| 75 | Game Powerup | `0x00004010` | A=9-bit, powerup sound |
| 76 | Game Coin | `0x00003010` | A=5-bit, coin collection |
| 77 | Game Jump | `0x00002010` | A=4-bit, jump sound |
| 78 | Game Explosion | `0x00036030` | A=17-bit, B=17-bit, XOR, explosion |
| 79 | Game Victory | `0x00008030` | A=1-bit, B=25/75 pulse, XOR, victory fanfare |

### Engines & Motors (80-95)

| # | Name | NoiseCode | Configuration |
|---|------|-----------|---------------|
| 80 | Engine Rumble | `0x380A6C70` | A=17-bit (6), B=9-bit (4), C=4-bit (2), B_CLK_A, C_CLK_B, XOR, decim ÷8 |
| 81 | Engine Idle | `0x00026430` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR |
| 82 | Engine Rev | `0x18026430` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR, decim ÷4 |
| 83 | Motor Hum | `0x00036030` | A=17-bit (6), B=17-bit (6), XOR |
| 84 | Motor Fast | `0x00236030` | A=17-bit (6), B=17-bit (6), AND |
| 85 | Motor Slow | `0x38036030` | A=17-bit (6), B=17-bit (6), XOR, decim ÷8 |
| 86 | Engine Complex | `0x00436030` | A=17-bit (6), B=17-bit (6), OR |
| 87 | Engine Layered | `0x001B6070` | A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR |
| 88 | Engine Metallic | `0x01036030` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE |
| 89 | Engine Classic | `0x38004010` | A=9-bit (4), decim ÷8, classic style |
| 90 | Motor Rhythmic | `0x00014430` | A=9-bit (4), B=4-bit (2), B_CLK_A, XOR |
| 91 | Engine Sync | `0x00026430` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR |
| 92 | Motor Texture | `0x00236030` | A=17-bit (6), B=17-bit (6), AND |
| 93 | Engine Variant 1 | `0x18026430` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR, decim ÷4 |
| 94 | Engine Variant 2 | `0x20026430` | A=17-bit (6), B=9-bit (4), B_CLK_A, XOR, decim ÷5 |
| 95 | Engine Glitch | `0x00636030` | A=17-bit (6), B=17-bit (6), NAND |

### Weapons & Impacts (96-111)

| # | Name | NoiseCode | Configuration |
|---|------|-----------|---------------|
| 96 | Metallic Impact | `0x01036030` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SQUARE |
| 97 | Weapon Laser | `0x00036030` | A=17-bit (6), B=17-bit (6), XOR, sharp |
| 98 | Weapon Blast | `0x00236030` | A=17-bit (6), B=17-bit (6), AND, sparse |
| 99 | Impact Sharp | `0x02036030` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SINE |
| 100 | Impact Deep | `0x00436030` | A=17-bit (6), B=17-bit (6), OR, dense |
| 101 | Weapon Zap | `0x06036030` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=RING |
| 102 | Weapon Beam | `0x001B6070` | A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR |
| 103 | Impact Metallic | `0x03036030` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_TRIANGLE |
| 104 | Weapon Classic | `0x00036030` | A=17-bit (6), B=17-bit (6), XOR |
| 105 | Impact Complex | `0x00836030` | A=17-bit (6), B=17-bit (6), NOR |
| 106 | Weapon Layered | `0x00A36030` | A=17-bit (6), B=17-bit (6), XNOR |
| 107 | Impact Glitch | `0x00636030` | A=17-bit (6), B=17-bit (6), NAND |
| 108 | Weapon Variant 1 | `0x08236030` | A=17-bit (6), B=17-bit (6), AND, decim ÷2 |
| 109 | Impact Variant 1 | `0x08436030` | A=17-bit (6), B=17-bit (6), OR, decim ÷2 |
| 110 | Weapon Sparse | `0x18236030` | A=17-bit (6), B=17-bit (6), AND, decim ÷4 |
| 111 | Impact Sparse | `0x18436030` | A=17-bit (6), B=17-bit (6), OR, decim ÷4 |

### Ambience & Textures (112-127)

| # | Name | NoiseCode | Configuration |
|---|------|-----------|---------------|
| 112 | Wind | `0x08036030` | A=17-bit (6), B=17-bit (6), XOR, decim ÷2, wind texture |
| 113 | Static | `0x001B6070` | A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR |
| 114 | Texture Deep | `0x38036030` | A=17-bit (6), B=17-bit (6), XOR, decim ÷8 |
| 115 | Texture Bright | `0x04036030` | A=17-bit (6), B=17-bit (6), XOR, SHAPE=XOR_SAW, bright |
| 116 | Ambience Dark | `0x00236030` | A=17-bit (6), B=17-bit (6), AND, dark |
| 117 | Ambience Light | `0x00436030` | A=17-bit (6), B=17-bit (6), OR, light |
| 118 | Texture Layered | `0x081B6070` | A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR, decim ÷2 |
| 119 | Texture Complex | `0x00836030` | A=17-bit (6), B=17-bit (6), NOR |
| 120 | Ambience Classic | `0x38004010` | A=9-bit (4), decim ÷8, classic |
| 121 | Texture Variant 1 | `0x08636030` | A=17-bit (6), B=17-bit (6), NAND, decim ÷2 |
| 122 | Ambience Variant 1 | `0x00A36030` | A=17-bit (6), B=17-bit (6), XNOR |
| 123 | Texture Glitch | `0x18636030` | A=17-bit (6), B=17-bit (6), NAND, decim ÷4 |
| 124 | Ambience Glitch | `0x01636030` | A=17-bit (6), B=17-bit (6), NAND, SHAPE=XOR_SQUARE |
| 125 | Texture Sparse | `0x08236030` | A=17-bit (6), B=17-bit (6), AND, decim ÷2 |
| 126 | Ambience Sparse | `0x18236030` | A=17-bit (6), B=17-bit (6), AND, decim ÷4 |
| 127 | Texture Final | `0x181B6070` | A=17-bit (6), B=17-bit (6), C=17-bit (6), XOR, decim ÷4 |

## Usage Notes

- **Frequency Range**: Each preset works best in specific frequency ranges
  - Bass: 60-200 Hz
  - Lead: 200-2000 Hz
  - Drums: 40-500 Hz (varies by drum type)
  - Effects: 100-5000 Hz (varies by effect)

- **ADSR Envelopes**: Recommended envelope settings vary by category
  - Pure Tones: Long attack, long release for sustained tones
  - Drums: Fast attack, fast decay, no sustain, short release
  - Effects: Very fast attack, fast decay, no sustain, medium release

- **Modification**: Presets can be modified bitwise for variation
  - Change decimation for different rhythmic patterns
  - Change COMB operation for different timbres
  - Change SHAPE for different modulation effects

