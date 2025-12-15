import { Component } from '@angular/core';
import { WindowComponent, TabsComponent, TabComponent } from 'ng-luna';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    imports: [ CommonModule, WindowComponent, TabsComponent, TabComponent ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent
{
    public title = 'EduBASIC';
}
