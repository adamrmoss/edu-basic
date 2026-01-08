import { Component } from '@angular/core';
import { WindowComponent, TabsComponent, TabComponent } from 'ng-luna';
import { CommonModule } from '@angular/common';
import { ConsoleComponent } from './console/console.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { FilesComponent } from './files/files.component';
import { OutputComponent } from './output/output.component';

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
export class AppComponent
{
    public title = 'EduBASIC';
}
