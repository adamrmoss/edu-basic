import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { WindowComponent, TabsComponent, TabComponent } from 'ng-luna';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ConsoleComponent } from './console/console.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { FilesComponent } from './files/files.component';
import { OutputComponent } from './output/output.component';
import { TabSwitchService } from './tab-switch.service';

@Component({
    selector: 'app-root',
    imports: [ 
        CommonModule, 
        WindowComponent, 
        TabsComponent, 
        TabComponent,
        ConsoleComponent,
        CodeEditorComponent,
        FilesComponent,
        OutputComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy
{
    @ViewChild('tabsComponent', { static: false })
    public tabsComponent!: TabsComponent;

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
        if (this.tabsComponent)
        {
            const tabs = (this.tabsComponent as any).tabs;
            const tabIndex = tabs?.findIndex((tab: any) => tab.id === tabId);

            if (tabIndex !== undefined && tabIndex >= 0)
            {
                (this.tabsComponent as any).selectTab?.(tabIndex);
            }
        }
    }
}
