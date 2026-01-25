import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { WindowComponent, TabsComponent, TabComponent } from 'ng-luna';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ConsoleComponent } from './console/console.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { DiskComponent } from './disk/disk.component';
import { OutputComponent } from './output/output.component';
import { TabSwitchService } from './tab-switch.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ 
        CommonModule, 
        WindowComponent, 
        TabsComponent, 
        TabComponent,
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

    private readonly destroy$ = new Subject<void>();

    constructor(private readonly tabSwitchService: TabSwitchService)
    {
    }

    public ngOnInit(): void
    {
        this.tabSwitchService.switchTab$
            .pipe(takeUntil(this.destroy$))
            .subscribe(tabId => {
                this.switchToTab(tabId);
            });
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
