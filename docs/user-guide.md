# EduBASIC User Guide

*Copyright © 2025 Dietz-Moss Publishing. Licensed under the MIT License.*

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Interface Overview](#interface-overview)
  - [Tabs](#tabs)
  - [Console Tab](#console-tab)
  - [Code Tab](#code-tab)
  - [Disk Tab](#disk-tab)
  - [Output Tab](#output-tab)
- [Using the Console](#using-the-console)
  - [Entering Statements](#entering-statements)
  - [Expression Auto-Detection](#expression-auto-detection)
  - [Statement History](#statement-history)
  - [Running Programs from Console](#running-programs-from-console)
- [Writing and Running Programs](#writing-and-running-programs)
  - [The Code Editor](#the-code-editor)
  - [Running Your Program](#running-your-program)
  - [Viewing Output](#viewing-output)
- [Managing Projects](#managing-projects)
  - [Creating a New Project](#creating-a-new-project)
  - [Loading a Project](#loading-a-project)
  - [Saving a Project](#saving-a-project)
  - [Project Files](#project-files)
- [Working with Data Files](#working-with-data-files)
  - [Creating Files](#creating-files)
  - [Editing Files](#editing-files)
  - [Text vs. Hex View](#text-vs-hex-view)
  - [Deleting Files](#deleting-files)
  - [Using Files in Programs](#using-files-in-programs)
- [Graphics and Output](#graphics-and-output)
  - [Graphics Display](#graphics-display)
  - [Text Output](#text-output)
  - [Switching Between Views](#switching-between-views)
- [Tips and Best Practices](#tips-and-best-practices)
  - [Saving Your Work](#saving-your-work)
  - [Organizing Projects](#organizing-projects)
  - [Debugging Programs](#debugging-programs)
  - [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Introduction

EduBASIC is a web-based programming environment designed for learning the fundamentals of programming. It provides a complete BASIC interpreter that runs entirely in your web browser, with no installation required.

**Key Features:**
- Write and run BASIC programs directly in your browser
- Interactive console for immediate statement execution
- Graphics output for visual programs
- Project management system for organizing your work
- File system for data storage and file I/O operations
- No installation or setup required

This user guide will help you understand how to use the EduBASIC interface and all its features.

## Getting Started

### Accessing EduBASIC

EduBASIC runs entirely in your web browser. Simply navigate to the EduBASIC website in any modern web browser (Chrome, Firefox, Safari, Edge, etc.).

**No installation required** - everything runs in the browser, and your projects are saved as files you can download and share.

### First Steps

1. **Open the application** in your web browser
2. **Familiarize yourself with the interface** - you'll see four tabs: Console, Code, Disk, and Output
3. **Try the Console** - click the Console tab and type `PRINT "Hello, World!"` then press Enter
4. **Create your first project** - click the Disk tab, click "New", and give your project a name

## Interface Overview

The EduBASIC interface consists of a single window with four tabs that provide different functions:

### Tabs

The application has four main tabs:

1. **Console** - Interactive command line for executing BASIC statements
2. **Code** - Multi-line code editor for writing complete programs
3. **Disk** - Project and file management system
4. **Output** - Graphics and text output display

Click on any tab to switch between views. The active tab is highlighted.

### Console Tab

The Console tab provides an interactive command-line interface where you can execute BASIC statements immediately.

**Features:**
- Type statements and press Enter to execute them
- Type expressions directly to auto-evaluate and print results
- View statement history (input, output, and errors)
- Navigate through previous statements with arrow keys
- Variables persist between statements
- Perfect for testing individual statements or exploring the language

**Use the Console when:**
- Testing individual BASIC statements
- Exploring language features
- Debugging specific operations
- Performing quick calculations (just type the expression)
- Looking up statement syntax with HELP

### Code Tab

The Code tab provides a full-featured code editor for writing complete BASIC programs.

**Features:**
- Line numbers displayed on the left
- Multi-line text editor
- Synchronized scrolling between line numbers and code
- "Run" button to execute your program
- Automatic saving to the current project

**Use the Code tab when:**
- Writing complete programs
- Creating applications with multiple statements
- Developing larger projects
- Writing programs you want to save and reuse

### Disk Tab

The Disk tab manages your projects and data files.

**Features:**
- Create, load, and save complete projects
- Edit project name
- Create and manage data files
- Edit files in text or hex mode
- All files are saved together in a single project file

**Use the Disk tab when:**
- Starting a new project
- Loading a saved project
- Saving your work
- Creating or editing data files
- Managing project files

### Output Tab

The Output tab displays graphics and text output from your programs.

**Features:**
- 640×480 pixel graphics canvas
- Text output overlay
- Automatically switches to this tab when graphics operations occur
- Displays all `PRINT` statement output

**The Output tab is automatically shown when:**
- Your program uses graphics statements (PSET, LINE, CIRCLE, etc.)
- Your program uses PRINT statements
- Graphics operations are performed

## Using the Console

The Console provides an interactive way to execute BASIC statements immediately.

### Entering Statements

1. **Click the Console tab** to make it active
2. **Type a BASIC statement** in the input field at the bottom
3. **Press Enter** to execute the statement

**Example:**
```
PRINT "Hello, World!"
```

The statement executes immediately, and the output appears in the console history.

### Expression Auto-Detection

The console has a convenient feature: if you type just an expression (not a statement), it automatically evaluates and prints the result to the console, as if you had typed `CONSOLE` before it.

**Examples:**
```
> 1 + 2
3
> x% * 2
20
> "Hello" + " " + "World"
Hello World
```

This is equivalent to typing `CONSOLE 1 + 2`, `CONSOLE x% * 2`, etc. However, in program code, you must explicitly use the `CONSOLE` statement.

### Statement History

The console maintains a history of all statements you've entered and their results.

**Navigating History:**
- **Arrow Up** - Go to the previous statement in history
- **Arrow Down** - Go to the next statement in history (or return to empty input)

**History Display:**
- **Input** - Statements you've entered (shown in one color)
- **Output** - Results from PRINT and CONSOLE statements (shown in another color)
- **Errors** - Error messages if something goes wrong (shown in red)

**Example Session:**
```
> PRINT "Hello"
Hello
> LET x% = 10
> PRINT x%
10
> 1 + 2
3
> CONSOLE x% * 2
20
> HELP PRINT
PRINT expression1, expression2, ...
PRINT expression1, expression2, ...;
PRINT array[]
PRINT array[];
PRINT
```

### Running Programs from Console

You can execute multiple statements in the console, and variables persist between statements:

```
> LET count% = 0
> LET count% += 1
> PRINT count%
1
> LET count% += 1
> PRINT count%
2
```

This makes the console perfect for interactive exploration and debugging.

## Writing and Running Programs

The Code tab provides a full-featured editor for writing complete BASIC programs.

### The Code Editor

**Features:**
- **Line Numbers** - Automatically displayed on the left side
- **Text Editor** - Main editing area for your code
- **Synchronized Scrolling** - Line numbers scroll with your code
- **Auto-save** - Changes are automatically saved to your current project

**Writing Code:**
1. Click the **Code tab**
2. Type your BASIC program in the editor
3. Use standard text editing (cut, copy, paste, etc.)
4. Your code is automatically saved to the current project

**Example Program:**
```
PRINT "Counting from 1 to 10:"
FOR i% = 1 TO 10
    PRINT i%
NEXT i%
PRINT "Done!"
```

### Running Your Program

**To run your program:**
1. Make sure your code is written in the Code tab
2. Click the **"Run" button** (located in the Code tab)
3. The program executes, and output appears in the Output tab

**What happens when you run:**
- The program is parsed and checked for syntax errors
- If there are errors, they are displayed in the console
- If successful, the program executes
- Graphics operations appear in the Output tab
- Text output appears in the Output tab
- The Output tab is automatically shown

**Program Execution:**
- Programs run step-by-step
- Graphics operations update the canvas in real-time
- PRINT statements add text to the output
- Variables are created and modified as the program runs

### Viewing Output

When your program runs, the Output tab automatically becomes active to show the results.

**Graphics Output:**
- All graphics operations (PSET, LINE, CIRCLE, etc.) draw on a 640×480 pixel canvas
- The canvas uses a coordinate system with (0,0) at the bottom-left corner
- Graphics persist until cleared with CLS

**Text Output:**
- PRINT statements display text on the graphics canvas
- Text appears as an overlay on top of graphics
- Text uses a character grid (80 columns × 30 rows by default)

**Switching Back:**
- Click any other tab to return to editing or console
- The output remains visible when you switch back to the Output tab

## Managing Projects

EduBASIC uses a "disk" system to organize your work. A disk is a complete project that contains your BASIC program code and all associated data files.

### Creating a New Project

**To create a new project:**
1. Click the **Disk tab**
2. Click the **"New" button**
3. Enter a name for your project (e.g., "My First Program")
4. Click OK or press Enter

**What happens:**
- A new empty project is created
- The project name appears at the top
- The Code tab is cleared (ready for new code)
- `program.bas` file is automatically created (appears in the file list)
- The file list shows `program.bas` (ready for you to write code)

**Project Name:**
- The project name is displayed at the top of the Disk tab
- You can edit it by clicking on the name field
- The project name becomes the filename when you save (e.g., "My Project.disk")

### Loading a Project

**To load a saved project:**
1. Click the **Disk tab**
2. Click the **"Load" button**
3. Select a `.disk` file from your computer
4. The project loads with all its code and files

**What loads:**
- Your BASIC program code (appears in the Code tab and in `program.bas` file)
- `program.bas` file (appears in the file list)
- All data files (appear in the file list)
- Project name and metadata

**After loading:**
- Switch to the Code tab to see your program
- Switch to the Disk tab to see your files
- You can continue editing and save again

### Saving a Project

**To save your current project:**
1. Click the **Disk tab**
2. Click the **"Save" button**
3. A `.disk` file downloads to your computer

**What gets saved:**
- `program.bas` file (your BASIC program code)
- All data files (from the Disk tab)
- Project name and metadata

**File Format:**
- Projects are saved as `.disk` files
- These are ZIP archives containing your code and files
- You can share `.disk` files with others
- You can load them on any computer with EduBASIC

**Important:** Always save your work regularly! The browser doesn't automatically save your projects.

### Project Files

A project (disk) contains:
- **program.bas** - Your BASIC program code (visible in both Code tab and Disk tab file hierarchy)
- **Data Files** - Additional files you create for your program to use (visible in the Disk tab)

**program.bas File:**
- The main program file that contains your BASIC code
- Appears in the file hierarchy in the Disk tab (alongside other files)
- Visible and editable in the Code tab
- Can also be edited directly in the Disk tab file editor
- Automatically created when you create a new project
- Automatically saved when you save the project
- **Source of truth**: When you run your program, it reads from `program.bas` file

**Data Files:**
- Created and managed in the Disk tab
- Can be text files, binary files, or any data format
- Accessible from your BASIC program using file I/O statements
- Stored alongside `program.bas` in the project's file system

## Working with Data Files

The Disk tab allows you to create and manage data files that your programs can use.

### File Hierarchy

The Disk tab shows a file hierarchy that includes:

- **program.bas** - Your main BASIC program (always present)
- **Data files** - Additional files you create (e.g., "data.txt", "scores.bin")
- **Directories** - Folders you create to organize files

**program.bas:**
- Automatically created when you create a new project
- Contains your BASIC program code
- Can be edited in the Code tab or directly in the Disk tab
- When you run your program, it reads from this file
- Always appears in the file hierarchy

### Creating Files

**To create a new data file:**
1. Click the **Disk tab**
2. Click the **"+" button** (usually near the file list) or right-click in the file list
3. Enter a filename (e.g., "data.txt")
4. Click OK or press Enter

**File Naming:**
- Use descriptive names (e.g., "scores.txt", "config.json")
- Include file extensions to indicate file type
- Avoid special characters that might cause issues

**File Types:**
- **Text files** - Use `.txt`, `.json`, `.csv`, etc.
- **Binary files** - Use `.bin`, `.dat`, etc.
- Any extension is allowed - choose what makes sense for your data

### Editing Files

**To edit a file:**
1. Click the **Disk tab**
2. Click on a file name in the file list (including `program.bas`)
3. The file opens in the editor on the right
4. Make your changes
5. Changes are automatically saved

**Editing program.bas:**
- You can edit `program.bas` in two ways:
  - **Code tab**: Edit your program code (recommended for writing programs)
  - **Disk tab**: Edit `program.bas` directly as a file (useful for quick edits)
- Changes in either location are automatically synchronized
- When you run your program, it always reads from the `program.bas` file

**Text Editor:**
- Line numbers displayed on the left
- Standard text editing (cut, copy, paste)
- UTF-8 encoding (supports all characters)
- Changes save automatically as you type

**Editing Tips:**
- Files are saved automatically - no save button needed
- You can edit files while your program is running
- Changes are immediately available to your program

### Text vs. Hex View

Files can be viewed in two modes:

**Text View (default):**
- Shows file contents as readable text
- Perfect for text files, JSON, CSV, etc.
- UTF-8 encoding
- Use for human-readable files

**Hex View:**
- Shows file contents as hexadecimal bytes
- Perfect for binary files or debugging
- Shows byte values and ASCII representation
- Use for binary data or low-level inspection

**Switching Views:**
- Click the "Text" or "Hex" button in the file editor toolbar
- The same file data is shown in different formats
- Both views edit the same file

### Deleting Files

**To delete a file:**
1. Click the **Disk tab**
2. Select the file you want to delete
3. Click the **"Delete" button** (usually in the file editor toolbar)
4. Confirm the deletion

**Warning:** Deleted files cannot be recovered. Make sure you really want to delete the file!

### Using Files in Programs

Your BASIC programs can access data files using file I/O statements.

**Reading Files:**
```basic
READFILE content$ FROM "data.txt"
PRINT content$
```

**Writing Files:**
```basic
WRITEFILE "Hello, World!" TO "output.txt"
```

**Binary File Operations:**
```basic
OPEN "data.bin" FOR OVERWRITE AS file%
WRITE 42 TO file%
WRITE 3.14 TO file%
CLOSE file%
```

**File Paths:**
- Files are referenced by name (e.g., "data.txt")
- Files must be in the current project
- Create files in the Disk tab before using them in programs

## Graphics and Output

EduBASIC provides both graphics and text output capabilities.

### Graphics Display

**Graphics Canvas:**
- 640×480 pixel resolution
- Coordinate system: (0,0) at bottom-left corner
- X increases to the right (0 to 639)
- Y increases upward (0 to 479)

**Graphics Operations:**
- `PSET` - Set individual pixels
- `LINE` - Draw lines
- `CIRCLE` - Draw circles
- `RECTANGLE` - Draw rectangles
- `OVAL` - Draw ellipses
- `TRIANGLE` - Draw triangles
- `PAINT` - Flood fill areas
- `CLS` - Clear the screen

**Colors:**
- 32-bit RGBA format: `&HRRGGBBAA`
- Example: `&HFF0000FF` is red, `&H00FF00FF` is green
- Use `COLOR` statement to set default colors
- Use `WITH color%` to override colors in graphics statements

**Example:**
```basic
CLS WITH &H000033FF    ' Dark blue background
CIRCLE AT (320, 240) RADIUS 50 WITH &HFFFF00FF FILLED    ' Yellow filled circle
```

### Text Output

**Text Display:**
- Overlays the graphics canvas
- Character grid: 80 columns × 30 rows (default)
- 0-based coordinates (row 0, column 0 is top-left)
- Use `LOCATE` to position text cursor
- Use `COLOR` to set text colors

**PRINT Statement:**
- Displays text and values
- Comma (`,`) separates items (concatenated with no spacing)
- Semicolon (`;`) at end suppresses newline
- Automatically switches to Output tab

**Example:**
```basic
LOCATE 9, 19
COLOR &HFFFFFFFF    ' White text
PRINT "Hello, World!"
PRINT "X: "; x%; " Y: "; y%
```

### Switching Between Views

**Automatic Switching:**
- Output tab automatically becomes active when:
  - Graphics operations occur
  - PRINT statements execute
  - Programs run

**Manual Switching:**
- Click any tab to switch views
- Output remains visible when you switch back
- Graphics persist until cleared

**Viewing Both:**
- Graphics and text can appear together
- Text overlays graphics
- Use both for rich visual output

## Tips and Best Practices

### Saving Your Work

**Regular Saves:**
- Save your project frequently (Disk tab → Save)
- Projects are saved as `.disk` files to your computer
- Browser refresh will lose unsaved work

**Backup Strategy:**
- Keep multiple versions of important projects
- Use descriptive project names
- Save to a location you can find later

### Organizing Projects

**Project Naming:**
- Use descriptive names (e.g., "Game Project", "Math Calculator")
- Include dates or versions if needed (e.g., "Game v2")

**File Organization:**
- Use clear, descriptive file names
- Group related files together
- Use file extensions to indicate file types

**Project Structure:**
- One project = one `.disk` file
- Each project contains one program + multiple data files
- Create separate projects for different applications

### Debugging Programs

**Console for Testing:**
- Use the Console tab to test individual statements
- Check variable values with PRINT or CONSOLE
- Test expressions by typing them directly (auto-evaluates)
- Use CONSOLE in programs for debugging output

**Incremental Development:**
- Write small sections of code
- Test frequently
- Add features one at a time

**Error Messages:**
- Read error messages carefully
- Check line numbers mentioned in errors
- Common issues: typos, missing sigils, type mismatches

**Output Inspection:**
- Check the Output tab for graphics and text
- Use PRINT statements to show variable values
- Verify file operations worked correctly

### Keyboard Shortcuts

**Console Tab:**
- **Enter** - Execute statement
- **Arrow Up** - Previous statement in history
- **Arrow Down** - Next statement in history
- **Type expression** - Automatically evaluates and prints (e.g., `1 + 2`)
- **CONSOLE expression** - Explicitly print expression result to console
- **HELP statement** - Get syntax help for any statement

**Code Tab:**
- Standard text editing shortcuts (Ctrl+C, Ctrl+V, etc.)
- **Tab** - Indentation (if supported by browser)

**General:**
- **Click tabs** - Switch between views
- **Click buttons** - Execute actions
- **Type in fields** - Enter text

### Getting Help

**HELP Statement:**
- Use the `HELP` statement in the Console to get syntax information for any statement
- Type `HELP` followed by the statement name (e.g., `HELP PRINT`, `HELP COLOR`)
- The HELP statement displays all valid syntax forms for the specified statement
- Help output appears in the console (not the output tab)

**Example:**
```
> HELP PRINT
PRINT expression1, expression2, ...
PRINT expression1, expression2, ...;
PRINT array[]
PRINT array[];
PRINT

> HELP COLOR
COLOR foregroundColor%
COLOR foregroundColor%, backgroundColor%
COLOR , backgroundColor%
```

### Debugging with CONSOLE

**CONSOLE Statement:**
- The `CONSOLE` statement evaluates an expression and prints the result to the console
- Useful for debugging and inspecting values during program execution
- Can be used in programs or interactively in the console
- Output appears in the console (not the output tab), keeping it separate from program output

**Example:**
```
> CONSOLE 1 + 2
3
> LET x% = 10
> CONSOLE x% * 2
20
> CONSOLE "Value: " + STR x%
Value: 10
```

**In Program Code:**
```basic
LET result% = calculate()
CONSOLE "Result: " + STR result%
PRINT "Done"
```

**Note:** In the console, typing just an expression (e.g., `1 + 2`) automatically behaves as `CONSOLE 1 + 2`. However, in program code, you must explicitly use `CONSOLE`.

**Language Reference:**
- See the [EduBASIC Language Reference](edu-basic-language.md) for complete language documentation
- All statements, operators, and functions are documented
- Examples provided for each feature

**Learning Resources:**
- Start with simple PRINT statements
- Try graphics operations
- Experiment with variables and loops
- Build up to more complex programs
- Use `HELP` statement to quickly look up statement syntax
- Use expressions directly in console for quick calculations

**Common Tasks:**
- **Run a program:** Code tab → Run button
- **Save work:** Disk tab → Save button
- **Load project:** Disk tab → Load button
- **Create file:** Disk tab → + button
- **View output:** Output tab (auto-shown when program runs)

---

## Conclusion

EduBASIC provides a complete programming environment in your web browser. With the Console for interactive exploration, the Code editor for writing programs, the Disk system for project management, and the Output display for graphics and text, you have everything you need to learn and create with BASIC.

**Remember:**
- Save your work regularly
- Experiment and explore
- Use the Console to test ideas and expressions
- Use CONSOLE for debugging output
- Use HELP to look up statement syntax
- Organize projects with clear names
- Have fun programming!

For complete language documentation, see the [EduBASIC Language Reference](edu-basic-language.md).
