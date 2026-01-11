# Graphics System

This document describes the graphics rendering system.

## Graphics Class

**Location**: `src/lang/graphics.ts`

Manages all graphics operations including text output and pixel graphics.

## Display Specifications

- **Resolution**: 640×480 pixels
- **Text Grid**: 80 columns × 30 rows
- **Character Size**: 8×16 pixels
- **Coordinate System**: Bottom-left origin (0,0)
- **Color Format**: 32-bit RGBA (8 bits per channel)

## Color System

**Color Interface**:
```typescript
interface Color {
    r: number;  // Red (0-255)
    g: number;  // Green (0-255)
    b: number;  // Blue (0-255)
    a: number;  // Alpha (0-255)
}
```

**Default Colors**:
- Foreground: White (255, 255, 255, 255)
- Background: Black (0, 0, 0, 255)

**Color Methods**:
- `setForegroundColor(color: Color)` - Set text/graphics color
- `setBackgroundColor(color: Color)` - Set background color

## Text Output

### Text Operations

**printText(text: string)**:
- Prints text at current cursor position
- Handles character-by-character rendering
- Automatically wraps at column 80

**printChar(char: string)**:
- Prints single character
- Handles newline (`\n`)
- Updates cursor position

**newLine()**:
- Moves cursor to next line
- Scrolls if at bottom
- Resets column to 0

**setCursorPosition(row: number, column: number)**:
- Sets text cursor position
- Clamped to valid range (0-29 rows, 0-79 columns)

### Text Rendering

**Character Rendering**:
- Uses HTML5 Canvas for character rendering
- IBM Plex Mono font (16px)
- Alpha blending for anti-aliasing
- Background color filled first
- Foreground color blended with alpha

**Text Scrolling**:
- When cursor reaches row 30, screen scrolls up
- Top line removed, new line added at bottom
- Cursor positioned at bottom row

## Graphics Operations

### Pixel Operations

**drawPixel(x: number, y: number, color?: Color)**:
- Sets single pixel
- Coordinates: bottom-left origin
- Y coordinate flipped for canvas
- Uses foreground color if color not specified

### Line Drawing

**drawLine(x1, y1, x2, y2, color?)**:
- Bresenham's line algorithm
- Draws line between two points
- Uses foreground color if not specified

### Shape Drawing

**drawRectangle(x, y, width, height, filled, color?)**:
- Draws rectangle
- `filled`: true for filled, false for outline
- Bottom-left corner at (x, y)

**drawCircle(x, y, radius, filled, color?)**:
- Draws circle
- Center at (x, y)
- Uses midpoint circle algorithm for outline

**drawOval(x, y, width, height, filled, color?)**:
- Draws ellipse
- Center at (x, y)
- Width and height as diameters

**drawTriangle(x1, y1, x2, y2, x3, y3, filled, color?)**:
- Draws triangle
- Three vertex coordinates
- Scanline fill algorithm for filled triangles

**drawArc(x, y, radius, startAngle, endAngle, color?)**:
- Draws arc
- Center at (x, y)
- Angles in radians
- Step-based rendering

## Buffer Management

### Image Buffer

**Buffer Structure**:
- `ImageData` object (640×480×4 bytes)
- RGBA format
- Direct pixel manipulation

**Buffer Operations**:
- `getBuffer()` - Returns current buffer
- `setContext(context)` - Initializes buffer
- `flush()` - Renders buffer to canvas

### Flush Mechanism

**flush()**:
- Writes buffer to canvas via `putImageData()`
- Triggers flush callback if set
- Callback notifies `GraphicsService` of update

**Flush Callback**:
- Set via `setFlushCallback(callback)`
- Called after each `flush()`
- Used to emit buffer updates to UI

## Coordinate System

**Origin**: Bottom-left corner (0, 0)
- X increases rightward (0-639)
- Y increases upward (0-479)

**Canvas Mapping**:
- Canvas uses top-left origin
- Y coordinate flipped: `flippedY = height - 1 - y`
- Pixel index: `(flippedY * width + x) * 4`

## Integration

### With GraphicsService

**GraphicsService**:
- Maintains single `Graphics` instance
- Sets canvas context
- Sets flush callback
- Emits buffer updates via RxJS

**Flow**:
```
Graphics.flush()
    ↓
Flush callback triggered
    ↓
GraphicsService.buffer$.next(buffer)
    ↓
OutputComponent subscribes
    ↓
Canvas rendering
```

### With Statements

Statements receive `Graphics` instance:
- `PrintStatement` - Text output
- `PsetStatement` - Pixel operations
- `LineStatement` - Line drawing
- `CircleStatement` - Circle drawing
- etc.

## Performance Considerations

**Buffer Updates**:
- Buffer updated in memory
- `flush()` writes to canvas
- Canvas updates are batched

**Text Rendering**:
- Character rendering uses temporary canvas
- Alpha blending for smooth text
- May be slower than pixel operations

**Optimization Opportunities**:
- Batch multiple operations before flush
- Use requestAnimationFrame for updates
- Optimize character rendering

## Future Enhancements

Potential additions:
- **Sprites**: Pre-rendered graphics objects
- **Transforms**: Rotation, scaling, translation
- **Layers**: Multiple graphics layers
- **Effects**: Blur, shadows, filters
- **Animation**: Frame-based animation support
