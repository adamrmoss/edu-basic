import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { WindowComponent, TabsComponent, TabComponent, IconComponent, X, Check } from 'ng-luna';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ConsoleComponent } from './console/console.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { DiskComponent } from './disk/disk.component';
import { OutputComponent } from './output/output.component';
import { TabSwitchService } from './tab-switch.service';
import { AudioService } from './interpreter/audio.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ 
        CommonModule, 
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
    @ViewChild('tabsComponent', { static: false })
    public tabsComponent!: TabsComponent;

    @ViewChildren(TabComponent)
    public tabs!: QueryList<TabComponent>;

    public title = 'EduBASIC';
    public activeTabId: string = 'console';
    public muted: boolean = false;
    public readonly muteIcon = X;
    public readonly unmuteIcon = Check;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly tabSwitchService: TabSwitchService,
        private readonly audioService: AudioService
    )
    {
    }

    public ngOnInit(): void
    {
        this.tabSwitchService.switchTab$
            .pipe(takeUntil(this.destroy$))
            .subscribe(tabId => {
                this.switchToTab(tabId);
            });
        
        this.muted = this.audioService.getMuted();
    }

    public toggleMute(): void
    {
        this.muted = !this.muted;
        this.audioService.setMuted(this.muted);
    }

    public isDiskTabActive(): boolean
    {
        if (this.tabsComponent)
        {
            const tabsComponentAny = this.tabsComponent as any;
            return tabsComponentAny.activeTabId === 'disk';
        }
        
        return this.activeTabId === 'disk';
    }

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

        this.activeTabId = tabId;

        if (this.tabsComponent && this.tabs)
        {
            const tabArray = this.tabs.toArray();
            const tabIndex = tabArray.findIndex((tab: any) => tab.id === tabId);

            if (tabIndex >= 0)
            {
                const tabsComponentAny = this.tabsComponent as any;
                tabsComponentAny.activeTabId = tabId;
                tabsComponentAny.updateActiveTab();
            }
        }
    }
}
