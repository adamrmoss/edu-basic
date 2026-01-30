import { ElementRef } from '@angular/core';
import { TextEditorComponent } from '../src/app/text-editor/text-editor.component';

describe('TextEditorComponent', () =>
{
    afterEach(() =>
    {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    function createComponent(): TextEditorComponent
    {
        const cdr = { detectChanges: jest.fn() } as any;
        return new TextEditorComponent(cdr);
    }

    it('setCode updates lines, emits, and updates lineNumbers without a textarea element', () =>
    {
        const component = createComponent();
        const emitSpy = jest.spyOn(component.linesChange, 'emit');

        component.setCode('a\nb\nc');

        expect(component.getCode()).toBe('a\nb\nc');
        expect(emitSpy).toHaveBeenCalledWith(['a', 'b', 'c']);
        expect(component.lineNumbers).toEqual([1, 2, 3]);
    });

    it('ngOnChanges updates lineNumbers when textarea element is not initialized', () =>
    {
        const component = createComponent();
        component.lines = ['x', 'y'];

        component.ngOnChanges({ lines: { currentValue: component.lines } } as any);

        expect(component.lineNumbers).toEqual([1, 2]);
    });

    it('updateLineNumbers falls back when canvas context is unavailable', () =>
    {
        const component = createComponent();
        const textarea = document.createElement('textarea');
        textarea.value = 'hello';
        Object.defineProperty(textarea, 'clientWidth', { value: 200 });

        (component as any).textareaElement = textarea;
        component.lines = ['hello', 'world'];

        jest.spyOn(window, 'getComputedStyle').mockReturnValue({
            fontSize: '14px',
            fontFamily: 'monospace',
            paddingLeft: '0',
            paddingRight: '0'
        } as any);

        const getContextSpy = jest.spyOn(HTMLCanvasElement.prototype as any, 'getContext').mockReturnValue(null);

        (component as any).updateLineNumbers();

        expect(getContextSpy).toHaveBeenCalled();
        expect(component.lineNumbers).toEqual([1, 2]);
    });

    it('updateLineNumbers creates visual line markers for wrapped lines', () =>
    {
        const component = createComponent();
        const textarea = document.createElement('textarea');
        Object.defineProperty(textarea, 'clientWidth', { value: 60 });
        (component as any).textareaElement = textarea;

        jest.spyOn(window, 'getComputedStyle').mockReturnValue({
            fontSize: '14px',
            fontFamily: 'monospace',
            paddingLeft: '0',
            paddingRight: '0'
        } as any);

        jest.spyOn(HTMLCanvasElement.prototype as any, 'getContext').mockReturnValue({
            font: '',
            measureText: () => ({ width: 10 })
        } as any);

        component.lines = ['abcdefghij', 'k'];
        (component as any).updateLineNumbers();

        expect(component.lineNumbers[0]).toBe(1);
        expect(component.lineNumbers).toContain(-1);
        expect(component.lineNumbers).toContain(2);
    });

    it('line selection helpers work and respect readonly on mouse down', () =>
    {
        const component = createComponent();
        component.lines = ['a', 'b', 'c'];

        const textarea = document.createElement('textarea');
        textarea.value = 'a\nb\nc';
        textarea.selectionStart = 0;
        (component as any).textareaElement = textarea;

        component.readonly = true;
        component.onLineNumberMouseDown({ preventDefault: jest.fn() } as any, 1);
        expect(component.isDragging).toBe(false);

        component.readonly = false;
        const selectionSpy = jest.spyOn(textarea, 'setSelectionRange');
        const emitSpy = jest.spyOn(component.lineSelectionChange, 'emit');

        component.onLineNumberMouseDown({ preventDefault: jest.fn() } as any, 1);
        expect(component.isDragging).toBe(true);
        expect(selectionSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith({ start: 1, end: 1 });

        component.onLineNumberMouseEnter({} as any, 2);
        expect(component.isLineSelected(1)).toBe(true);
        expect(component.isLineSelected(2)).toBe(true);
    });

    it('scroll sync updates lineNumbers scrollTop', () =>
    {
        const component = createComponent();
        const lineDiv = document.createElement('div');
        (component as any).lineNumbersElement = lineDiv;

        const textarea = document.createElement('textarea');
        textarea.scrollTop = 123;

        component.onTextAreaScroll({ target: textarea } as any);
        expect(lineDiv.scrollTop).toBe(123);
    });

    it('cursor helpers compute and set positions', () =>
    {
        const component = createComponent();
        component.setCode('a\nbb\nccc');

        const textarea = document.createElement('textarea');
        textarea.value = 'a\nbb\nccc';
        textarea.selectionStart = 5;
        (component as any).textareaElement = textarea;

        expect(component.getCursorLineIndex()).toBe(2);
        component.setCursorPosition(1);
        expect(component.getCursorPosition()).toBe(1);
    });

    it('ngAfterViewInit wires up elements and registers/unregisters handlers', () =>
    {
        jest.useFakeTimers();

        const component = createComponent();
        const textarea = document.createElement('textarea');
        Object.defineProperty(textarea, 'clientWidth', { value: 200 });
        const lineDiv = document.createElement('div');

        component.codeTextareaRef = new ElementRef(textarea);
        component.lineNumbersRef = new ElementRef(lineDiv);

        const addWindowSpy = jest.spyOn(window, 'addEventListener');
        const addDocSpy = jest.spyOn(document, 'addEventListener');
        const removeWindowSpy = jest.spyOn(window, 'removeEventListener');
        const removeDocSpy = jest.spyOn(document, 'removeEventListener');

        component.ngAfterViewInit();
        jest.runAllTimers();

        expect(addWindowSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(addDocSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
        expect(addDocSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

        component.ngOnDestroy();
        expect(removeWindowSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(removeDocSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
        expect(removeDocSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });
});

