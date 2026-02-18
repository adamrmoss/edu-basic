import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { WindowComponent, TabsComponent, TabComponent, IconComponent, X, Check } from 'ng-luna';
import { Subject, takeUntil } from 'rxjs';
import { ConsoleComponent } from './console/console.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { DiskComponent } from './disk/disk.component';
import { OutputComponent } from './output/output.component';
import { TabSwitchService } from './tab-switch.service';
import { AudioService } from './interpreter/audio.service';

/**
 * Root application component.
 *
 * Hosts the main tabbed UI (console, editor, disk, output) and coordinates
 * cross-cutting UI actions such as tab switching and audio mute state.
 */
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        OverlayModule,
        WindowComponent,
        TabsComponent,
        TabComponent,
        IconComponent,
        ConsoleComponent,
        CodeEditorComponent,
        DiskComponent,
        OutputComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy
{
    /**
     * Reference to the rendered tab control component.
     */
    @ViewChild('tabsComponent', { static: false })
    public tabsComponent!: TabsComponent;

    /**
     * Collection of rendered tab components.
     */
    @ViewChildren(TabComponent)
    public tabs!: QueryList<TabComponent>;

    /**
     * Title displayed in the application window chrome.
     */
    public title = 'EduBASIC';

    /**
     * Currently active tab id.
     */
    public activeTabId: string = 'console';

    /**
     * Whether audio output is currently muted.
     */
    public muted: boolean = false;

    /**
     * Icon used when audio is muted.
     */
    public readonly muteIcon = X;

    /**
     * Icon used when audio is not muted.
     */
    public readonly unmuteIcon = Check;

    private readonly destroy$ = new Subject<void>();

    /**
     * Create a new root app component.
     *
     * @param tabSwitchService Tab switch event bus.
     * @param audioService Audio service used for mute state.
     */
    constructor(
        private readonly tabSwitchService: TabSwitchService,
        private readonly audioService: AudioService
    )
    {
    }

    /**
     * Initialize tab-switch subscriptions and load initial mute state.
     */
    public ngOnInit(): void
    {
        // Subscribe to tab-switch requests and load initial mute state from the audio service.
        this.tabSwitchService.switchTab$
            .pipe(takeUntil(this.destroy$))
            .subscribe(tabId => {
                this.switchToTab(tabId);
            });

        this.muted = this.audioService.getMuted();
    }

    /**
     * Toggle the audio mute state.
     */
    public toggleMute(): void
    {
        this.muted = !this.muted;
        this.audioService.setMuted(this.muted);
    }

    /**
     * Determine whether the Disk tab is currently active.
     */
    public isDiskTabActive(): boolean
    {
        if (this.tabsComponent)
        {
            return this.tabsComponent.activeTabId === 'disk';
        }
        
        return this.activeTabId === 'disk';
    }

    /**
     * Clean up subscriptions created by this component.
     */
    public ngOnDestroy(): void
    {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private switchToTab(tabId: string): void
    {
        if (tabId === 'output')
        {
            return;
        }

        // Update active tab id and select the tab by id when the tab component is ready.
        this.activeTabId = tabId;

        if (this.tabsComponent && this.tabs)
        {
            const tabArray = this.tabs.toArray();
            const tabIndex = tabArray.findIndex((tab: TabComponent) => tab.id === tabId);

            if (tabIndex >= 0)
            {
                this.tabsComponent.selectTab(tabId);
            }
        }
    }
}
