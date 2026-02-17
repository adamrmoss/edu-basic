import { Subject } from 'rxjs';
import { AppComponent } from '@/app/app.component';
import { TabSwitchService } from '@/app/tab-switch.service';
import { AudioService } from '@/app/interpreter/audio.service';

describe('AppComponent', () => {
    let switchTabSubject: Subject<string>;
    let tabSwitchService: jest.Mocked<TabSwitchService>;
    let audioService: jest.Mocked<AudioService>;

    beforeEach(() => {
        switchTabSubject = new Subject<string>();

        tabSwitchService = {
            switchTab$: switchTabSubject.asObservable()
        } as any;

        audioService = {
            getMuted: jest.fn(),
            setMuted: jest.fn()
        } as any;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should initialize muted state from AudioService', () => {
        audioService.getMuted.mockReturnValue(true);

        const component = new AppComponent(tabSwitchService, audioService);
        component.ngOnInit();

        expect(component.muted).toBe(true);
    });

    it('should toggle mute and call AudioService', () => {
        audioService.getMuted.mockReturnValue(false);

        const component = new AppComponent(tabSwitchService, audioService);
        component.ngOnInit();

        component.toggleMute();

        expect(component.muted).toBe(true);
        expect(audioService.setMuted).toHaveBeenCalledWith(true);
    });

    it('should ignore switch-to-output requests', () => {
        audioService.getMuted.mockReturnValue(false);

        const component = new AppComponent(tabSwitchService, audioService);
        component.ngOnInit();

        switchTabSubject.next('output');

        expect(component.activeTabId).toBe('console');
    });

    it('should switch active tab id on switchTab$ emissions', () => {
        audioService.getMuted.mockReturnValue(false);

        const component = new AppComponent(tabSwitchService, audioService);

        const tabsComponentMock = {
            activeTabId: 'console',
            selectTab: jest.fn((tabId: string) => {
                tabsComponentMock.activeTabId = tabId;
            })
        };

        (component as any).tabsComponent = tabsComponentMock;

        (component as any).tabs = {
            toArray: () => [ { id: 'console' }, { id: 'disk' } ]
        };

        component.ngOnInit();
        switchTabSubject.next('disk');

        expect(component.activeTabId).toBe('disk');
        expect((component as any).tabsComponent.activeTabId).toBe('disk');
        expect((component as any).tabsComponent.selectTab).toHaveBeenCalledWith('disk');
    });

    it('should report disk tab active from tabsComponent when available', () => {
        audioService.getMuted.mockReturnValue(false);

        const component = new AppComponent(tabSwitchService, audioService);

        (component as any).tabsComponent = {
            activeTabId: 'disk'
        };

        expect(component.isDiskTabActive()).toBe(true);
    });

    it('should report disk tab active from activeTabId when tabsComponent not available', () => {
        audioService.getMuted.mockReturnValue(false);

        const component = new AppComponent(tabSwitchService, audioService);
        component.activeTabId = 'disk';

        expect(component.isDiskTabActive()).toBe(true);
    });

    it('should stop reacting to switchTab$ after destroy', () => {
        audioService.getMuted.mockReturnValue(false);

        const component = new AppComponent(tabSwitchService, audioService);
        component.ngOnInit();

        component.ngOnDestroy();

        switchTabSubject.next('disk');
        expect(component.activeTabId).toBe('console');
    });
});

